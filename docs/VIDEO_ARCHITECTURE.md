# Frontend Development LMS — Google Drive Video Architecture

## 1. Overview & Core Philosophy

Course video assets are stored in **private Google Drive folders** connected via OAuth 2.0 to the LMS backend server.

### Critical Requirement (Section 24 of MASTER_SYSTEM_SPEC.md)
The system **never embeds Google Drive iframe preview tags** directly in the student front-end application.
- Public Google Drive links are never exposed to browser client code.
- Media streaming occurs via a Next.js server-side media proxy route handler (`/api/video/stream/[lessonId]`).
- Auth token management is entirely server-to-server (`Next.js Server <-> Google OAuth`).

---

## 2. End-to-End Media Access & Delivery Flow

```text
[ Student Browser ]
       |
  1. Requests lesson page: /dashboard/course/lessons/[lessonId]
       |
  2. Custom Video Player initiates stream fetch: /api/video/stream/[lessonId]
       v
[ Next.js Server (Route Handler) ]
       |
  3. Validate Supabase Session (JWT Cookie)
  4. Check Profile & Active Enrollment Status (enrollments.status = 'active')
  5. Fetch Lesson Video Metadata (lessons.video_external_id)
  6. Fetch Google OAuth Access Token (automatically refreshed using Refresh Token)
       |
  7. Request Byte-Stream from Google Drive API:
     https://www.googleapis.com/drive/v3/files/{video_external_id}?alt=media
       v
[ Google Drive API ]
       |
  8. Returns binary MP4 video chunk stream
       v
[ Next.js Server ]
       |
  9. Pipes HTTP range response (206 Partial Content / 200 OK) to Custom LMS Player
       v
[ Custom LMS HTML5 Video Player ]
  - Plays video with LMS branded UI
  - Renders dynamic user watermark overlay
  - Pings lesson_progress table at 80% completion threshold
```

---

## 3. Video Provider Abstraction Interface

To prevent tight coupling between course lessons and Google Drive, the codebase uses a provider abstraction layer.

### Conceptual Provider Structure (`src/lib/video/provider.js`)

```javascript
/**
 * Abstract Video Provider Interface pattern
 */
export class VideoProvider {
  /**
   * Normalize input source (URL or raw ID) to normalized ID
   * @param {string} source 
   * @returns {string} normalized ID
   */
  normalizeId(source) {
    throw new Error('Not implemented');
  }

  /**
   * Verify source existence and access rights on provider API
   * @param {string} sourceId 
   * @returns {Promise<{ valid: boolean, filename?: string, duration?: number, mimeType?: string }>}
   */
  async verifySource(sourceId) {
    throw new Error('Not implemented');
  }

  /**
   * Obtain authorized playback media stream or proxy context
   * @param {string} sourceId 
   * @param {object} userContext 
   * @returns {Promise<Response>}
   */
  async getPlaybackStream(sourceId, userContext) {
    throw new Error('Not implemented');
  }
}
```

### Google Drive Implementation (`src/lib/video/providers/google-drive.js`)

Normalizes inputs:
- `https://drive.google.com/file/d/1A2B3C4D5E6F/view?usp=sharing` -> `1A2B3C4D5E6F`
- `https://drive.google.com/open?id=1A2B3C4D5E6F` -> `1A2B3C4D5E6F`
- `1A2B3C4D5E6F` -> `1A2B3C4D5E6F`

---

## 4. Custom LMS Video Player Controls & Watermarking

### Player Features:
1. Branded controls (Play/Pause, Custom Progress Bar, Time Display, Volume/Mute, Playback Rate [0.5x to 2x], Fullscreen).
2. Keyboard Shortcuts (Space to Pause, Left/Right Arrows for 5s seek, F for Fullscreen).
3. **Dynamic Watermark Overlay:**
   - Floating semi-transparent text layer overlaid on top of canvas/video container.
   - Content: `{Student Full Name} | {Masked Email: al***@domain.com} | ID: {User Short UUID}`
   - Changes position randomly every 30 seconds to hinder automated cropping tools.
4. **Progress Persistence:**
   - Periodically pings `/api/video/progress` every 15 seconds with current `currentTime`.
   - When playback passes 80% of `duration`, marks lesson as completed in `lesson_progress`.
