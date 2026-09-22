import Link from 'next/link';
import { getCurrentProfile } from '@/lib/auth/server';
import CurriculumAccordion from '@/components/home/CurriculumAccordion';
import FaqAccordion from '@/components/home/FaqAccordion';
import BrandLogo from '@/components/BrandLogo';
import {
  BookOpen,
  ShieldCheck,
  Video,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  Terminal,
  Users,
  Award,
  HelpCircle,
  Laptop,
  LayoutDashboard
} from 'lucide-react';

export default async function Home() {
  const profile = await getCurrentProfile();
  const sessionUser = Boolean(profile);
  const userRole = profile?.role;

  const weeksData = [
    { id: 1, month: 'Month 1', title: 'Week 1 — Introduction to the Web', summary: 'How the web works, client-server model, HTTP/HTTPS, browser devtools & editor setup.', topics: ['What is a website', 'HTTP/HTTPS protocol', 'VS Code setup', 'First HTML page'] },
    { id: 2, month: 'Month 1', title: 'Week 2 — Semantic HTML5 & Accessibility', summary: 'Document structure, headings, forms, inputs, tables, accessibility & SEO best practices.', topics: ['Semantic elements', 'Forms & validations', 'A11y accessibility', 'SEO HTML structure'] },
    { id: 3, month: 'Month 1', title: 'Week 3 — CSS Fundamentals & Layouts', summary: 'Selectors, box model, Flexbox, CSS Grid, media queries & mobile-first responsive design.', topics: ['Box model & position', 'Flexbox deep dive', 'CSS Grid layouts', 'Mobile-first breakpoints'] },
    { id: 4, month: 'Month 1', title: 'Week 4 — Advanced CSS & Keyframe Animations', summary: 'CSS variables, keyframe animations, card hover effects, transforms & loading skeletons.', topics: ['CSS custom properties', '@keyframes & transitions', 'Card animations', 'Skeleton loaders'] },
    { id: 5, month: 'Month 2', title: 'Week 5 — Bootstrap Framework', summary: 'Grid system, utility classes, components, modals, responsive navigation & business layouts.', topics: ['Bootstrap grid', 'Utilities & cards', 'Interactive modals', 'Business website UI'] },
    { id: 6, month: 'Month 2', title: 'Week 6 — Tailwind CSS', summary: 'Utility-first styling, custom configuration, responsive variants & SaaS landing pages.', topics: ['Utility-first workflow', 'Custom theme config', 'Hover & active states', 'SaaS component UI'] },
    { id: 7, month: 'Month 2', title: 'Week 7 — JavaScript Fundamentals', summary: 'Variables, data types, control flow, loops, functions, array & object manipulation.', topics: ['let / const & types', 'If/else & loops', 'Arrow functions', 'Array & object methods'] },
    { id: 8, month: 'Month 2', title: 'Week 8 — DOM & Modern JavaScript', summary: 'Selecting elements, event listeners, template literals, destructuring & ES6+ modules.', topics: ['DOM manipulation', 'Event handling', 'Template literals & spread', 'map, filter, reduce'] },
    { id: 9, month: 'Month 3', title: 'Week 9 — Async JavaScript & REST APIs', summary: 'Callbacks, Promises, Async/Await, HTTP methods, JSON, Axios & error handling.', topics: ['Promises & async/await', 'REST API principles', 'Axios GET / POST', 'Loading & error states'] },
    { id: 10, month: 'Month 3', title: 'Week 10 — React Fundamentals', summary: 'SPA architecture, Vite, JSX syntax, functional components, props & dynamic lists.', topics: ['SPA vs traditional', 'JSX & components', 'Props & composition', 'List keys & rendering'] },
    { id: 11, month: 'Month 3', title: 'Week 11 — React State & Hooks', summary: 'useState, controlled forms, useEffect lifecycle, side effects & state-driven UI.', topics: ['useState state management', 'Controlled input forms', 'useEffect lifecycle', 'Todo & Quiz apps'] },
    { id: 12, month: 'Month 3', title: 'Week 12 — Advanced React & Router', summary: 'Axios integration, dynamic filtering, search, custom hooks & React Router navigation.', topics: ['Axios + React integration', 'Search & category filter', 'Custom hooks', 'React Router SPA'] },
    { id: 13, month: 'Month 4', title: 'Week 13 — Project Architecture & Git Workflow', summary: 'Component folder structure, environment variables, Git branching & GitHub collaboration.', topics: ['Professional folder tree', 'Git init / commit / push', 'GitHub repositories', 'Environment variables'] },
    { id: 14, month: 'Month 4', title: 'Week 14 — Smooth Scroll & Framer Motion', summary: 'Lenis smooth scrolling, scroll-based effects, Framer Motion motion variants & transitions.', topics: ['Lenis scroll setup', 'Motion components', 'Page transitions', 'Scroll trigger animations'] },
    { id: 15, month: 'Month 4', title: 'Week 15 — Professional SaaS Web App', summary: 'Building a complete responsive SaaS application with animations, API calls & dark mode.', topics: ['Production SaaS UI', 'Framer Motion + Lenis', 'Form validation & state', 'Responsive QA'] },
    { id: 16, month: 'Month 4', title: 'Week 16 — Final Capstone Project', summary: 'Choosing, building, reviewing and deploying a flagship capstone application.', topics: ['E-commerce / LMS / Agency', 'Mentor code review', 'Deployment to Vercel', 'Portfolio showcase'] }
  ];

  const projectsData = [
    { number: 1, title: 'Personal Introduction Page', month: 'Month 1', tech: 'HTML5 / CSS3', description: 'Profile, about section, skills grid and contact links.' },
    { number: 2, title: 'Multi-Page Business Website', month: 'Month 1', tech: 'Semantic HTML5', description: 'Home, About, Services & Contact pages with responsive layout.' },
    { number: 3, title: 'Responsive Landing Page', month: 'Month 1', tech: 'CSS Flexbox & Grid', description: 'Mobile-first design-to-code product landing page.' },
    { number: 4, title: 'Modern Animated Website', month: 'Month 1', tech: 'CSS Keyframes', description: 'CSS keyframe animations, scale transitions & skeleton loaders.' },
    { number: 5, title: 'Bootstrap Business Portal', month: 'Month 2', tech: 'Bootstrap 5', description: 'Grid layout with responsive navbars, cards & interactive modals.' },
    { number: 6, title: 'Tailwind SaaS Web Page', month: 'Month 2', tech: 'Tailwind CSS', description: 'Utility-first SaaS landing page with dark theme.' },
    { number: 7, title: 'JavaScript Todo App', month: 'Month 2', tech: 'JavaScript DOM', description: 'Task CRUD operations with array state & LocalStorage.' },
    { number: 8, title: 'JS Expense Tracker', month: 'Month 2', tech: 'JavaScript DOM', description: 'Dynamic income/expense calculations with DOM events.' },
    { number: 9, title: 'Weather API Application', month: 'Month 3', tech: 'Async JS & Axios', description: 'Live REST API search with loading and error states.' },
    { number: 10, title: 'React Todo SPA', month: 'Month 3', tech: 'React & Hooks', description: 'State-driven task manager using useState and components.' },
    { number: 11, title: 'React Product Directory', month: 'Month 3', tech: 'React Router & Axios', description: 'Product list, details page, category filtering & search.' },
    { number: 12, title: 'Animated Portfolio', month: 'Month 4', tech: 'Lenis & Framer Motion', description: 'Smooth scrolling portfolio with scroll-triggered animations.' },
    { number: 13, title: 'React SaaS Web App', month: 'Month 4', tech: 'React + Tailwind + Motion', description: 'Production SaaS layout with API services & micro-interactions.' },
    { number: 14, title: 'Final Capstone Project', month: 'Month 4', tech: 'Full Stack LMS / SaaS', description: 'Flagship capstone application inspected by mentors & deployed live.' }
  ];

  const faqsData = [
    { q: 'Who is this course for?', a: 'This course is designed for absolute beginners, university students, and career switchers who want to build a career in frontend web development.' },
    { q: 'How does enrollment and payment work?', a: 'After clicking Enroll, you will be taken to the secure checkout page where you can complete payment and submit your transaction details. Your account will be activated upon admin verification, usually within 1-6 hours.' },
    { q: 'What happens if my payment is pending?', a: 'After checkout, you can log in to your dashboard to view your payment status. Your status will update from "Verification Pending" to "Active" as soon as an admin approves your payment.' },
    { q: 'How are course videos delivered?', a: 'Videos are securely streamed directly through our custom LMS player without public links or raw iframe embeds, preserving video privacy.' },
    { q: 'How do mentor reviews work?', a: 'For every assignment and project, you submit your GitHub repository and live demo links. A mentor inspects your code, provides structured feedback, and approves or requests changes.' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <BrandLogo className="h-7 sm:h-8" />
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#curriculum" className="hover:text-[#fa8b98] transition-colors">Curriculum</a>
            <a href="#projects" className="hover:text-[#fa8b98] transition-colors">Projects</a>
            <a href="#tech" className="hover:text-[#fa8b98] transition-colors">Stack</a>
            <a href="#pricing" className="hover:text-[#fa8b98] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[#fa8b98] transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center space-x-4">
            {sessionUser ? (
              <Link
                href={userRole === 'admin' || userRole === 'super_admin' ? '/admin' : '/dashboard'}
                className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg bg-[#175cff]/10 text-[#60a5fa] border border-[#175cff]/30 hover:bg-[#175cff]/20 transition-all flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                {userRole === 'admin' || userRole === 'super_admin' ? 'Admin Panel' : 'My Dashboard'}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/checkout"
                  className="text-sm font-bold px-4 py-2 rounded-lg bg-gradient-to-r from-[#175cff] to-[#fa8b98] text-white hover:shadow-lg hover:shadow-[#175cff]/25 transition-all"
                >
                  Enroll Now
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-800/80">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#175cff]/15 via-[#fa8b98]/10 to-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#1c2f3d]/60 border border-[#fa8b98]/40 text-xs text-[#fa8b98] font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#fa8b98]" />
              <span>GenSolve Academy — Flagship 4-Month Frontend Engineering Program</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
              Become a Production-Ready{' '}
              <span className="bg-gradient-to-r from-[#fa8b98] via-[#818cf8] to-[#175cff] bg-clip-text text-transparent">
                Frontend Developer
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
              From web fundamentals and modern JavaScript to React 19, Next.js, and animated SaaS interfaces. Build 14 real-world projects with personalized mentor code reviews.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/checkout"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold hover:shadow-xl hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 text-base"
              >
                Enroll Now <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#curriculum"
                className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel border border-slate-800 text-white font-medium hover:bg-slate-900/60 transition-all flex items-center justify-center gap-2 text-base"
              >
                View Curriculum
              </a>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="max-w-4xl mx-auto px-4 mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-2xl font-black text-white">16 Weeks</div>
              <div className="text-xs text-slate-400 mt-1">Structured Roadmap</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-2xl font-black text-cyan-400">14 Projects</div>
              <div className="text-xs text-slate-400 mt-1">+ Final Capstone</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-2xl font-black text-purple-400">Mentor Review</div>
              <div className="text-xs text-slate-400 mt-1">GitHub & Live Feedback</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800">
              <div className="text-2xl font-black text-emerald-400">Instant Access</div>
              <div className="text-xs text-slate-400 mt-1">After Verification</div>
            </div>
          </div>
        </section>

        {/* Tech Stack Grid */}
        <section id="tech" className="py-16 bg-slate-950/60 border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">Skills You Will Master</h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto font-normal">
              Industry-standard tools and frameworks required by modern software teams.
            </p>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {['HTML5', 'CSS3', 'Bootstrap 5', 'Tailwind CSS', 'JavaScript ES6+', 'DOM Manipulation', 'REST APIs', 'Axios', 'React 19', 'Next.js', 'Framer Motion', 'Lenis Scroll'].map((tech) => (
                <div key={tech} className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center justify-center font-medium text-sm text-slate-200 hover:border-cyan-500/50 hover:text-cyan-400 transition-all">
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 16-Week Curriculum Accordion */}
        <section id="curriculum" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-medium text-cyan-400 uppercase tracking-widest">Module Breakdown</span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mt-2">16-Week Learning Path</h2>
            <p className="text-sm text-slate-400 mt-2 font-normal">
              Click any week to view lesson topics and assignments.
            </p>
          </div>

          <CurriculumAccordion weeksData={weeksData} />
        </section>

        {/* Projects Showcase */}
        <section id="projects" className="py-16 bg-slate-950/80 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-medium text-purple-400 uppercase tracking-widest">Portfolio First</span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mt-2">14 Milestone Projects + Final Capstone</h2>
              <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto font-normal">
                You build real applications every step of the way, submitted via GitHub for mentor code review.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectsData.map((proj) => (
                <div key={proj.number} className="glass-panel p-6 rounded-2xl border border-slate-800 relative group hover:border-cyan-500/50 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Project #{proj.number}
                    </span>
                    <span className="text-[10px] font-medium text-cyan-400">{proj.month}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{proj.title}</h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed font-normal">{proj.description}</p>
                  <div className="text-[11px] font-mono font-medium text-purple-300 border-t border-slate-800/80 pt-3">
                    Stack: {proj.tech}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-cyan-800/50 relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-xs text-cyan-400 font-medium mb-4">
              <CreditCard className="w-3.5 h-3.5" /> One-Time Enrollment Fee
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold text-white">Simple, All-Inclusive Pricing</h2>
            <div className="mt-6 flex items-baseline justify-center gap-2">
              <span className="text-4xl sm:text-5xl font-bold text-cyan-400">৳8,000</span>
              <span className="text-slate-400 font-normal text-sm">BDT / One-time</span>
            </div>

            <ul className="mt-8 max-w-md mx-auto space-y-3 text-left text-xs text-slate-300 font-normal">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> Full 16-Week Curriculum Access
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> Private Google Drive Video Streaming
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> 14 Milestone Projects + Final Capstone
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> Direct Mentor Code Review on GitHub
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> Fast Account Activation After Verification
              </li>
            </ul>

            <div className="mt-10">
              <Link
                href="/checkout"
                className="w-full sm:w-auto inline-flex px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold hover:shadow-xl hover:shadow-cyan-500/25 transition-all items-center justify-center gap-2 text-base"
              >
                Enroll Now <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white">Frequently Asked Questions</h2>
          </div>

          <FaqAccordion faqsData={faqsData} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo className="h-6 sm:h-7" />
          </Link>
          <p>
            GenSolve Academy &copy; {new Date().getFullYear()} — All rights reserved.
          </p>
          <a
            href="http://gensolveacademy.site/"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Main Website &rarr;
          </a>
        </div>
      </footer>
    </div>
  );
}
