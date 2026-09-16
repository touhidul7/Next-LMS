# Frontend Development LMS — Master System Specification

> **Purpose:** This document is the single source of truth for building a production-ready LMS for a 4-month Frontend Development course.
>
> **Primary AI development environments:** OpenAI Codex, Antigravity, or another repository-aware coding agent.
>
> **Important:** Do not try to build the entire system in one pass. Follow the phased implementation plan in this document.

---

# 1. Project Overview

Build a modern, secure, production-ready LMS for a **single flagship Frontend Development course**.

The platform should initially behave as a single-course education website rather than a marketplace, but the database and code architecture must be clean enough to support additional courses in the future without a major rewrite.

The platform has three main areas:

1. **Public course website / landing page**
2. **Student LMS**
3. **Admin + Mentor management system**

The platform must support:

- manual bKash payment
- student account creation during checkout
- payment approval by admin
- pending enrollment state
- protected course access
- 16-week curriculum
- Google Drive-hosted course videos
- private video playback through the LMS
- lesson progress
- assignments
- projects
- GitHub/live URL submissions
- mentor feedback
- resubmissions
- resources
- announcements
- internal notifications
- student progress tracking
- admin CMS
- mentor review system
- future extensibility

---

# 2. Technology Stack

Use:

- **Next.js**
- **App Router**
- **TypeScript**
- **Supabase**
  - PostgreSQL
  - Auth
  - Storage
  - Row Level Security
- **Tailwind CSS**
- **shadcn/ui**
- **React Hook Form**
- **Zod**
- **Lucide React**
- **date-fns**
- **Sonner**
- **TipTap** or another robust rich-text editor if needed

Optional later:

- Recharts
- Resend
- Framer Motion
- email notifications
- WhatsApp integration
- analytics
- certificate generation

## General framework rules

Use Server Components by default.

Use Client Components only when browser interaction requires them.

Sensitive mutations must happen server-side.

Never expose:

- Supabase service-role key
- Google OAuth refresh token
- Google OAuth access token
- Google client secret
- encryption keys

to browser-side code.

Do not place secrets inside variables prefixed with:

```env
NEXT_PUBLIC_
```

---

# 3. Course Source Structure

The platform is designed around a **4-month / 16-week Frontend Development program**.

The course takes an absolute beginner toward building and deploying professional frontend projects.

The learning path includes:

- web fundamentals
- HTML
- CSS
- responsive design
- Bootstrap
- Tailwind CSS
- JavaScript
- DOM
- modern JavaScript
- asynchronous JavaScript
- REST APIs
- Axios
- React
- hooks
- React Router
- advanced React structure
- Git
- GitHub
- animation
- Lenis
- Framer Motion
- professional project architecture
- deployment
- final capstone

The teaching philosophy is:

```text
Learn
→ Practice
→ Build
→ Challenge
```

A class can contain:

1. Concept
2. Live Coding
3. Guided Practice
4. Challenge
5. Mini Task / Homework
6. Review

The LMS must therefore support more than standard video lessons.

---

# 4. Course Curriculum

## Month 1 — Web Fundamentals

### Week 1 — Introduction to the Web

Topics may include:

- what is a website
- how the internet works
- browser vs server
- frontend vs backend
- what happens when a URL is entered
- HTML, CSS and JavaScript roles
- domains
- hosting
- HTTP / HTTPS
- browser developer tools
- editor setup
- VS Code basics
- file and folder structure
- first website

### Mini Project

**Personal Introduction Page**

Possible sections:

- Profile
- About
- Skills
- Contact
- Social links

---

### Week 2 — HTML

Topics may include:

- document structure
- html
- head
- body
- headings
- paragraphs
- links
- images
- lists
- tables
- forms
- inputs
- buttons
- labels
- select
- textarea
- checkboxes
- radio buttons
- comments
- semantic HTML
- accessibility basics
- SEO-friendly HTML
- HTML best practices

### Mini Project

**Multi-page Business Website**

Pages:

- Home
- About
- Services
- Contact

---

### Week 3 — CSS Fundamentals

Topics may include:

- selectors
- colors
- backgrounds
- fonts
- text styling
- borders
- shadows
- width and height
- margin
- padding
- box model
- display
- position
- z-index
- overflow
- Flexbox
- CSS Grid
- responsive units
- mobile-first design
- media queries
- breakpoints
- responsive images
- responsive typography

### Practice components

- navbar
- hero
- pricing cards
- login page
- contact form
- product cards
- footer

### Mini Project

**Responsive Landing Page**

The purpose is to teach:

```text
Design → Code
```

instead of:

```text
Tutorial → Copy
```

---

### Week 4 — Advanced CSS + CSS Animation

Topics may include:

- pseudo classes
- pseudo elements
- CSS variables
- transitions
- transforms
- gradients
- filters
- advanced shadows
- responsive navigation
- component-like CSS organization
- keyframes
- fade
- scale
- slide
- rotate
- hover effects
- button animations
- card animations
- loading animations
- skeleton loaders

### Project

**Modern Responsive Website**

Example structure:

- Navbar
- Hero
- Features
- Services
- Statistics
- Testimonials
- Pricing
- FAQ
- CTA
- Footer

### Month 1 Assessment

Students receive a design and recreate it without following a tutorial.

---

# 5. Month 2 — Bootstrap + Tailwind + JavaScript

## Week 5 — Bootstrap

Topics may include:

- CSS frameworks
- Bootstrap installation
- containers
- grid
- rows and columns
- breakpoints
- typography
- buttons
- cards
- navbar
- forms
- modals
- alerts
- badges
- spacing utilities
- responsive utilities

### Mini Project

**Bootstrap Business Website**

---

## Week 6 — Tailwind CSS

Topics may include:

- utility-first CSS
- setup
- containers
- flex
- grid
- spacing
- typography
- colors
- borders
- shadows
- responsive classes
- hover and focus states
- custom configuration
- reusable components

Students compare:

- CSS
- Bootstrap
- Tailwind

### Practice

- navbar
- hero
- dashboard
- pricing
- login
- product cards

### Mini Project

**SaaS Landing Page**

---

## Week 7 — JavaScript Fundamentals

Topics may include:

