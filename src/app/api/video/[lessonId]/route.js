import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getValidAccessToken } from '@/lib/video/providers/google-drive';
import { NextResponse } from 'next/server';

/**
 * Secure Video Streaming Proxy
 * Route: GET /api/video/[lessonId]
 *
 * Architecture (per spec Section 28 & 29):
 * Student Browser → LMS Server → Google Drive API → Streamed Response
 *
 * Security guarantees:
 * 1. User must be authenticated
 * 2. User must have ACTIVE enrollment for the course containing this lesson
 * 3. Access tokens are NEVER exposed to the client
 * 4. Raw Google Drive URLs are NEVER sent to the browser
 * 5. Supports HTTP Range requests for video seek support
 */
// In-memory authorization cache for instant video Range requests (TTL 5 minutes)
const lessonAuthCache = new Map();

export async function GET(request, { params }) {
  const { lessonId } = await params;
  const rangeHeader = request.headers.get('range');

  // 1. Authenticate user via Supabase session cookie
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new NextResponse('Unauthorized: Authentication required', { status: 401 });
  }

  const cacheKey = `${user.id}:${lessonId}`;
  let fileId = null;
  const cachedAuth = lessonAuthCache.get(cacheKey);

  if (cachedAuth && cachedAuth.expiresAt > Date.now()) {
    fileId = cachedAuth.fileId;
  } else {
    // 2. Fetch lesson details
    const adminSupabase = await createAdminClient();
    const { data: lesson, error: lessonError } = await adminSupabase
      .from('lessons')
      .select('*, modules(course_id), weeks(module_id, modules(course_id))')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return new NextResponse('Lesson not found', { status: 404 });
    }

    if (!lesson.is_published && !lesson.is_preview) {
      return new NextResponse('Lesson not available', { status: 403 });
    }

    // 3. Verify enrollment if not a free preview lesson
    if (!lesson.is_preview) {
      // Support both: direct module_id link (new) and legacy week_id link (old)
      const courseId =
        lesson.modules?.course_id ||
        lesson.weeks?.modules?.course_id;
      if (!courseId) {
        return new NextResponse('Course configuration error: lesson not linked to a module', { status: 500 });
      }

      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('status')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (enrollmentError || !enrollment || enrollment.status !== 'active') {
        return new NextResponse('Forbidden: Active enrollment required to access this lesson', { status: 403 });
      }
    }

    fileId = lesson.video_external_id;
    if (!fileId) {
      return new NextResponse('No video file configured for this lesson', { status: 404 });
    }

    // Cache valid authorization for 5 minutes
    lessonAuthCache.set(cacheKey, {
      fileId,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
  }

  // 5. Get valid OAuth access token (auto-refreshes if expired)
  const auth = await getValidAccessToken();
  if (!auth || !auth.accessToken) {
    return new NextResponse('Video service unavailable: Google Drive account not connected', { status: 503 });
  }

  // 6. Stream video from Google Drive via authorized API
  // Supports HTTP Range header for video seek/scrubbing functionality
  const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const fetchHeaders = {
    Authorization: `Bearer ${auth.accessToken}`,
  };

  if (rangeHeader) {
    fetchHeaders['Range'] = rangeHeader;
  }

  try {
    const driveResponse = await fetch(driveUrl, {
      headers: fetchHeaders,
    });

    if (!driveResponse.ok) {
      if (driveResponse.status === 404) {
        return new NextResponse('Video file not found on Google Drive', { status: 404 });
      }
      if (driveResponse.status === 403) {
        return new NextResponse('Access denied: Check Google Drive file permissions', { status: 403 });
      }
      return new NextResponse(`Video service error: ${driveResponse.statusText}`, {
        status: driveResponse.status,
      });
    }

    // Build response headers for proper video streaming
    const responseHeaders = new Headers();
    const contentType = driveResponse.headers.get('content-type') || 'video/mp4';
    const contentLength = driveResponse.headers.get('content-length');
    const contentRange = driveResponse.headers.get('content-range');

    responseHeaders.set('Content-Type', contentType);
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    responseHeaders.set('X-Content-Type-Options', 'nosniff');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');

    if (contentLength) responseHeaders.set('Content-Length', contentLength);
    if (contentRange) responseHeaders.set('Content-Range', contentRange);

    const statusCode = driveResponse.status;

    return new NextResponse(driveResponse.body, {
      status: statusCode,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('[VideoProxy] Stream error:', err.message);
    return new NextResponse('Failed to stream video', { status: 500 });
  }
}
