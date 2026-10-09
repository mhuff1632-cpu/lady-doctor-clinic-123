import React from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { demoTestimonials } from '../../data/testimonials';
import { Star, MessageSquareQuote, Info } from 'lucide-react';
import { Testimonial } from '../../types/testimonial';

interface TestimonialsPreviewProps {
  testimonials?: Testimonial[];
}

export const TestimonialsPreviewSection: React.FC<TestimonialsPreviewProps> = ({
  testimonials = demoTestimonials,
}) => {
  return (
    <section className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Patient Experience"
          title="What Care Feels Like at Lady Doctor Clinic"
          description="We prioritize human dignity, quiet listening, and professional thoroughness in every consultation."
        />

        {/* Transparent Demo Notice Badge / Banner as required by specifications */}
        <div className="mb-10 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3 max-w-2xl mx-auto">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Demonstrative Feedback Architecture: </span>
            The testimonials below illustrate representative patient experiences for Phase 1. Real
            verified patient reviews will be loaded dynamically from Supabase once patient
            feedback workflows are provisioned in Phase 2.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="p-6 sm:p-7 rounded-2xl bg-[#FAFAFB] border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <MessageSquareQuote className="w-5 h-5 text-rose-300" />
                </div>

                <blockquote className="text-sm text-slate-700 leading-relaxed italic">
                  “{item.quote}”
                </blockquote>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60">
                <p className="text-sm font-bold text-slate-900">{item.patientName}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span>{item.careReceived}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  {item.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