- JavaScript basics
- variables
- let
- const
- data types
- strings
- numbers
- boolean
- arrays
- objects
- operators
- if / else
- switch
- loops
- for
- while
- functions
- parameters
- return
- arrow functions
- scope

Students may solve 20–30 small problems such as:

- calculator
- even / odd checker
- grade calculator
- temperature converter
- number guessing
- array operations
- student data processing

---

## Week 8 — DOM + Modern JavaScript

Topics may include:

- DOM
- selecting elements
- changing text
- changing styles
- creating elements
- removing elements
- events
- form events
- keyboard events
- template literals
- destructuring
- spread
- rest
- array methods
- map
- filter
- find
- reduce
- forEach
- object methods
- optional chaining
- modules
- import / export

### Mini Projects

- Todo App
- Calculator
- Quiz App
- Expense Tracker

---

# 6. Month 3 — Advanced JavaScript + React

## Week 9 — Async JavaScript + APIs

Topics may include:

- synchronous vs asynchronous
- callbacks
- promises
- then
- catch
- async / await
- try / catch
- REST API basics
- HTTP methods
- JSON
- request / response
- status codes
- endpoints
- Axios
- GET
- POST
- headers
- error handling
- loading states

### Project

**Weather Application**

Possible features:

- city search
- API request
- weather information
- loading state
- error state
- responsive UI

---

## Week 10 — React Fundamentals

Topics may include:

- why React
- SPA concept
- React vs traditional sites
- Vite
- project structure
- JSX
- functional components
- props
- composition
- reusable components
- children
- conditional rendering
- lists
- keys

Practice components:

- navbar
- hero
- product card
- profile card
- pricing card
- testimonial

---

## Week 11 — React State + Hooks

Topics may include:

- state
- useState
- updating state
- state-driven UI
- forms
- controlled inputs
- events
- useEffect
- lifecycle concepts
- side effects
- dependency array
- conditional rendering
- loading states
- error states

### Mini Projects

- React Todo
- React Quiz
- React Expense Tracker

---

## Week 12 — Advanced React Fundamentals

Topics may include:

- API integration
- Axios + React
- loading states
- error states
- dynamic rendering
- search
- filter
- sorting
- pagination
- reusable components
- custom hooks introduction
- React Router
- routes
- links
- dynamic routes
- 404
- navigation

### Project

**React Product Application**

Possible features:

- home page
- product listing
- product details
- search
- filter
- category
- product API
- loading state
- error handling
- responsive design
- routing

---

# 7. Month 4 — Advanced Frontend + Real Projects

## Week 13 — Advanced React + Project Architecture

Topics may include:

- component architecture
- folder structure
- reusable components
- props patterns
- state management concepts
- lifting state
- custom hooks
- environment variables
- API service structure
- error handling
- reusable API functions

### Git and GitHub

- git init
- git add
- git commit
- git push
- branches
- repositories
- README
- .gitignore
- basic collaboration

Students should use GitHub throughout the course.

---

## Week 14 — Smooth Scrolling + Advanced Animation

Topics may include:

### Lenis

- smooth scrolling
- scroll behavior
- configuration
- combining scrolling with animation

### Locomotive Scroll

Treat as a legacy or alternative library.

Topics may include:

- why smooth scroll libraries exist
- scroll-based effects
- when to use Lenis
- when older Locomotive implementations may appear
- performance considerations

### Framer Motion

- motion components
- initial / animate
- transitions
- hover
- click
- page transitions
- scroll animations
- variants
- stagger
- layout animation

### Mini Project

**Animated Portfolio Website**

---

## Week 15 — Professional Frontend Project

### Project

**Modern SaaS Website**

Possible technology:

- React
- Tailwind CSS
- Axios
- Framer Motion
- Lenis
- CSS animations

Possible pages:

- Home
- About
- Services
- Pricing
- Blog
- Contact
- Login UI

Possible features:

- responsive design
- animation
- smooth scrolling
- API integration
- reusable components
- form validation
- loading states
- error handling

---

## Week 16 — Final Capstone

Students choose a real-world project.

Possible options:

### E-commerce frontend

- Home
- Products
- Categories
- Product details
- Cart
- Search
- Filter
- Checkout UI

### Education platform

- Courses
- Course details
- Instructor
- Student dashboard
- Login/register UI
- Search
- Categories

### Agency website

- Hero
- Services
- Portfolio
- Case studies
- Testimonials
- Pricing
- Contact

### Job platform

- Jobs
- Search
- Filters
- Job details
- Company profiles
- Application UI

### SaaS dashboard

- Login
- Dashboard
- Sidebar
- Analytics
- Tables
- Charts
- Settings
- Profile

---

# 8. Final Project Workflow

The course should teach actual professional workflow.

## Phase 1 — Planning

- understand requirements
- define features
- define pages
- sitemap
- choose technology

## Phase 2 — UI / UX

- wireframe
- layout
- colors
- typography
- components
- responsive behavior

## Phase 3 — Development

- project setup
- Git repository
- component structure
- pages
- responsive UI
- API integration
- animation

## Phase 4 — Testing

- mobile testing
- desktop testing
- browser testing
- form testing
- API error testing
- console errors
- accessibility

## Phase 5 — Optimization

- image optimization
- lazy loading
- code cleanup
- performance
- SEO basics

## Phase 6 — Deployment

- production build
- environment variables
- deployment
- domain connection
- hosting concepts

---

# 9. Project Roadmap Inside the LMS

The LMS should treat these as project milestones:

1. Personal Introduction
2. Multi-page Website
3. Responsive Landing Page
4. Bootstrap Business Website
5. Tailwind SaaS Landing Page
6. JavaScript Todo
7. JavaScript Quiz
8. Expense Tracker
9. Weather API App
10. React Todo
11. React Product App
12. Animated Portfolio
13. React SaaS Website
14. Final Capstone

Projects are a first-class LMS entity.

Do not model all student work only as generic assignment text.

---

# 10. Assessment Model

The platform should support this type of scoring model:

- Weekly Practice — 20%
- Mini Projects — 20%
- Assignments — 20%
- Code Quality — 10%
- GitHub — 10%
- Final Capstone — 20%

The system does not have to implement the complete weighted grade engine in the first MVP, but the schema must not make future implementation difficult.

---

# 11. User Roles

Support:

```text
student
mentor
admin
super_admin
```

