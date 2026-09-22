'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FaqAccordion({ faqsData }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => setOpenFaq(openFaq === idx ? null : idx);

  return (
    <div className="space-y-3">
      {faqsData.map((faq, idx) => (
        <div key={idx} className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
          <button
            onClick={() => toggleFaq(idx)}
            className="w-full p-4 flex items-center justify-between text-left font-medium text-sm text-white hover:bg-slate-900/50 transition-colors cursor-pointer"
          >
            <span>{faq.q}</span>
            {openFaq === idx ? (
              <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            )}
          </button>
          {openFaq === idx && (
            <div className="px-4 pb-4 pt-1 border-t border-slate-800 text-xs text-slate-300 leading-relaxed font-normal">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
