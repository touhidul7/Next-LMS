# Frontend Development LMS — System Architecture

## 1. Executive Summary

This document specifies the system architecture for the Frontend Development LMS. The platform is designed specifically for a 4-month / 16-week Frontend Development course, featuring a public landing page, student portal, manual bKash checkout with admin verification, private Google Drive video delivery, homework/project submission workflows, and a mentor review system.

---

## 2. Technology Stack & Framework Rules

### Tech Stack

- **Framework:** Next.js (App Router, JavaScript/JSX)
- **Styling:** Tailwind CSS + Vanilla CSS variables + shadcn/ui component patterns
- **Database & Auth:** Supabase (PostgreSQL + Supabase Auth + Supabase Storage + RLS)
- **Form & Validation:** React Hook Form + Zod
- **Icons & UI Utilities:** Lucide React, Sonner (toast notifications), date-fns, clsx, tailwind-merge
- **Video Delivery:** Google Drive API (OAuth 2.0) via server-side media proxy + Custom LMS HTML5 Player

### Development Language Directive

The codebase strictly utilizes **JavaScript and JSX (`.js` and `.jsx`)** across all components, server actions, route handlers, and utility modules. Dynamic typing is augmented by Zod schema validation at system boundaries and runtime assertions.

---

## 3. High-Level System Architecture

```text
                                +-----------------------------------+
                                |          Client Browsers          |
                                +-----------------------------------+
                                       |                     |
                                (Public & Student)       (Admin & Mentor)
                                       v                     v
                        +-------------------------------------------------+
                        |         Next.js App Router (JS/JSX)             |
                        |                                                 |
                        |   +---------------+     +-------------------+   |
                        |   | Public Site   |     | Student Portal    |   |
                        |   +---------------+     +-------------------+   |
                        |   | Admin Panel   |     | Mentor Queue      |   |
                        |   +---------------+     +-------------------+   |
                        +-------------------------------------------------+
                                       |                     |
                   +-------------------+                     +------------------+
                   |                                                            |
                   v                                                            v
+------------------------------------+                        +------------------------------------+
|          Supabase Backend          |                        |         Google Drive API           |
|  - PostgreSQL Database & RLS       |                        |  - Private Video Storage           |
|  - Supabase Auth (JWT/Sessions)    |                        |  - OAuth 2.0 Refresh/Access Token   |
|  - Supabase Storage (Submissions)  |                        |  - Server-to-Server Stream Proxy   |
+------------------------------------+                        +------------------------------------+
```

---

## 4. User Roles & Permission Hierarchy

| Role | Access Level | Description |
| :--- | :--- | :--- |
| `student` | Student Portal | Can enroll (checkout), view payment status, watch protected lesson videos (when active), submit assignments/projects, view feedback, view announcements. |
| `mentor` | Mentor Review Panel | Can view assigned students, inspect submissions (GitHub/Live URL/files), grade assignments, request changes, approve work, add feedback. |
| `admin` | Full CMS & Financial Admin | Can manage curriculum (courses, modules, weeks, lessons), verify bKash payments, activate/suspend enrollments, manage mentors/students, configure Google Drive integration. |
| `super_admin` | System-Wide Superuser | All admin privileges plus system-wide configuration, access control overrides, and audit log access. |

---

## 5. Application Route Structure

```text
src/app/
├── (public)/
│   ├── page.jsx                        # Course landing page
│   ├── checkout/page.jsx               # bKash manual checkout & registration
│   ├── login/page.jsx                  # Student/Staff Login
│   ├── register/page.jsx               # Direct registration (redirects to checkout or dashboard)
│   ├── forgot-password/page.jsx        # Password recovery request
│   └── reset-password/page.jsx         # Password update view
│
├── (student)/
│   └── dashboard/
│       ├── page.jsx                    # Student overview (enrollment status, current week)
│       ├── course/
│       │   ├── page.jsx                # Curriculum week/module list
│       │   └── lessons/[lessonId]/page.jsx  # Video player, lesson content, resources
│       ├── assignments/
│       │   ├── page.jsx                # Assignment list & status
│       │   └── [assignmentId]/page.jsx # Submission view & history
│       ├── projects/
│       │   ├── page.jsx                # 14 Milestones & Capstone tracking
│       │   └── [projectId]/page.jsx    # Project details & submission
│       ├── announcements/page.jsx       # Course-wide announcements feed
│       └── profile/page.jsx            # Student profile settings
│
├── (mentor)/
│   └── mentor/
│       ├── page.jsx                    # Mentor review dashboard
│       ├── queue/page.jsx              # Pending submissions list
│       └── reviews/[submissionId]/page.jsx # Code inspection & grading UI
│
├── (admin)/
│   └── admin/
│       ├── page.jsx                    # Admin overview & stats
│       ├── payments/
│       │   ├── page.jsx                # bKash pending/approved payments table
│       │   └── [paymentId]/page.jsx    # Payment verification detail view
│       ├── course/
│       │   ├── modules/page.jsx        # Curriculum module manager
│       │   ├── weeks/page.jsx          # Week manager
│       │   └── lessons/
│       │       ├── page.jsx            # Lessons list
│       │       └── [lessonId]/edit.jsx # Lesson editor + Google Drive Video Verifier
│       ├── assignments/page.jsx        # Assignment management
│       ├── projects/page.jsx           # Milestone projects manager
│       ├── users/page.jsx              # User role & status management
│       └── settings/
│           ├── page.jsx                # General LMS settings
│           └── integrations/google/page.jsx # Google Drive OAuth setup & test
│
└── api/
    ├── auth/callback/route.js          # Supabase Auth callback handler
    ├── video/stream/[lessonId]/route.js# Server-side authorized Google Drive media streaming proxy
    ├── google/oauth/route.js           # Google Drive OAuth authorization redirect
    └── google/callback/route.js        # Google Drive OAuth token exchange callback
```

---

## 6. Server Components vs Client Components Strategy

1. **Server Components (Default):**
   - Data fetching directly from Supabase via server client (`@supabase/ssr`).
   - Page rendering, SEO metadata, landing page, curriculum overview, static content.
   - Authorization checks in Server Components before rendering sensitive layouts.

2. **Client Components (`'use client'`):**
   - Interactive forms (Checkout form, Assignment submission form, Login form).
   - Custom LMS Video Player with media event listeners, speed control, and progress tracking.
   - Dynamic filters, modal dialogs, tab switching, and toast triggers (Sonner).

3. **Data Mutation:**
   - Server Actions for form submissions, payment approvals, role assignments, and lesson updates.
   - Zod validation enforced on all Server Action inputs before database execution.

---

## 7. Operational Workflow Summary

```text
Visitor -> Landing Page -> Enrolls via Checkout -> Account Created + bKash Details Saved ->
Status: Payment Pending -> Admin Verifies bKash Txn ID -> Enrollment Set to Active ->
Student Gains Access to Protected Video Lessons & Assignments -> Mentor Reviews Code -> Approval/Resubmission
```