---

# 12. Student Capabilities

Students should be able to:

- create account
- log in
- reset password
- maintain profile
- enroll during checkout
- submit manual bKash payment details
- see payment status
- see pending enrollment
- access the course after approval
- browse modules
- browse weeks
- browse lessons
- play protected videos
- read lesson content
- access lesson resources
- resume videos
- track video progress
- complete lessons
- see course progress
- see assignments
- submit assignments
- submit GitHub links
- submit deployment URLs
- submit text responses
- upload files
- upload screenshots
- see submission history
- see mentor feedback
- resubmit work
- see project progress
- see announcements
- see notifications
- update profile

---

# 13. Mentor Capabilities

Mentors should be able to:

- see assigned students
- view relevant assignments
- view submissions
- inspect GitHub links
- inspect live websites
- view uploaded files
- score work
- leave feedback
- request changes
- approve submissions
- review resubmissions
- attach resources when authorized
- publish announcements when authorized
- see student progress

Mentors should not automatically have access to payment management.

---

# 14. Admin Capabilities

Admins should be able to:

- manage students
- manage mentors
- manage course
- manage modules
- manage weeks
- manage lessons
- manage resources
- manage projects
- create assignments
- view submissions
- review payments
- approve payments
- reject payments
- activate enrollments
- suspend enrollments
- view progress
- publish announcements
- manage Google Drive integration
- verify Google Drive videos
- access reports
- manage settings

---

# 15. Super Admin

Super admin has full system-level privileges.

This role should exist even if only one account uses it initially.

---

# 16. Public Website

The homepage should work as the primary course landing page.

Suggested structure:

1. Navbar
2. Hero
3. Course promise
4. Who this course is for
5. What students will learn
6. Technology stack
7. 4-month roadmap
8. Week-by-week curriculum
9. Projects students build
10. Learning method
11. Mentor support
12. Assessment
13. Instructor / mentor
14. Pricing
15. bKash payment explanation
16. FAQ
17. Final CTA
18. Footer

Primary CTA:

```text
Enroll Now
```

If user is an active student:

```text
Continue Learning
```

If enrollment is pending:

```text
View Enrollment Status
```

---

# 17. Authentication

Use Supabase Auth.

Never store raw passwords in custom tables.

The application profile should reference:

```text
auth.users.id
```

via UUID.

Support:

- register
- login
- logout
- forgot password
- password reset

Student role should normally be assigned server-side.

Do not trust a role submitted from browser input.

---

# 18. Manual bKash Checkout

The first version does not use an automatic payment gateway.

The configured course page displays:

- course title
- course price
- bKash number
- payment instructions

Student submits:

- full name
- email
- phone
- password
- confirm password
- sender bKash number
- transaction ID
- amount sent
- optional payment screenshot

If the user is not registered yet, account creation happens during checkout.

## Checkout flow

```text
Visitor
↓
Course Landing Page
↓
Enroll Now
↓
Checkout
↓
Create account
↓
Submit bKash details
↓
Create payment record
↓
Create pending enrollment
↓
Auto-login
↓
Redirect to student dashboard
```

---

# 19. Payment Statuses

Support:

```text
pending
under_review
approved
rejected
cancelled
refunded
```

Do not use a simple boolean.

---

# 20. Enrollment Statuses

Support:

```text
pending
active
suspended
completed
cancelled
```

---

# 21. Pending Student Experience

When a student logs in after checkout but payment is not approved:

The course card should show:

```text
Frontend Development Course

Payment Verification Pending

We received your payment information.
Your access will be activated after payment verification.
```

Pending students must not receive protected course content.

---

# 22. Payment Admin

Route concept:

```text
/admin/payments
```

The payment list should show useful data such as:

- student
- phone
- sender bKash number
- transaction ID
- amount
- submitted date
- status

Payment detail view should include:

- student information
- transaction details
- payment screenshot
- admin note
- approval action
- rejection action

When admin approves:

```text
payment.status = approved
enrollment.status = active
```

Set:

- approved_by
- approved_at
- reviewed_at

Use server-side logic.

The operation should avoid partial state where payment is approved but enrollment remains pending.

Prefer a database function, transaction, or equivalent reliable server-side pattern.

---

# 23. Google Drive Video Architecture

Course videos are hosted in **Google Drive**.

They are not uploaded to Supabase Storage.

The LMS admin uploads the video files to Google Drive separately.

The admin then adds either:

- Google Drive file URL
- Google Drive file ID

to the lesson.

---

# 24. Important Video Security Rule

Do **not** rely on a standard Google Drive preview iframe as the permanent LMS playback architecture.

Reasons:

- Drive UI cannot be fully controlled
- Drive icons / UI may remain
- cross-origin iframe content cannot be reliably restyled
- direct sharing URLs are easier to leak
- player behavior is not under LMS control

Use Google Drive as the storage source, while the LMS handles:

- authentication
- authorization
- playback UI
- progress tracking
- future watermarks
- access logging

---

# 25. Recommended Drive Flow

```text
Private Google Drive Video
↓
Google Drive API
↓
Next.js server / protected video layer
↓
Check Supabase session
↓
Check active enrollment
↓
Check lesson access
↓
Authorize media access
↓
Custom LMS video player
```

The student should not need a Google account.

Google authentication is between:

```text
LMS server ↔ Google Drive
```

not:

```text
Student ↔ Google Drive
```

---

# 26. Google Drive Admin Integration

Add:

```text
Admin
→ Settings
→ Integrations
→ Google Drive
```

Possible UI:

```text
Google Drive

Status: Not Connected

[Connect Google Drive]
```

After connection:

```text
Status: Connected

Connected Account:
course@example.com

[Reconnect]
[Disconnect]
```

Use OAuth 2.0.

Store long-lived credentials securely on the server.

Never expose refresh or access tokens to students.

---

# 27. Dedicated Course Google Account

Prefer using a dedicated Google account for course assets.

Example:

```text
courses@yourdomain.com
```

or another dedicated account.

Keep unrelated personal Drive files outside this account when practical.

---

# 28. Google Drive Lesson Workflow

In lesson editor:

```text
Lesson Title
Lesson Type
Lesson Content

Video Provider
[ Google Drive ]

Google Drive URL / File ID
[________________________]

[ Verify Video ]
```

