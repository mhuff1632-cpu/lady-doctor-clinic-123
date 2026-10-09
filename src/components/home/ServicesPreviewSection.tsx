import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { demoServices } from '../../data/services';
import { SectionHeader } from '../ui/SectionHeader';
import {
  HeartHandshake,
  Stethoscope,
  Activity,
  Baby,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Service } from '../../types/service';
import { fetchActiveServices } from '../../lib/supabase/services';

const iconMap: Record<string, React.ElementType> = {
  HeartHandshake,
  Stethoscope,
  Activity,
  Baby,
  Sparkles,
  ShieldCheck,
};

interface ServicesPreviewProps {
  services?: Service[];
}

export const ServicesPreviewSection: React.FC<ServicesPreviewProps> = ({
  services: initialServices,
}) => {
  const { navigate } = useRouter();
  const [servicesList, setServicesList] = useState<Service[]>(
    initialServices || demoServices.slice(0, 4)
  );

  useEffect(() => {
    if (!initialServices) {
      let isMounted = true;
      fetchActiveServices().then((res) => {
        if (isMounted && res.data && res.data.length > 0) {
          setServicesList(res.data.slice(0, 4));
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [initialServices]);

  return (
    <section className="py-16 sm:py-24 bg-[#FAFAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Clinical Expertise"
          title="Comprehensive Medical Services for Every Life Stage"
          description="Tailored clinical care designed by women, for women and growing families. From routine consultations to specialized diagnostics."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesList.map((service) => {
            const IconComponent = iconMap[service.icon] || Stethoscope;

            return (
              <div
                key={service.id}
                className="flex flex-col justify-between p-6 bg-white rounded-2xl border border-slate-200/80 hover:border-rose-300 hover:shadow-sm transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    {/* Unboxed duration metadata */}
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {service.duration}
                    </span>
                  </div>

                  <span className="text-xs text-rose-700 font-medium tracking-wide">
                    {service.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2 group-hover:text-rose-700 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {service.shortDescription || service.description.slice(0, 100) + '...'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => navigate(`/services`)}
                    className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/appointment?service=${service.id}`)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    Book Slot
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View all services footer link */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs hover:border-slate-400 transition-colors cursor-pointer"
          >
            <span>Explore All Clinical Services & Diagnostics</span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </section>
  );
};
