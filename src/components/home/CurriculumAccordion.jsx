'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

export default function CurriculumAccordion({ weeksData }) {
  const [openWeek, setOpenWeek] = useState(null);

  const toggleWeek = (id) => setOpenWeek(openWeek === id ? null : id);

  return (
    <div className="space-y-3">
      {weeksData.map((week) => (
        <div
          key={week.id}
          className="glass-panel rounded-xl border border-slate-800 overflow-hidden transition-all"
        >
          <button
            onClick={() => toggleWeek(week.id)}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-900/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-800 text-[#fa8b98] border border-slate-700">
                {week.month}
              </span>
              <span className="text-base font-medium text-white">{week.title}</span>
            </div>
            {openWeek === week.id ? (
              <ChevronUp className="w-5 h-5 text-[#fa8b98] shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
            )}
          </button>

          {openWeek === week.id && (
            <div className="px-5 pb-5 pt-1 border-t border-slate-800/80 bg-slate-950/40">
              <p className="text-sm text-slate-300 font-normal leading-relaxed">{week.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {week.topics.map((topic, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300 font-normal"
                  >
                    <BookOpen className="w-3 h-3 text-[#175cff]" /> {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
