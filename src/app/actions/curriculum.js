'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { requireAdminRole, getCurrentProfile } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';
import { normalizeDriveId } from '@/lib/video/providers/google-drive';
import { slugify } from '@/lib/utils';

/**
 * Save or update Course
 */
export async function saveCourseAction(formData) {
  await requireAdminRole();
  const supabase = await createAdminClient();

  const id = formData.get('id');
  const title = formData.get('title');
  const slug = formData.get('slug') || title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const description = formData.get('description');
  const priceBdt = parseFloat(formData.get('priceBdt') || '0');
  const bkashNumber = formData.get('bkashNumber') || '01700000000';
  const isPublished = formData.get('isPublished') === 'true';

  if (!title) return { error: 'Course title is required' };

  const payload = {
    title,
    slug,
    description,
    price_bdt: priceBdt,
    bkash_number: bkashNumber,
    is_published: isPublished,
    updated_at: new Date().toISOString(),
  };

  let error;
  if (id) {
    ({ error } = await supabase.from('courses').update(payload).eq('id', id));
  } else {
    ({ error } = await supabase.from('courses').insert(payload));
  }

  if (error) return { error: error.message };

  revalidatePath('/admin/courses');
  revalidatePath('/dashboard');
  return { success: 'Course saved successfully!' };
}

/**
 * Delete Course
 */
export async function deleteCourseAction(courseId) {
  await requireAdminRole();
  const supabase = await createAdminClient();

  const { error } = await supabase.from('courses').delete().eq('id', courseId);
  if (error) return { error: error.message };

  revalidatePath('/admin/courses');
  revalidatePath('/dashboard');
  return { success: 'Course deleted.' };
}

/**
 * Create or update Module
 */
export async function saveModuleAction(formData) {
  await requireAdminRole();
  const supabase = await createAdminClient();

  const id = formData.get('id');
  const courseId = formData.get('courseId') || 'a1b2c3d4-e5f6-7890-abcd-111111111111';
  const title = formData.get('title');
  const description = formData.get('description');
  const position = parseInt(formData.get('position') || '1', 10);
  const monthNumber = parseInt(formData.get('monthNumber') || formData.get('position') || '1', 10);

  if (!title) return { error: 'Module title is required' };

  const payload = {
    course_id: courseId,
    title,
    description,
    position,
    month_number: monthNumber,
  };

  let error;
  if (id) {
    ({ error } = await supabase.from('modules').update(payload).eq('id', id));
  } else {
    ({ error } = await supabase.from('modules').insert(payload));
  }

  if (error) return { error: error.message };

  revalidatePath(`/admin/courses/${courseId}/modules`);
  revalidatePath('/admin/course/modules');
  revalidatePath('/dashboard');
  return { success: 'Module saved successfully!' };
}

/**
 * Delete Module
 */
export async function deleteModuleAction(moduleId) {
  await requireAdminRole();
  const supabase = await createAdminClient();

  const { error } = await supabase.from('modules').delete().eq('id', moduleId);
  if (error) return { error: error.message };

  revalidatePath('/admin/courses');
  revalidatePath('/dashboard');
  return { success: 'Module deleted.' };
}

/**
 * Create or update Lesson (linked directly to Module)
 */
