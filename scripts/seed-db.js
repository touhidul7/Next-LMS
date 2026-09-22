import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env file manually
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  console.log('Seeding Supabase LMS Database...');

  // 1. Seed Course
  const courseData = {
    id: 'a1b2c3d4-e5f6-7890-abcd-111111111111',
    slug: 'frontend-development',
    title: 'Frontend Development — Complete 4-Month Flagship Program',
    description: 'Master modern web development from absolute fundamentals (HTML/CSS) to advanced JavaScript, React, Next.js, Framer Motion, and capstone deployment.',
    price_bdt: 8000.00,
    bkash_number: '01700000000',
    is_published: true,
  };

  const { error: courseError } = await supabase
    .from('courses')
    .upsert(courseData, { onConflict: 'slug' });

  if (courseError) {
    console.error('Error seeding course:', courseError.message);
  } else {
    console.log('✓ Course seeded successfully');
  }

  // 2. Seed Modules
  const modules = [
    { id: 'b1111111-1111-1111-1111-111111111111', course_id: courseData.id, title: 'Month 1 — Web Fundamentals', description: 'Internet basics, semantic HTML5, CSS fundamentals, Flexbox, CSS Grid, animations & mobile-first responsive design.', position: 1, month_number: 1 },
    { id: 'b2222222-2222-2222-2222-222222222222', course_id: courseData.id, title: 'Month 2 — Frameworks & Core JavaScript', description: 'Bootstrap UI, Tailwind CSS, JavaScript syntax, DOM manipulation, ES6+ features & interactive web tools.', position: 2, month_number: 2 },
    { id: 'b3333333-3333-3333-3333-333333333333', course_id: courseData.id, title: 'Month 3 — Async JS, REST APIs & React', description: 'Promises, Async/Await, Axios, React state, hooks, component architecture & React Router.', position: 3, month_number: 3 },
    { id: 'b4444444-4444-4444-4444-444444444444', course_id: courseData.id, title: 'Month 4 — Advanced Frontend & Production', description: 'Git/GitHub workflow, Lenis smooth scroll, Framer Motion animations, SaaS architecture & Final Capstone.', position: 4, month_number: 4 }
  ];

  const { error: modulesError } = await supabase.from('modules').upsert(modules, { onConflict: 'id' });
  if (modulesError) console.error('Error seeding modules:', modulesError.message);
  else console.log('✓ 4 Modules seeded successfully');

  // 3. Seed Weeks
  const weeks = [
    { id: 'c0010001-0001-0001-0001-000100010001', module_id: modules[0].id, title: 'Week 1 — Introduction to the Web', summary: 'How the web works, client-server model, HTTP/HTTPS, developer tools & VS Code setup.', week_number: 1, position: 1 },
    { id: 'c0020002-0002-0002-0002-000200020002', module_id: modules[0].id, title: 'Week 2 — Semantic HTML5', summary: 'Document structure, forms, inputs, tables, accessibility basics & SEO-friendly HTML.', week_number: 2, position: 2 },
    { id: 'c0030003-0003-0003-0003-000300030003', module_id: modules[0].id, title: 'Week 3 — CSS Fundamentals & Layouts', summary: 'Box model, Display, Position, Flexbox, CSS Grid & mobile-first media queries.', week_number: 3, position: 3 },
    { id: 'c0040004-0004-0004-0004-000400040004', module_id: modules[0].id, title: 'Week 4 — Advanced CSS & Keyframe Animations', summary: 'CSS Variables, transitions, transforms, keyframes, skeleton loaders & card hover effects.', week_number: 4, position: 4 },
    { id: 'c0050005-0005-0005-0005-000500050005', module_id: modules[1].id, title: 'Week 5 — Bootstrap Framework', summary: 'Containers, grid system, responsive utilities, components, modals & business layout.', week_number: 5, position: 5 },
    { id: 'c0060006-0006-0006-0006-000600060006', module_id: modules[1].id, title: 'Week 6 — Tailwind CSS', summary: 'Utility-first styling, configuration, custom colors, typography & SaaS layouts.', week_number: 6, position: 6 },
    { id: 'c0070007-0007-0007-0007-000700070007', module_id: modules[1].id, title: 'Week 7 — JavaScript Fundamentals', summary: 'Variables, data types, control flow, loops, functions, array & object operations.', week_number: 7, position: 7 },
    { id: 'c0080008-0008-0008-0008-000800080008', module_id: modules[1].id, title: 'Week 8 — DOM & Modern JavaScript', summary: 'Selecting elements, event handling, template literals, array methods (map, filter, reduce).', week_number: 8, position: 8 },
    { id: 'c0090009-0009-0009-0009-000900090009', module_id: modules[2].id, title: 'Week 9 — Async JavaScript & REST APIs', summary: 'Promises, async/await, REST architecture, JSON, Axios & error handling.', week_number: 9, position: 9 },
    { id: 'c0100010-0010-0010-0010-001000100010', module_id: modules[2].id, title: 'Week 10 — React Fundamentals', summary: 'SPA concepts, JSX, components, props, composition & dynamic rendering.', week_number: 10, position: 10 },
    { id: 'c0110011-0011-0011-0011-001100110011', module_id: modules[2].id, title: 'Week 11 — React State & Hooks', summary: 'useState, controlled forms, useEffect lifecycle, side effects & state-driven UI.', week_number: 11, position: 11 },
    { id: 'c0120012-0012-0012-0012-001200120012', module_id: modules[2].id, title: 'Week 12 — Advanced React & Router', summary: 'Axios integration, dynamic filtering, custom hooks & React Router navigation.', week_number: 12, position: 12 },
    { id: 'c0130013-0013-0013-0013-001300130013', module_id: modules[3].id, title: 'Week 13 — Project Architecture & Git Workflow', summary: 'Clean folder structures, environment variables, Git branching & GitHub collaboration.', week_number: 13, position: 13 },
    { id: 'c0140014-0014-0014-0014-001400140014', module_id: modules[3].id, title: 'Week 14 — Smooth Scrolling & Framer Motion', summary: 'Lenis smooth scrolling, page transitions, scroll animations & interactive motion variants.', week_number: 14, position: 14 },
    { id: 'c0150015-0015-0015-0015-001500150015', module_id: modules[3].id, title: 'Week 15 — Professional SaaS Web App', summary: 'Building a modern production-ready SaaS application with smooth scroll & animations.', week_number: 15, position: 15 },
    { id: 'c0160016-0016-0016-0016-001600160016', module_id: modules[3].id, title: 'Week 16 — Final Capstone Project', summary: 'End-to-end building and deployment of a full frontend application.', week_number: 16, position: 16 }
  ];

  const { error: weeksError } = await supabase.from('weeks').upsert(weeks, { onConflict: 'id' });
  if (weeksError) console.error('Error seeding weeks:', weeksError.message);
  else console.log('✓ 16 Weeks seeded successfully');

  // 4. Seed Projects
  const projects = [
    { course_id: courseData.id, week_id: weeks[0].id, title: 'Personal Introduction Page', description: 'Build a personal portfolio intro page with profile, skills, and contact links.', milestone_number: 1, is_capstone: false },
    { course_id: courseData.id, week_id: weeks[1].id, title: 'Multi-Page Business Website', description: 'Create a 4-page responsive website (Home, About, Services, Contact) using semantic HTML.', milestone_number: 2, is_capstone: false },
    { course_id: courseData.id, week_id: weeks[2].id, title: 'Responsive Landing Page', description: 'Design-to-code implementation of a mobile-first responsive product landing page.', milestone_number: 3, is_capstone: false },
    { course_id: courseData.id, week_id: weeks[3].id, title: 'Animated Modern Website', description: 'Responsive web page featuring CSS keyframe animations, card transitions & hover effects.', milestone_number: 4, is_capstone: false },
    { course_id: courseData.id, week_id: weeks[4].id, title: 'Bootstrap Business Website', description: 'Construct a business layout using Bootstrap containers, grid system & components.', milestone_number: 5, is_capstone: false },
    { course_id: courseData.id, week_id: weeks[5].id, title: 'Tailwind SaaS Landing Page', description: 'Build a modern utility-first SaaS landing page using Tailwind CSS.', milestone_number: 6, is_capstone: false },
    { course_id: courseData.id, week_id: weeks[6].id, title: 'JavaScript Todo App', description: 'Interactive task management app demonstrating arrays, objects & DOM updates.', milestone_number: 7, is_capstone: false },
    { course_id: courseData.id, week_id: weeks[7].id, title: 'JavaScript Expense Tracker', description: 'Expense tracking web tool utilizing DOM events, LocalStorage & dynamic calculations.', milestone_number: 8, is_capstone: false },
    { course_id: courseData.id, week_id: weeks[8].id, title: 'Weather API Application', description: 'Asynchronous weather app consuming REST API endpoints with search & loading states.', milestone_number: 9, is_capstone: false },
    { course_id: courseData.id, week_id: weeks[9].id, title: 'React Todo Application', description: 'Single Page Application built with React functional components & props.', milestone_number: 10, is_capstone: false },
    { course_id: courseData.id, week_id: weeks[11].id, title: 'React Product Directory', description: 'React app featuring product listing, search, dynamic category filtering & routing.', milestone_number: 11, is_capstone: false },
    { course_id: courseData.id, week_id: weeks[13].id, title: 'Animated Portfolio Website', description: 'Portfolio showcase incorporating Lenis smooth scroll and Framer Motion animations.', milestone_number: 12, is_capstone: false },
    { course_id: courseData.id, week_id: weeks[14].id, title: 'React SaaS Web Application', description: 'Complete multi-page SaaS web app with API integration and responsive design.', milestone_number: 13, is_capstone: false },
    { course_id: courseData.id, week_id: weeks[15].id, title: 'Final Capstone Project', description: 'Comprehensive flagship capstone project built and deployed to production.', milestone_number: 14, is_capstone: true }
  ];

  const { error: projectsError } = await supabase.from('projects').insert(projects, { ignoreDuplicates: true });
  if (projectsError) console.error('Error seeding projects:', projectsError.message);
  else console.log('✓ 14 Milestone projects seeded successfully');

  console.log('Seeding finished!');
}

seed();
