# Frontend Development LMS — Security & Authorization Architecture

## 1. Security Overview

Security is a core requirement for this LMS. The application strictly isolates customer data, protects private video assets, prevents unauthorized course access, enforces transactional integrity during checkout and payment approval, and safeguards server-side secrets.

---

## 2. Secrets Management & Environment Isolation

### Strict Environment Variables Rules

1. Secrets must **NEVER** be prefixed with `NEXT_PUBLIC_`.
2. Prohibited public exposure includes:
   - Supabase Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)
   - Google Client Secret (`GOOGLE_CLIENT_SECRET`)
   - Google OAuth Refresh Token
   - Internal Encryption / Signing Keys
3. Public environment variables (safe for browser client):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`

---

## 3. Server Authorization Helpers (`src/lib/auth/server.js`)

All protected actions and data reads must use server-side validation functions rather than relying solely on client-provided session state.

```javascript
/**
 * Require valid logged in user session
 */
export async function requireAuth() { ... }

/**
 * Require user to have an ACTIVE enrollment for the given course
 */
export async function requireActiveEnrollment(courseId) { ... }

/**
 * Require user to possess Admin or Super Admin role
 */
export async function requireAdminRole() { ... }

/**
 * Require user to possess Mentor, Admin, or Super Admin role
 */
export async function requireStaffRole() { ... }
```

---

## 4. Manual bKash Payment & Transaction Safety

1. **Self-Service Activation Prevention:**
   - When a student completes checkout, `payments.status` is set to `'pending'` and `enrollments.status` is set to `'pending'`.
   - Students cannot modify their own payment status or enrollment status under any circumstances (enforced by RLS policies).

2. **Transactional Approval Pattern:**
   - Admin payment approval operates in a single atomic server-side function/action.
   - Updates `payments.status = 'approved'` and `enrollments.status = 'active'` together.
   - Prevents partial states where payment is approved but access remains pending.

---

## 5. Row-Level Security (RLS) Principles

- **Default Deny:** RLS is enabled on every table in the database schema.
- **Client Access Restriction:** Client components query using `anon` key tied to user JWT.
- **Service Role Bypass:** Administrative background tasks and OAuth token storage use server-side execution with `SUPABASE_SERVICE_ROLE_KEY`.

---

## 6. Video Content Security

- Google Drive private video file IDs are never directly exposed as public URLs.
- Video stream proxy enforces double check:
  1. Valid Supabase session check.
  2. Active course enrollment check.
- Unauthorized or pending users requesting stream endpoints receive `403 Forbidden` responses.