The LMS should accept:

```text
https://drive.google.com/file/d/ABC123/view
```

or:

```text
https://drive.google.com/open?id=ABC123
```

or:

```text
ABC123
```

Normalize them to:

```text
ABC123
```

before storing.

---

# 29. Verify Video

The admin must have a:

```text
Verify Video
```

action.

When clicked, server-side code should:

1. authenticate with Google Drive
2. verify file existence
3. verify access
4. check file MIME type
5. ensure it is a suitable video
6. retrieve safe metadata
7. return verification result

Possible success state:

```text
Video found

Filename:
week-07-js-variables.mp4

Type:
video/mp4

Drive ID:
ABC123
```

If inaccessible:

```text
Unable to access this Google Drive file.

Check that the file belongs to or is shared with the connected Google account.
```

---

# 30. Video Provider Abstraction

Do not tightly couple lesson components to Google Drive.

Use a provider abstraction.

Conceptually:

```ts
interface VideoProvider {
  verifySource(source: string): Promise<VideoMetadata>;
  getPlaybackSource(context: PlaybackContext): Promise<PlaybackResult>;
}
```

Possible implementations:

```text
GoogleDriveVideoProvider
FutureVideoProvider
```

Future options may include:

- Bunny Stream
- Cloudflare Stream
- another CDN
- another private video service

The lesson database should remain provider-neutral.

---

# 31. Lesson Video Fields

Prefer fields similar to:

```text
video_provider
video_external_id
video_duration_seconds
video_status
```

rather than:

```text
google_drive_url
```

Example:

```text
video_provider = google_drive
video_external_id = ABC123
```

---

# 32. Custom Video Player

The LMS player should control the user experience.

Minimum controls:

- play
- pause
- seek
- volume
- current time
- duration
- playback speed
- fullscreen
- loading state
- error state

The normal student UI should not show:

- Google Drive logo
- Open in Drive
- Google account controls
- Google sharing controls

---

# 33. Video Access Authorization

Before protected video access is returned:

1. validate Supabase session
2. find student profile
3. identify lesson
4. identify course
5. find enrollment
6. require active enrollment
7. evaluate lesson unlock rules
8. authorize video
9. return media/playback response

Pending, suspended, cancelled, or unauthorized users must not receive protected playback.

---

# 34. Video Security Reality

No browser-based video system can guarantee absolute prevention of copying.

Authorized users can potentially:

- screen record
- capture media
- use developer tools
- record externally

The goal is:

- prevent casual link sharing
- avoid exposing public Drive links
- avoid exposing OAuth credentials
- enforce authenticated lesson access
- make abuse identifiable
- make migration to stronger video infrastructure possible

---

# 35. Future Watermark Support

Prepare player architecture for dynamic student watermarking.

Possible watermark data:

- student name
- masked email
- enrollment ID

Example:

```text
Alir R.
al***@example.com
STU-1025
```

The watermark may move periodically.

The original video file should not be modified.

---

# 36. Future Device / Session Controls

Architecture may later support:

- one active playback session
- maximum registered devices
- suspicious account sharing detection
- forced session termination
- activity logs

Do not prioritize this before core LMS functionality.

---

# 37. Video Progress Tracking

Store video progress per student and lesson.

Suggested fields:

```text
student_id
lesson_id
last_position_seconds
duration_seconds
watched_percentage
last_watched_at
completed_at
```

Persist progress periodically.

Do not write to the database on every video frame or second.

A reasonable design may:

- update after interval
- update on pause
- update on page exit where practical
- update at meaningful progress checkpoints

---

# 38. Resume Playback

If student leaves at:

```text
18:42
```

next visit may offer:

```text
Continue from 18:42
```

or automatically resume depending on UX choice.

---

# 39. Video Lesson Completion

Support configurable completion threshold.

Example:

```text
watched_percentage >= 90
```

Then mark video lesson complete automatically.

Non-video lessons may support:

```text
Mark Lesson Complete
```

---

# 40. Video Hosting Caveat

If every video byte is proxied through Next.js hosting:

```text
Google Drive
↓
Next.js hosting
↓
Student
```

bandwidth and runtime costs may become significant.

Therefore:

- isolate video delivery behind a provider/service abstraction
- investigate deployment platform limits
- support HTTP Range requests if required
- document final delivery strategy
- avoid building the entire LMS around one hosting assumption

Create:

```text
docs/VIDEO_ARCHITECTURE.md
```

before finalizing production playback.

---

# 41. LMS Course Hierarchy

Use:

```text
Course
└── Module / Month
    └── Week
        └── Lesson
            ├── Content
            ├── Video
            ├── Resources
            ├── Practice
            ├── Challenge
            └── Assignment
```

Do not hard-code curriculum pages into React files.

Curriculum must be database-driven.

---

# 42. Lesson Types

Support:

```text
concept
video
live_coding
practice
challenge
project
review
resource
```

The schema may use an enum or constrained string.

---

# 43. Lesson Player Layout

Desktop concept:

```text
┌───────────────────────────────────────┐
│ Week 7 — JavaScript Fundamentals      │
├────────────────┬──────────────────────┤
│ Curriculum     │ Lesson Title         │
│                │                      │
│ ✓ Variables    │ [Video / Content]    │
│ ✓ Data Types   │                      │
│ ● Arrays       │ Lesson Content       │
│ ○ Objects      │                      │
│ 🔒 Functions   │ Resources            │
│                │                      │
│                │ Previous    Next     │
└────────────────┴──────────────────────┘
```

Mobile:

- collapsible curriculum drawer
- full-width lesson player
- sticky navigation where appropriate

---

# 44. Course Unlocking

Support architecture for:

```text
all_content
sequential
scheduled
```

Possible future configuration:

```text
unlock_type
unlock_at
```

The first implementation may use a simpler rule if needed.

Do not make future sequential or drip release impossible.

---

# 45. Student Dashboard

Dashboard should feel like a learning control center.

Suggested blocks:

- greeting
- continue learning
- course progress
- current week
- next lesson
- upcoming assignment
- recent feedback
- announcements
- project progress
- lesson statistics

Example:

```text
Course Progress     34%
Lessons Completed   32
Assignments         7
Projects Completed  4
Current Week        Week 5
```

---

