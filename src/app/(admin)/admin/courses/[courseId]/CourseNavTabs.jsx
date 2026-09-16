'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, Video, Settings } from 'lucide-react';

export default function CourseNavTabs({ courseId }) {
  const pathname = usePathname();

  const tabs = [
    {
      name: 'Modules',
      href: `/admin/courses/${courseId}/modules`,
      icon: Layers,
    },
    {
      name: 'Lessons & Videos',
      href: `/admin/courses/${courseId}/lessons`,
      icon: Video,
    },
  ];

  return (
    <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              isActive
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