export async function saveLessonAction(formData) {
  await requireAdminRole();
  const supabase = await createAdminClient();

  const id = formData.get('id');
  const moduleId = formData.get('moduleId') || formData.get('weekId');
  const title = formData.get('title');
  const summary = formData.get('summary');
  const contentMarkdown = formData.get('contentMarkdown');
  const lessonType = formData.get('lessonType') || 'video';
  const videoProvider = formData.get('videoProvider') || 'google_drive';
  const rawVideoSource = formData.get('videoExternalId') || '';
  const durationSeconds = parseInt(formData.get('durationSeconds') || '0', 10);
  const position = parseInt(formData.get('position') || '1', 10);
  const isPreview = formData.get('isPreview') === 'true';
  const isPublishedRaw = formData.get('isPublished');
  const isPublished = isPublishedRaw !== null ? isPublishedRaw === 'true' : true;

  const taskTitle = formData.get('taskTitle') || null;
  const taskInstructions = formData.get('taskInstructions') || null;
  const taskMarks = parseInt(formData.get('taskMarks') || '100', 10);
  const taskDueDate = formData.get('taskDueDate') || null;
  const zoomLink = formData.get('zoomLink')?.trim() || null;
  const liveMeetingDate = formData.get('liveMeetingDate') || null;
  const referencesJson = formData.get('referencesJson');

  if (!title || !moduleId) return { error: 'Lesson title and Module selection are required' };

  // Normalize Drive Video ID (if provided)
  const videoExternalId = rawVideoSource ? normalizeDriveId(rawVideoSource) : null;

  const payload = {
    module_id: moduleId,
    title,
    summary,
    content_markdown: contentMarkdown,
    lesson_type: lessonType,
    video_provider: videoProvider,
    video_external_id: videoExternalId,
    video_duration_seconds: durationSeconds,
    position,
    is_preview: isPreview,
    is_published: isPublished,
    task_title: taskTitle,
    task_instructions: taskInstructions,
    task_marks: taskMarks,
    task_due_date: taskDueDate || null,
    zoom_link: zoomLink,
    live_meeting_date: liveMeetingDate || null,
    updated_at: new Date().toISOString(),
  };

  let savedLessonId = id;
  let error;
  if (id) {
    ({ error } = await supabase.from('lessons').update(payload).eq('id', id));
  } else {
    const { data: newLesson, error: insertError } = await supabase
      .from('lessons')
      .insert(payload)
      .select('id')
      .single();
    error = insertError;
    savedLessonId = newLesson?.id;
  }

  // Graceful fallback if zoom_link or live_meeting_date columns are not yet created in Supabase
  if (error && (error.message?.includes('zoom_link') || error.message?.includes('live_meeting_date'))) {
    console.warn('Live class columns not found, retrying with fallback payload...');
    const fallbackPayload = { ...payload };
    delete fallbackPayload.zoom_link;
    delete fallbackPayload.live_meeting_date;
    if (id) {
      ({ error } = await supabase.from('lessons').update(fallbackPayload).eq('id', id));
    } else {
      const { data: newLesson, error: insertError } = await supabase
        .from('lessons')
        .insert(fallbackPayload)
        .select('id')
        .single();
      error = insertError;
      savedLessonId = newLesson?.id;
    }
  }

  if (error) {
    console.error('saveLessonAction Error:', error);
    return { error: error.message };
  }

  // Save References if provided
  if (referencesJson && savedLessonId) {
    try {
      const references = JSON.parse(referencesJson);
      if (Array.isArray(references)) {
        await supabase.from('resources').delete().eq('lesson_id', savedLessonId);
        if (references.length > 0) {
          const resourceRowsWithDesc = references.map((ref) => ({
            lesson_id: savedLessonId,
            title: ref.title,
            description: ref.description || '',
            url: ref.url,
            resource_type: 'link',
          }));
          const { error: insErr } = await supabase.from('resources').insert(resourceRowsWithDesc);
          if (insErr) {
            // Fallback without description column in case live schema doesn't have it
            console.warn('Inserting resources with description failed, retrying without description:', insErr.message);
            const fallbackRows = references.map((ref) => ({
              lesson_id: savedLessonId,
              title: ref.title,
              url: ref.url,
              resource_type: 'link',
            }));
            const { error: fallbackErr } = await supabase.from('resources').insert(fallbackRows);
            if (fallbackErr) {
              console.error('Failed to insert resources fallback:', fallbackErr);
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse references JSON:', e);
    }
  }

  revalidatePath('/admin/courses');
  revalidatePath('/dashboard');
  return { success: 'Lesson saved successfully!' };
}

/**
 * Fetch lesson resources using admin client (bypasses RLS issues)
 */
export async function getLessonResourcesAction(lessonId) {
  if (!lessonId) return [];
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('lesson_id', lessonId);
  if (error) {
    console.error('getLessonResourcesAction error:', error);
    return [];
  }
  return data || [];
}

/**
 * Fetch lesson, module hierarchy, and resources for the student lesson viewer
 * Uses admin client so unlinked week_id lessons and resources load seamlessly
 */
export async function getLessonViewerDataAction(lessonIdentifier, moduleIdentifier) {
  const supabase = await createAdminClient();

  const isUuid = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str || '');

  // 1. Fetch published lessons and modules in parallel
  const [{ data: allLessons, error: lErr }, { data: allMods }] = await Promise.all([
    supabase
      .from('lessons')
      .select('*')
      .eq('is_published', true)
      .order('position', { ascending: true }),
    supabase
      .from('modules')
      .select('*, courses(*)')
      .order('month_number', { ascending: true }),
  ]);

  if (lErr || !allLessons) {
    console.error('Error fetching lessons:', lErr);
    return { error: 'Failed to load lessons' };
  }

  // Find target lesson
  let targetLesson = null;
  if (isUuid(lessonIdentifier)) {
    targetLesson = allLessons.find((l) => l.id === lessonIdentifier);
  } else {
    targetLesson = allLessons.find(
      (l) => l.slug === lessonIdentifier || slugify(l.title) === lessonIdentifier || l.id === lessonIdentifier
    );
  }

  if (!targetLesson) {
    return { error: 'Lesson not found' };
  }

  let targetModule = null;
  const rawMod = moduleIdentifier || targetLesson.module_id;
  if (isUuid(rawMod)) {
    targetModule = (allMods || []).find((m) => m.id === rawMod);
  } else {
    targetModule = (allMods || []).find(
      (m) =>
        m.slug === rawMod ||
        slugify(m.title) === rawMod ||
        `module-${m.month_number}` === rawMod ||
        m.id === rawMod
    );
  }

  if (!targetModule && targetLesson.module_id) {
    targetModule = (allMods || []).find((m) => m.id === targetLesson.module_id);
  }

  // 3. Build course modules tree
  const courseId = targetModule?.course_id;
  const courseMods = courseId
    ? (allMods || []).filter((m) => m.course_id === courseId)
    : (allMods || []);

  const courseModulesList = courseMods.map((mod) => {
    const mLessons = (allLessons || [])
      .filter((l) => l.module_id === mod.id)
      .map((l) => ({
        ...l,
        slug: l.slug || slugify(l.title) || l.id,
      }));

    return {
      ...mod,
      slug: mod.slug || slugify(mod.title) || `module-${mod.month_number}`,
      lessons: mLessons,
    };
  });

  // 4. Fetch references for target lesson
  const { data: refData } = await supabase
    .from('resources')
    .select('*')
    .eq('lesson_id', targetLesson.id);

  return {
    lesson: targetLesson,
    moduleData: targetModule,
    courseModulesList,
    references: refData || [],
  };
}

/**
 * Delete Lesson
 */
export async function deleteLessonAction(lessonId) {
  await requireAdminRole();
  const supabase = await createAdminClient();

  const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
  if (error) return { error: error.message };

  revalidatePath('/admin/courses');
  revalidatePath('/dashboard');
  return { success: 'Lesson deleted.' };
}

/**
 * Submit student task / assignment for a lesson
 */
export async function submitTaskAction(lessonId, githubUrl, liveUrl, textContent = '') {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Authentication required' };
  if (!lessonId) return { error: 'Lesson ID is required' };
  if (!githubUrl) return { error: 'GitHub repository URL is required' };

  const adminSupabase = await createAdminClient();

  // Remove any previous submission for this lesson by this user (allows re-submission)
  await adminSupabase
    .from('submissions')
    .delete()
    .eq('lesson_id', lessonId)
    .eq('user_id', user.id);

  const { error } = await adminSupabase.from('submissions').insert({
    lesson_id: lessonId,
    user_id: user.id,
    github_repo_url: githubUrl,
    live_deploy_url: liveUrl || null,
    text_content: textContent || null,
    status: 'submitted',
  });

  if (error) {
    console.error('submitTaskAction error:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/admin/submissions');
  return { success: 'Assignment submitted successfully!' };
}

/**
 * Review / grade a student submission (Admin only)
 */
export async function reviewSubmissionAction(submissionId, { score, status, feedback }) {
  await requireAdminRole();
  const profile = await getCurrentProfile();
  if (!profile) return { error: 'Admin authentication required' };

  if (!submissionId) return { error: 'Submission ID is required' };
  if (!status) return { error: 'Status is required' };

  const validStatuses = ['submitted', 'under_review', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return { error: 'Invalid submission status' };
  }

  const supabase = await createAdminClient();

  const parsedScore = score !== '' && score !== null && score !== undefined 
    ? parseInt(score, 10) 
    : null;

  // Insert review entry into submission_reviews
  const { error: reviewError } = await supabase.from('submission_reviews').insert({
    submission_id: submissionId,
    reviewer_id: profile.id,
    score: isNaN(parsedScore) ? null : parsedScore,
    feedback: feedback || '',
    status_assigned: status,
  });

  if (reviewError) {
    console.error('reviewSubmissionAction review insert error:', reviewError);
    return { error: reviewError.message };
  }

  // Update submission status
  const { error: updateError } = await supabase
    .from('submissions')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', submissionId);

  if (updateError) {
    console.error('reviewSubmissionAction submission update error:', updateError);
    return { error: updateError.message };
  }

  revalidatePath('/admin/submissions');
  revalidatePath('/admin');
  revalidatePath('/dashboard');

  return { success: 'Review saved successfully!' };
}

/**
 * Fetch current student's submission and reviews for a specific lesson
 */
export async function getStudentSubmissionForLessonAction(lessonId) {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !lessonId) return { submission: null };

  const adminSupabase = await createAdminClient();
  const { data: submission, error } = await adminSupabase
    .from('submissions')
    .select(`
      id,
      lesson_id,
      user_id,
      github_repo_url,
      live_deploy_url,
      text_content,
      status,
      created_at,
      updated_at,
      submission_reviews (
        id,
        score,
        feedback,
        status_assigned,
        created_at,
        profiles:reviewer_id (full_name)
      )
    `)
    .eq('lesson_id', lessonId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('getStudentSubmissionForLessonAction error:', error);
    return { submission: null, error: error.message };
  }

  if (submission?.submission_reviews?.length > 1) {
    submission.submission_reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return { submission };
}