# 46. Student Navigation

Suggested sidebar:

```text
Dashboard
My Course
Curriculum
Assignments
Projects
Resources
Announcements
My Progress
Feedback
Profile
Settings
Logout
```

Keep navigation focused.

---

# 47. Lesson Progress

Do not store only:

```text
course_progress = 42
```

Store lesson completion records.

Example:

```text
student_lesson_progress
```

with:

```text
student_id
lesson_id
completed
completed_at
```

Aggregate course progress from actual records.

---

# 48. Assignments

Assignments are a major LMS feature.

Support fields such as:

```text
id
course_id
week_id
lesson_id
title
description
instructions
requirements
assignment_type
submission_type
max_score
due_at
allow_resubmission
max_attempts
published
created_by
created_at
updated_at
```

---

# 49. Assignment Submission Types

Support:

```text
text
file
github
url
multiple
```

Most frontend assignments should support:

```text
multiple
```

Example submission:

```text
GitHub Repository:
https://github.com/...

Live Website:
https://project.vercel.app

Student Notes:
Completed all required sections.

Files:
screenshot.png
```

---

# 50. Submission Statuses

Support states such as:

```text
draft
submitted
under_review
changes_requested
resubmitted
approved
graded
late
```

Avoid:

```text
submitted = true
```

as the only state model.

---

# 51. Submission History

Never overwrite previous submissions.

Support:

```text
Attempt 1
Attempt 2
Attempt 3
```

Mentors should be able to compare improvement.

---

# 52. Mentor Review

Mentor review may include:

- score
- feedback
- review status
- reviewed date
- request changes
- approve
- grade

Example:

```text
Score:
85 / 100

Feedback:
Great layout.

Please improve:
- mobile navbar
- hero spacing
- button hover state

Status:
Changes Requested
```

---

# 53. Projects

Projects must be a first-class concept.

Suggested student project display:

```text
React Product Application

Status:
Completed

Repository:
github.com/...

Live Site:
vercel.app/...

Score:
92/100

Mentor Feedback:
...
```

---

# 54. Resources

Mentor/admin should be able to attach resources such as:

- PDF
- ZIP
- image
- video
- YouTube
- Google Drive
- Figma
- GitHub
- documentation
- website
- code snippet
- external link

Resources may belong to:

- course
- module
- week
- lesson
- assignment
- project

---

# 55. Announcements

Admin/authorized mentors can post announcements.

Possible examples:

- class rescheduled
- new assignment
- deadline changed
- resource uploaded
- live session link
- important notice

Suggested fields:

```text
title
content
priority
published_at
expires_at
```

---

# 56. Notifications

Build internal notifications first.

Possible events:

- payment approved
- payment rejected
- new assignment
- assignment submitted
- submission reviewed
- changes requested
- assignment approved
- new resource
- new announcement

Future channels:

- email
- WhatsApp
- SMS
- push

The notification architecture should allow future channels without replacing core event logic.

---

# 57. Admin Dashboard

Suggested metrics:

```text
Total Students
Active Students
Pending Payments
Pending Reviews
Assignments Waiting
Recent Enrollments
Recent Submissions
```

Suggested navigation:

```text
Dashboard

Course
├── Curriculum
├── Modules
├── Weeks
├── Lessons
├── Resources
└── Projects

Students
Enrollments
Payments

Assignments
Submissions

Mentors

Announcements
Notifications

Reports
Settings
```

---

# 58. Mentor Dashboard

Suggested navigation:

```text
Dashboard
My Students
Assignments
Submissions
Resources
Announcements
```

Suggested dashboard metrics:

```text
Pending Reviews
Changes Requested
Reviewed This Week
Assigned Students
```

---

# 59. Database Architecture

Design a normalized PostgreSQL schema.

Suggested core tables:

```text
profiles
courses
course_modules
course_weeks
lessons
lesson_resources
enrollments
payments
lesson_progress
video_progress
assignments
assignment_resources
assignment_submissions
submission_files
submission_reviews
projects
project_submissions
announcements
notifications
mentor_students
activity_logs
integrations
```

This list is guidance.

The coding agent should review relationships before blindly generating tables.

---

# 60. Main Relationships

Authentication:

```text
auth.users
↓
profiles
```

Course:

```text
courses
↓
course_modules
↓
course_weeks
↓
lessons
```

Enrollment:

```text
profiles
↓
enrollments
↓
courses
```

Assignment:

```text
assignments
↓
assignment_submissions
↓
submission_reviews
```

Video:

```text
lessons
↓
video_progress
```

---

# 61. Profiles Table

Suggested:

```text
id uuid primary key references auth.users(id)
full_name text
email text
phone text
avatar_url text
role text
status text
created_at timestamptz
updated_at timestamptz
```

Do not store passwords.

---

# 62. Courses Table

Even with one course, create this table.

Suggested:

```text
id
title
slug
short_description
description
thumbnail_url
price
duration
status
created_at
updated_at
```

---

# 63. Course Modules

Suggested:

```text
id
course_id
title
description
position
status
created_at
updated_at
```

---

# 64. Course Weeks

Suggested:

```text
id
course_id
module_id
title
description
week_number
position
unlock_type
unlock_at
status
created_at
updated_at
```

---

# 65. Lessons

Suggested:

```text
id
course_id
week_id
title
slug
description
content
lesson_type

video_provider
video_external_id
video_duration_seconds
video_status

duration_minutes
position
is_preview
status

created_at
updated_at
```

---

# 66. Payments

Suggested:

```text
id
user_id
course_id
amount
payment_method
sender_phone
transaction_id
screenshot_url
status
admin_note
submitted_at
reviewed_at
reviewed_by
created_at
updated_at
```

Protect against duplicate transaction IDs where practical.

---

# 67. Enrollments

Suggested:

```text
id
student_id
course_id
payment_id
status
enrolled_at
approved_at
expires_at
approved_by
created_at
updated_at
```

---

# 68. Lesson Progress

Suggested:

```text
id
student_id
lesson_id
completed
completed_at
created_at
updated_at
```

Use unique constraint on:

```text
student_id + lesson_id
```

where appropriate.

---

# 69. Video Progress

Suggested:

```text
id
student_id
lesson_id
last_position_seconds
duration_seconds
watched_percentage
last_watched_at
completed_at
created_at
updated_at
```

