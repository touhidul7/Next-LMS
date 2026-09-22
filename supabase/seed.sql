-- ====================================================================
-- Frontend Development LMS — Flagship 16-Week Course Seed Data
-- ====================================================================

-- 1. INSERT FLAGSHIP COURSE
INSERT INTO public.courses (id, slug, title, description, price_bdt, bkash_number, is_published)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-111111111111',
  'frontend-development',
  'Frontend Development — Complete 4-Month Flagship Program',
  'Master modern web development from absolute fundamentals (HTML/CSS) to advanced JavaScript, React, Next.js, Framer Motion, and capstone deployment.',
  8000.00,
  '01700000000',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price_bdt = EXCLUDED.price_bdt,
  bkash_number = EXCLUDED.bkash_number;

-- 2. INSERT 4 MONTH MODULES
INSERT INTO public.modules (id, course_id, title, description, position, month_number)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-111111111111', 'Month 1 — Web Fundamentals', 'Internet basics, semantic HTML5, CSS fundamentals, Flexbox, CSS Grid, animations & mobile-first responsive design.', 1, 1),
  ('b2222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-111111111111', 'Month 2 — Frameworks & Core JavaScript', 'Bootstrap UI, Tailwind CSS, JavaScript syntax, DOM manipulation, ES6+ features & interactive web tools.', 2, 2),
  ('b3333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-111111111111', 'Month 3 — Async JS, REST APIs & React', 'Promises, Async/Await, Axios, React state, hooks, component architecture & React Router.', 3, 3),
  ('b4444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7890-abcd-111111111111', 'Month 4 — Advanced Frontend & Production', 'Git/GitHub workflow, Lenis smooth scroll, Framer Motion animations, SaaS architecture & Final Capstone.', 4, 4)
ON CONFLICT (id) DO NOTHING;

