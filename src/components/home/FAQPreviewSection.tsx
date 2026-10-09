import React, { useState } from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { demoFAQs } from '../../data/faqs';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQItem } from '../../types/faq';

interface FAQPreviewProps {
  faqs?: FAQItem[];
}

export const FAQPreviewSection: React.FC<FAQPreviewProps> = ({ faqs = demoFAQs }) => {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-16 sm:py-24 bg-[#FAFAFB] border-t border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Common Questions"
          title="Frequently Asked Questions"
          description="Straightforward answers about our lady doctors, appointment scheduling, confidentiality, and services."
        />

        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-slate-200/90 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                >
                  <span className="text-base font-semibold text-slate-900 leading-snug">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-rose-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in-50 duration-150">
                    <p>{faq.answer}</p>
                    <div className="mt-3 text-[11px] text-slate-400 font-mono">
                      Category: {faq.category}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Reassurance footnote */}
        <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Have a specific clinical or scheduling question? Feel free to contact our reception team anytime.</span>
        </div>
      </div>
    </section>
  );
};