---

# 70. Assignments

Suggested:

```text
id
course_id
week_id
lesson_id
title
description
instructions
requirements
assignment_type
submission_type
max_score
due_at
allow_resubmission
max_attempts
published
created_by
created_at
updated_at
```

---

# 71. Assignment Submissions

Suggested:

```text
id
assignment_id
student_id
attempt_number
text_response
github_url
live_url
status
submitted_at
created_at
updated_at
```

---

# 72. Submission Files

Suggested:

```text
id
submission_id
student_id
file_path
original_name
mime_type
file_size
created_at
```

---

# 73. Submission Reviews

Suggested:

```text
id
submission_id
mentor_id
score
feedback
status
reviewed_at
created_at
updated_at
```

Do not overwrite review history unless explicitly designed that way.

---

# 74. Projects

Suggested:

```text
id
course_id
week_id
title
description
requirements
position
max_score
status
created_at
updated_at
```

---

# 75. Project Submissions

Suggested:

```text
id
project_id
student_id
attempt_number
github_url
live_url
notes
status
submitted_at
created_at
updated_at
```

---

# 76. Mentor Students

Suggested:

```text
id
mentor_id
student_id
course_id
assigned_at
active
```

This supports mentor-specific access.

---

# 77. Integrations

Suggested generic table:

```text
id
provider
account_email
encrypted_refresh_token
scope
status
connected_by
connected_at
updated_at
```

Google Drive should be implemented through this integration system or another secure provider-specific table.

Never store unencrypted sensitive long-lived tokens in readable plain text if the architecture can avoid it.

---

# 78. Activity Logs

Suggested activity logs may record:

- user login
- payment submission
- payment approval
- assignment submission
- review
- important admin action
- important video access event
- security event

Do not log sensitive secrets or raw OAuth tokens.

---

# 79. Supabase Storage

Use Supabase Storage for assets that belong to the LMS, excluding course video files.

Possible buckets:

```text
avatars
payment-proofs
course-resources
assignment-files
submission-files
```

Sensitive buckets should be private.

Use signed URLs.

Do not expose unrestricted private student files.

---

# 80. Row Level Security

RLS is mandatory.

Do not rely only on frontend route guards.

## Students

Students may:

- read their own profile
- update permitted profile fields
- read their own payments
- read their own enrollment
- read protected course data only if authorized
- create their own submissions
- read their own submissions
- read mentor feedback connected to their submissions
- read public/authorized announcements

Students may not:

- read other students' private records
- approve payments
- change their role
- activate their own enrollment
- read unrelated submissions
- access mentor/admin records

## Mentors

Mentors may:

- access assigned students
- access assigned student submissions
- create review records for permitted submissions
- read appropriate course content

Mentor permissions should be server-validated and/or RLS-protected.

## Admins

Admins receive authorized management access.

Do not implement admin authority using only:

```ts
if (profile.role === "admin")
```

in browser code.

Server authorization is required.

---

# 81. Course Access Rules

Protected course content requires:

```text
Authenticated User
+
Valid Student Profile
+
Active Enrollment
+
Lesson Access Permission
```

Pending enrollment must not unlock lessons.

Suspended enrollment must not unlock lessons.

Cancelled enrollment must not unlock lessons.

---

# 82. Next.js Route Structure

Suggested App Router organization:

```text
app/

(public)/
  page.tsx
  curriculum/
  faq/

(auth)/
  login/
  register/
  forgot-password/
  reset-password/

checkout/
  page.tsx
  success/

dashboard/
  layout.tsx
  page.tsx

  course/
    page.tsx
    [weekSlug]/
      [lessonSlug]/

  assignments/
    page.tsx
    [assignmentId]/

  projects/
  resources/
  announcements/
  progress/
  feedback/
  profile/
  settings/

mentor/
  layout.tsx
  dashboard/
  students/
  assignments/
  submissions/
  resources/
  announcements/

admin/
  layout.tsx
  dashboard/
  courses/
  curriculum/
  students/
  mentors/
  enrollments/
  payments/
  assignments/
  submissions/
  resources/
  announcements/
  reports/
  settings/
    integrations/

api/
```

The final implementation may improve naming, but keep clear public/student/mentor/admin separation.

---

# 83. Component Structure

Suggested:

```text
components/

ui/

layout/

marketing/
  Navbar
  Hero
  Curriculum
  Pricing
  FAQ
  CTA

course/
  CourseSidebar
  LessonViewer
  LessonNavigation
  LessonProgress
  WeekAccordion
  VideoPlayer

dashboard/
  CourseCard
  ProgressCard
  AssignmentCard
  AnnouncementCard
  FeedbackCard

assignment/
  SubmissionForm
  SubmissionHistory
  MentorFeedback

admin/
  DataTable
  StudentTable
  PaymentReview
  CurriculumEditor
  LessonEditor
  VideoVerifier

mentor/
  SubmissionReview
  StudentProgress
```

Avoid giant page components.

---

# 84. Rich Text Editing

Admin should not be limited to plain textareas for lesson and assignment content.

Use a rich text editor such as TipTap.

Useful content support:

- heading
- paragraph
- bold
- italic
- list
- link
- code
- code block
- quote
- image

Programming course content requires good code formatting.

---

# 85. Validation

Use Zod.

Validate:

- auth inputs
- checkout
- payment
- admin lesson forms
- Google Drive source input
- assignment submission
- mentor review
- file uploads

Validate server-side even when client-side validation exists.

---

# 86. File Upload Security

Validate:

- MIME type
- extension
- maximum size
- user ownership
- storage path

Never rely only on the file name.

---

# 87. Loading States

Create:

- skeletons
- loading states
- empty states
- error states

Avoid blank layouts while data loads.

---

# 88. Error Handling

Handle:

- auth failure
- unauthorized access
- invalid payment
- duplicate transaction
- upload failure
- missing enrollment
- Drive access failure
- Drive token expiration
- deleted video
- missing lesson
- assignment errors
- database errors

Student-facing errors should be understandable.

Server logs should have enough technical detail for debugging.

Never expose secrets in browser error messages.

---

# 89. Responsive Requirements

The entire application must work on:

- mobile
- tablet
- laptop
- desktop

