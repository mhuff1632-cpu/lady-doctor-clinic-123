import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { Calendar, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { clinicInfo } from '../../data/clinicInfo';

export const AppointmentCTASection: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-rose-900 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Decorative subtle ambient circle */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-rose-300">
            Prompt & Confidential Scheduling
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Book Your Appointment with Our Lady Doctors
          </h2>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Experience attentive healthcare in a discreet, welcoming clinic setting. Reserve your
            consultation online or call our patient desk directly.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/appointment')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-rose-950 bg-white hover:bg-rose-50 rounded-xl shadow-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <Calendar className="w-4.5 h-4.5 text-rose-700" />
              <span>Book Your Appointment</span>
              <ArrowRight className="w-4 h-4 text-rose-700" />
            </button>

            <a
              href={`tel:${clinicInfo.phoneFormatted}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium text-white hover:text-rose-200 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-all whitespace-nowrap"
            >
              <Phone className="w-4 h-4" />
              <span>Call Reception ({clinicInfo.phone})</span>
            </a>
          </div>

          <div className="pt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>No upfront payment required for online reservation request</span>
          </div>
        </div>
      </div>
    </section>
  );
};