-- 3. INSERT 16 CURRICULUM WEEKS
INSERT INTO public.weeks (id, module_id, title, summary, week_number, position)
VALUES
  ('w01-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'Week 1 — Introduction to the Web', 'How the web works, client-server model, HTTP/HTTPS, developer tools & VS Code setup.', 1, 1),
  ('w02-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'Week 2 — Semantic HTML5', 'Document structure, forms, inputs, tables, accessibility basics & SEO-friendly HTML.', 2, 2),
  ('w03-3333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'Week 3 — CSS Fundamentals & Layouts', 'Box model, Display, Position, Flexbox, CSS Grid & mobile-first media queries.', 3, 3),
  ('w04-4444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', 'Week 4 — Advanced CSS & Keyframe Animations', 'CSS Variables, transitions, transforms, keyframes, skeleton loaders & card hover effects.', 4, 4),
  ('w05-5555-5555-5555-5555-555555555555', 'b2222222-2222-2222-2222-222222222222', 'Week 5 — Bootstrap Framework', 'Containers, grid system, responsive utilities, components, modals & business layout.', 5, 5),
  ('w06-6666-6666-6666-6666-666666666666', 'b2222222-2222-2222-2222-222222222222', 'Week 6 — Tailwind CSS', 'Utility-first styling, configuration, custom colors, typography & SaaS layouts.', 6, 6),
  ('w07-7777-7777-7777-7777-777777777777', 'b2222222-2222-2222-2222-222222222222', 'Week 7 — JavaScript Fundamentals', 'Variables, data types, control flow, loops, functions, array & object operations.', 7, 7),
  ('w08-8888-8888-8888-8888-888888888888', 'b2222222-2222-2222-2222-222222222222', 'Week 8 — DOM & Modern JavaScript', 'Selecting elements, event handling, template literals, array methods (map, filter, reduce).', 8, 8),
  ('w09-9999-9999-9999-9999-999999999999', 'b3333333-3333-3333-3333-333333333333', 'Week 9 — Async JavaScript & REST APIs', 'Promises, async/await, REST architecture, JSON, Axios & error handling.', 9, 9),
  ('w10-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'b3333333-3333-3333-3333-333333333333', 'Week 10 — React Fundamentals', 'SPA concepts, JSX, components, props, composition & dynamic rendering.', 10, 10),
  ('w11-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'b3333333-3333-3333-3333-333333333333', 'Week 11 — React State & Hooks', 'useState, controlled forms, useEffect lifecycle, side effects & state-driven UI.', 11, 11),
  ('w12-cccc-cccc-cccc-cccccccccccc', 'b3333333-3333-3333-3333-333333333333', 'Week 12 — Advanced React & Router', 'Axios integration, dynamic filtering, custom hooks & React Router navigation.', 12, 12),
  ('w13-dddd-dddd-dddd-dddddddddddd', 'b4444444-4444-4444-4444-444444444444', 'Week 13 — Project Architecture & Git Workflow', 'Clean folder structures, environment variables, Git branching & GitHub collaboration.', 13, 13),
  ('w14-eeee-eeee-eeee-eeeeeeeeeeee', 'b4444444-4444-4444-4444-444444444444', 'Week 14 — Smooth Scrolling & Framer Motion', 'Lenis smooth scrolling, page transitions, scroll animations & interactive motion variants.', 14, 14),
  ('w15-ffff-ffff-ffff-ffffffffffff', 'b4444444-4444-4444-4444-444444444444', 'Week 15 — Professional SaaS Web App', 'Building a modern production-ready SaaS application with smooth scroll & animations.', 15, 15),
  ('w16-1616-1616-1616-161616161616', 'b4444444-4444-4444-4444-444444444444', 'Week 16 — Final Capstone Project', 'End-to-end building and deployment of a full frontend application.', 16, 16)
ON CONFLICT (id) DO NOTHING;

-- 4. INSERT 14 MILESTONE PROJECTS & CAPSTONE
INSERT INTO public.projects (course_id, week_id, title, description, milestone_number, is_capstone)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'w01-1111-1111-1111-111111111111', 'Personal Introduction Page', 'Build a personal portfolio intro page with profile, skills, and contact links.', 1, false),
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'w02-2222-2222-2222-222222222222', 'Multi-Page Business Website', 'Create a 4-page responsive website (Home, About, Services, Contact) using semantic HTML.', 2, false),
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'w03-3333-3333-3333-333333333333', 'Responsive Landing Page', 'Design-to-code implementation of a mobile-first responsive product landing page.', 3, false),
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'w04-4444-4444-4444-444444444444', 'Animated Modern Website', 'Responsive web page featuring CSS keyframe animations, card transitions & hover effects.', 4, false),
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'w05-5555-5555-5555-5555-555555555555', 'Bootstrap Business Website', 'Construct a business layout using Bootstrap containers, grid system & components.', 5, false),
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'w06-6666-6666-6666-6666-666666666666', 'Tailwind SaaS Landing Page', 'Build a modern utility-first SaaS landing page using Tailwind CSS.', 6, false),
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'w07-7777-7777-7777-7777-777777777777', 'JavaScript Todo App', 'Interactive task management app demonstrating arrays, objects & DOM updates.', 7, false),
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'w08-8888-8888-8888-8888-888888888888', 'JavaScript Expense Tracker', 'Expense tracking web tool utilizing DOM events, LocalStorage & dynamic calculations.', 8, false),
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'w09-9999-9999-9999-9999-999999999999', 'Weather API Application', 'Asynchronous weather app consuming REST API endpoints with search & loading states.', 9, false),
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'w10-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'React Todo Application', 'Single Page Application built with React functional components & props.', 10, false),
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'w12-cccc-cccc-cccc-cccccccccccc', 'React Product Directory', 'React app featuring product listing, search, dynamic category filtering & routing.', 11, false),
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'w14-eeee-eeee-eeee-eeeeeeeeeeee', 'Animated Portfolio Website', 'Portfolio showcase incorporating Lenis smooth scroll and Framer Motion animations.', 12, false),
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'w15-ffff-ffff-ffff-ffffffffffff', 'React SaaS Web Application', 'Complete multi-page SaaS web app with API integration and responsive design.', 13, false),
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'w16-1616-1616-1616-161616161616', 'Final Capstone Project', 'Comprehensive flagship capstone project built and deployed to production.', 14, true);