Course player and admin tools must be usable on mobile even if desktop is the preferred admin experience.

---

# 90. Accessibility

Use:

- semantic HTML
- accessible forms
- labels
- keyboard navigation
- focus states
- good contrast
- accessible dialogs
- alt text
- meaningful button labels

---

# 91. SEO

Public pages should have:

- metadata
- title
- description
- Open Graph metadata
- semantic headings
- readable URLs

Private student/admin/mentor dashboards should be excluded from indexing.

---

# 92. UI Direction

The design should feel like a modern professional coding education product.

Avoid:

- childish education graphics
- cartoon-heavy visuals
- excessive gradients
- unnecessary animation
- crowded dashboards
- generic marketplace appearance

Prefer:

- clean typography
- strong spacing
- professional cards
- modern developer-focused visual language
- code-oriented imagery where useful
- clear hierarchy
- high readability
- excellent mobile UX

---

# 93. Analytics — Future

Admin may later see:

- enrollments
- active students
- lesson completion
- project completion
- assignment rates
- average scores
- student inactivity
- current week
- last activity

Potential useful flags:

```text
Inactive for 7+ days
Inactive for 14+ days
Behind course schedule
```

Do not make analytics block MVP development.

---

# 94. Attendance — Future

Prepare architecture mentally for:

```text
sessions
attendance
```

Do not implement unless needed.

---

# 95. Certificates — Future

A certificate system may later require:

```text
course completed
+
required assignments approved
+
final capstone approved
```

Do not prioritize for MVP.

---

# 96. Discussion System — Future

A lesson discussion or mentor Q&A system may be added later.

Do not build it unless specifically requested.

---

# 97. MVP Scope

The MVP should include:

1. project foundation
2. database schema
3. Supabase setup
4. authentication
5. profiles
6. roles
7. public landing page
8. checkout
9. manual bKash payment
10. payment admin
11. enrollment approval
12. student dashboard
13. curriculum
14. lesson viewer
15. Google Drive integration
16. protected video playback
17. video progress
18. lesson progress
19. assignments
20. student submissions
21. mentor review
22. projects
23. resources
24. announcements
25. internal notifications
26. admin CMS
27. mentor panel
28. RLS
29. responsive QA
30. deployment preparation

---

# 98. Phase 2

Add later:

- email notifications
- better analytics
- attendance
- certificates
- calendar
- live sessions
- student notes
- discussion
- advanced grading
- device limits
- dynamic watermarking
- suspicious activity detection

---

# 99. Phase 3

Possible later features:

- multiple courses
- coupons
- automated payment gateways
- bKash gateway
- mobile/PWA
- WhatsApp notifications
- public student portfolios
- certificate verification
- gamification
- advanced reporting

---

# 100. Development Phases

Do not build everything at once.

## Phase 0 — Repository Audit

If repository already exists:

- inspect structure
- inspect package.json
- inspect existing Supabase integration
- inspect auth
- inspect environment setup
- inspect routing
- inspect current UI
- document findings

If repository is empty:

- establish architecture first

---

## Phase 1 — Architecture Documents

Create:

```text
docs/LMS_ARCHITECTURE.md
docs/DATABASE_SCHEMA.md
docs/IMPLEMENTATION_PLAN.md
docs/VIDEO_ARCHITECTURE.md
docs/SECURITY.md
```

Do not start generating random UI before architecture is documented.

---

## Phase 2 — Project Foundation

Implement:

- Next.js
- TypeScript
- Tailwind
- shadcn/ui
- folder organization
- environment handling
- formatting/linting
- base layout
- utility structure

---

## Phase 3 — Supabase and Database

Implement:

- migration system
- schema
- enums/check constraints where appropriate
- indexes
- foreign keys
- seed strategy
- generated database types
- RLS baseline

---

## Phase 4 — Authentication

Implement:

- register
- login
- logout
- reset password
- profiles
- role handling
- route protection
- server authorization helpers

---

## Phase 5 — Public Website

Implement:

- home page
- course structure
- curriculum section
- projects section
- pricing
- FAQ
- CTA
- responsive layout
- SEO

---

## Phase 6 — Checkout

Implement:

- checkout
- create account if needed
- payment submission
- payment proof
- pending enrollment
- redirect to dashboard

---

## Phase 7 — Admin Payment Approval

Implement:

- payment table
- payment detail
- approve
- reject
- reason
- transactional enrollment activation

---

## Phase 8 — Student Dashboard

Implement:

- course card
- pending state
- active state
- course progress
- upcoming work
- recent feedback
- announcements

---

## Phase 9 — Curriculum CMS

Implement:

- course
- module
- week
- lesson
- order/position
- status
- admin editing

---

## Phase 10 — Google Drive Integration

Implement:

- OAuth connection
- integration settings
- token storage
- Drive file normalization
- video verification
- provider abstraction

---

## Phase 11 — Video Playback

Implement:

- protected media access
- lesson authorization
- custom player
- progress tracking
- resume playback
- completion threshold
- robust errors

---

## Phase 12 — Assignment System

Implement:

- assignments
- submission types
- deadlines
- drafts
- submit
- files
- GitHub
- live URL
- attempt history

---

## Phase 13 — Mentor Review

Implement:

- review queue
- student submission detail
- score
- feedback
- approve
- changes requested
- resubmission

---

## Phase 14 — Project System

Implement:

- project list
- submissions
- portfolio-level progress
- project detail
- mentor review integration

---

## Phase 15 — Resources

Implement:

- resource CRUD
- resource ownership
- protected files
- external links
- lesson/week/project association

---

## Phase 16 — Announcements + Notifications

Implement:

- announcement CRUD
- student feed
- internal notification events
- unread/read state

---

## Phase 17 — Security Pass

Review:

- RLS
- route protection
- admin authorization
- mentor authorization
- enrollment checks
- Drive video protection
- secrets
- token storage
- upload rules
- data exposure

---

## Phase 18 — QA

Test:

- mobile
- tablet
- desktop
- auth
- checkout
- approval
- pending student
- active student
- lesson access
- video playback
- assignment submission
- mentor review
- resubmission
- file access
- unauthorized access
- browser errors

---

## Phase 19 — Deployment

Document:

