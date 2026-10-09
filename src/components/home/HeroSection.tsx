import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { Calendar, ArrowRight, ShieldCheck, Heart, Clock, Award } from 'lucide-react';
import { ClinicImage } from '../ui/ClinicImage';

export const HeroSection: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-rose-50/40 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Copy, Action Buttons */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            {/* Unboxed natural editorial kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-800 tracking-wide">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Accepting New Patients & Consultation Appointments</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-500 font-normal">Private Care Practice</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Compassionate Healthcare <br className="hidden sm:inline" />
              by <span className="text-rose-700 font-serif italic">Lady Specialists</span> Who Listen.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              From routine gynecological screenings and high-risk maternity care to adolescent health
              and pediatric wellness, our experienced lady doctors provide an unhurried, private, and
              respectful environment where your comfort comes first.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/appointment')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-rose-700 hover:bg-rose-800 active:bg-rose-900 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                <Calendar className="w-4.5 h-4.5" />
                <span>Book an Appointment</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/services')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Our Services</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/tour')}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                <span>📹 Virtual Tour</span>
              </button>
            </div>

            {/* Adjacency Trust Proof: Clean unboxed metadata with separators */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium text-slate-800">100% Lady Specialists</span>
              </div>
              <span aria-hidden="true" className="text-slate-300 hidden sm:inline">·</span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Strict Patient Privacy</span>
              </div>
              <span aria-hidden="true" className="text-slate-300 hidden sm:inline">·</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Unhurried 30–45m Visits</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Medical Hero Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Backing subtle warm glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-rose-200/40 via-teal-100/30 to-rose-100/20 rounded-2xl blur-xl -z-10" />

              <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-white">
                <ClinicImage
                  src="/src/assets/images/hero_clinic_care_1791390127095.jpg"
                  alt="Doctor consulting with patient in calm clinic room"
                  aspectRatio="16/9"
                  className="w-full h-auto object-cover"
                  priority={true}
                  spec={{
                    page: 'Home',
                    section: 'Hero',
                    purpose: 'Primary clinic visual showing patient-physician rapport',
                    recommendedDimensions: '1200x675',
                    aspectRatio: '16:9',
                    imageStyle: 'Warm natural light, modern clean clinical setting, professional attire',
                    transparent: false,
                    mobileSuitability: 'Excellent responsiveness on all screen sizes',
                  }}
                />

                {/* Sub-card highlighting care commitment */}
                <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                      <Heart className="w-5 h-5 fill-rose-500/20" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Personalized Health Care</h3>
                      <p className="text-xs text-slate-500">Every patient is heard with respect & dignity</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/about')}
                    className="text-xs font-semibold text-rose-700 hover:text-rose-800 whitespace-nowrap cursor-pointer"
                  >
                    Learn More &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
