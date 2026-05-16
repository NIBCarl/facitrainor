# Fcamp Training Platform - Design Specification

## 🎯 Understanding Summary
*   **What:** A full-stack Training Management System (Fcamp) featuring a Trainee learning dashboard and an Admin CMS portal.
*   **Why:** To systematically train users, evaluate them via quizzes and physical meetups, and automatically issue certificates to identify future facilitators.
*   **Who:** A small cohort (10-20 trainees per batch) and a few administrators.
*   **Key constraints:** Optimize architecture to stay within the free tiers of Supabase and Cloudinary. 
*   **Explicit non-goals:** No multi-tenant enterprise scaling. No complex drag-and-drop website builder for admins.

## 📝 Key Assumptions
*   **Account Creation:** Admins manually create accounts and distribute credentials; trainees cannot self-register.
*   **Progression Logic:** The 70% passing threshold is a universal, hardcoded rule across all modules for this MVP.
*   **Attendance:** Determined automatically by the system logging the timestamp when a trainee submits their first daily quiz.
*   **Certificates:** Supabase Edge Functions will automatically generate the final PDF certificate.
*   **Hosting/SLA:** Standard availability (no strict SLAs) is acceptable for this small-scale use case.

## 📖 Decision Log
1. **Scope:** Proceeded with the "Full Platform" MVP to deliver both Admin and Trainee experiences immediately, bypassing a phased rollout.
2. **Content Storage:** Opted for a "Smart Form" approach where module content (text, Cloudinary videos, quizzes) is stored as a `JSONB` array in the Supabase database. *Why:* Simplifies the UI for Admins (acts like a basic form) while allowing developers to easily scale or modify the structure in the future without database migrations.
3. **Frontend Architecture:** Chosen Next.js App Router with Server-Side Rendering (SSR). *Why:* Provides robust route protection via Middleware, eliminating UI flicker on authentication checks and establishing a modern standard.
4. **UI Design System:** Adopted a custom theme using Light Blue (Primary) and White/Black (Secondary) implemented via Tailwind CSS and shadcn/ui components.

## 🏗️ Final Design

### Database Schema (Supabase)
*   **`users`**: Built-in Auth table.
*   **`profiles`**: `id` (references users), `role` (admin/trainee), `full_name`.
*   **`modules`**: `id`, `title`, `order_index`.
*   **`pages`**: `id`, `module_id`, `content` (JSONB: holds text blocks, Cloudinary URLs, quiz arrays).
*   **`submissions`**: `id`, `trainee_id`, `page_id`, `score`, `is_passing` (boolean).
*   **`summative_scores`**: `id`, `trainee_id`, `score`, `notes`.

### Routing & Security
*   **`(public)`**: `/login`
*   **`(trainee)`**: `/dashboard`, `/module/[id]`, `/certificate`. Protected by Middleware (requires `trainee` role). Server calculates unlocked modules based on `submissions`.
*   **`(admin)`**: `/admin/dashboard`, `/admin/users`, `/admin/content`, `/admin/grading`. Protected by Middleware (requires `admin` role).

### Error Handling & Edge Cases
*   Direct URL manipulation to access locked modules results in a server-side redirect to `/dashboard` with an error toast.
*   Failed media loads (Cloudinary) trigger skeleton fallbacks rather than breaking the UI.
