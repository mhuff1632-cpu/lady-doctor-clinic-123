import React from 'react';
import { Award, HeartHandshake, Sparkles, Building2 } from 'lucide-react';

export const TrustHighlightsSection: React.FC = () => {
  const highlights = [
    {
      icon: Award,
      title: 'Experienced Lady Doctors',
      description:
        'Board-certified female specialists with extensive clinical tenure in obstetrics, gynecology, and child health.',
    },
    {
      icon: HeartHandshake,
      title: 'Patient-Centered Care',
      description:
        'Unhurried, attentive appointments where questions are encouraged, and diagnostic choices are thoroughly explained.',
    },
    {
      icon: Sparkles,
      title: 'Modern Healthcare',
      description:
        'Up-to-date evidence-based clinical practices with high-definition sonography and dedicated lab coordination.',
    },
    {
      icon: Building2,
      title: 'Comfortable Environment',
      description:
        'A discreet, peaceful clinic atmosphere crafted specifically for maximum privacy, safety, and psychological ease.',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-6 rounded-xl bg-slate-50/70 border border-slate-200/60 hover:border-rose-200 transition-colors"
              >
                <div className="w-11 h-11 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-rose-700 shadow-xs mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