- environment variables
- Supabase setup
- OAuth setup
- Google callback URL
- production redirect URLs
- migrations
- storage buckets
- seeding
- admin bootstrap process
- build
- deployment
- domain

---

# 101. Seed Data

After database architecture is stable, seed the real course structure.

Seed:

- one primary Frontend Development course
- four modules/months
- sixteen weeks
- representative lessons
- projects
- assignments
- example resources

Do not mix seed content into schema migration logic unnecessarily.

---

# 102. Coding Standards

Use:

- strict TypeScript
- explicit domain types
- small reusable functions
- clear function names
- clean server/client separation
- reusable validation
- generated Supabase DB types
- reusable authorization helpers
- feature-oriented structure where useful
- database migrations
- predictable error handling

Avoid:

- giant page components
- duplicated SQL
- duplicated queries
- hard-coded user IDs
- hard-coded course curriculum
- browser-only role protection
- any-heavy TypeScript
- untyped API results
- public private-file URLs
- secret leakage
- Drive-specific logic scattered everywhere

---

# 103. AI Agent Working Rules

The coding AI must treat this file as the product specification.

Before each major phase:

1. inspect current repository
2. summarize existing state
3. identify relevant requirements from this file
4. propose implementation
5. list files to add/change
6. implement
7. run lint/typecheck/build/tests where appropriate
8. fix errors
9. summarize what changed
10. update documentation
11. state the next recommended phase

Do not rewrite unrelated working code.

Do not delete user work without reason.

Do not silently change product requirements.

If the existing implementation conflicts with this specification:

- identify the conflict
- explain the impact
- propose the safest correction
- then implement

---

# 104. AI Agent Safety Rules for the Repository

Never:

- print secrets
- commit `.env.local`
- hard-code OAuth secrets
- expose service-role credentials
- use public video URLs for protected lessons
- disable RLS just to make something work
- make all storage buckets public
- bypass auth for convenience
- trust client-submitted roles
- let students activate their own enrollment
- let mentors manage payments unless explicitly permitted

---

# 105. Definition of Done for a Feature

A feature is not complete merely because UI exists.

For each completed feature verify:

- database exists
- validation exists
- server authorization exists
- RLS exists where relevant
- loading state exists
- error state exists
- mobile layout works
- empty state works
- types pass
- lint passes
- build passes
- docs updated

---

# 106. Example User Journey

## Student

```text
Visitor
↓
Landing Page
↓
Reviews Course
↓
Enroll Now
↓
Checkout
↓
Creates account
↓
Sends payment to configured bKash Personal number
↓
Submits phone + transaction ID
↓
Dashboard
↓
Sees Payment Verification Pending
↓
Admin Approves
↓
Course becomes Active
↓
Student opens Week 1
↓
Watches private Drive-hosted video
↓
Video progress saved
↓
Student opens resources
↓
Student completes lesson
↓
Student receives assignment
↓
Submits GitHub + live URL
↓
Mentor reviews
↓
Changes requested
↓
Student resubmits
↓
Mentor approves
↓
Progress updates
↓
Student continues through 16 weeks
↓
Final Capstone
```

---

# 107. Example Admin Journey

```text
Admin Login
↓
Dashboard
↓
Review Pending Payments
↓
Approve Student
↓
Manage Course
↓
Create Week
↓
Create Lesson
↓
Paste Google Drive Video URL
↓
Verify Video
↓
Publish Lesson
↓
Create Assignment
↓
Attach Resource
↓
Publish Announcement
↓
View Student Progress
```

---

# 108. Example Mentor Journey

```text
Mentor Login
↓
Dashboard
↓
Pending Reviews
↓
Open Student Submission
↓
Open GitHub Repository
↓
Open Live Website
↓
Review Files
↓
Score
↓
Write Feedback
↓
Request Changes
↓
Student Resubmits
↓
Approve
```

---

# 109. Important Product Principles

The LMS is not just a video library.

It should support the course philosophy:

```text
Learn
Practice
Build
Challenge
Review
Improve
```

The platform must emphasize:

- progress
- practice
- project building
- independent problem solving
- GitHub usage
- mentor review
- repeated improvement
- portfolio-quality work

The student should feel that they are progressing toward being a professional frontend developer, not merely watching videos.

---

# 110. Initial AI Task

When this file is first provided to Codex, Antigravity, or another coding agent, the agent should **not immediately build the entire LMS**.

The first task is:

1. inspect the repository
2. determine whether the project already exists
3. create the architecture documents
4. propose the normalized database
5. propose security/RLS design
6. propose Google Drive integration architecture
7. propose Phase 1 implementation
8. begin only the foundation work

Create:

```text
docs/LMS_ARCHITECTURE.md
docs/DATABASE_SCHEMA.md
docs/IMPLEMENTATION_PLAN.md
docs/VIDEO_ARCHITECTURE.md
docs/SECURITY.md
```

---

# 111. Initial Prompt for the Coding Agent

Use this together with this specification:

```text
You are the senior full-stack engineer responsible for this LMS.

Read the entire MASTER_SYSTEM_SPEC.md before making architectural decisions.

Treat MASTER_SYSTEM_SPEC.md as the product source of truth.

Do not attempt the entire application in one generation.

First inspect the repository.

Then create/update:

docs/LMS_ARCHITECTURE.md
docs/DATABASE_SCHEMA.md
docs/IMPLEMENTATION_PLAN.md
docs/VIDEO_ARCHITECTURE.md
docs/SECURITY.md

Make architecture, database, authorization, RLS, Google Drive video delivery, and manual bKash enrollment clear before building feature UI.

After the docs are complete, begin Phase 2 / foundation work only.

For every phase:

- inspect existing code
- preserve working code
- explain intended changes
- implement
- run checks
- fix errors
- document changes
- summarize next step

Security, maintainability, data integrity, and responsive UX are first-class requirements.
```

---

# 112. Final Reminder

Core foundation:

```text
Next.js
+
Supabase
+
Secure Auth
+
Manual bKash Enrollment
+
Database-Driven Curriculum
+
Google Drive Private Video Integration
+
Custom LMS Player
+
Assignments
+
Projects
+
Mentor Feedback
+
Admin CMS
+
RLS
```

Do not reduce this project to:

```text
Landing Page + Video List
```

It is a real LMS designed around a structured, project-based 4-month Frontend Development program.
