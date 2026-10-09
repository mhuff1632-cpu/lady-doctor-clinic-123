import React, { useState, useEffect } from 'react';
import { useRouter } from '../context/RouterContext';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ClinicImage } from '../components/ui/ClinicImage';
import {
  HeartHandshake,
  Stethoscope,
  Activity,
  Baby,
  Sparkles,
  ShieldCheck,
  Check,
  Clock,
  Calendar,
  Layers,
  RefreshCw,
  AlertCircle,
  Database,
} from 'lucide-react';
import { Service } from '../types/service';
import { fetchActiveServices } from '../lib/supabase/services';

const iconMap: Record<string, React.ElementType> = {
  HeartHandshake,
  Stethoscope,
  Activity,
  Baby,
  Sparkles,
  ShieldCheck,
};

export const ServicesPage: React.FC = () => {
  const { navigate } = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const loadServices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchActiveServices();
      setServices(res.data);
      setIsLive(res.isLive);
      if (res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load services.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const categories = [
    'All',
    'Maternity',
    'Gynecology',
    'Endocrinology',
    'Child Health',
    'Women Wellness',
    'Diagnostics',
  ];

  const filteredServices = services.filter(
    (s) => activeCategory === 'All' || s.category === activeCategory
  );

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Clinical Offerings"
          title="Specialized Women’s & Family Health Services"
          description="Every clinical service is provided with unhurried attention, patient privacy, and clear therapeutic communication."
        />

        {/* Database Status Strip */}
        <div className="mb-6 flex items-center justify-between text-xs text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <Database className={`w-3.5 h-3.5 ${isLive ? 'text-teal-600' : 'text-slate-400'}`} />
            <span>
              Data Source:{' '}
              <strong className="text-slate-800">
                {isLive ? 'Supabase Live Database (public.services)' : 'Initial Services Catalog'}
              </strong>
            </span>
          </div>
          <button
            type="button"
            onClick={loadServices}
            disabled={isLoading}
            className="flex items-center gap-1 text-slate-600 hover:text-rose-700 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Category Filter Buttons */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse"
              >
                <div className="aspect-[16/9] bg-slate-200 rounded-xl"></div>
                <div className="h-5 bg-slate-200 rounded w-2/3"></div>
                <div className="h-16 bg-slate-100 rounded w-full"></div>
                <div className="h-8 bg-slate-200 rounded w-full mt-4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error Notice */}
        {!isLoading && error && (
          <div className="p-6 mb-8 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold">Services Sync Notice</h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Displaying baseline clinical offerings while live database refreshes.
                </p>
                <p className="text-[11px] font-mono text-amber-700 mt-1">Detail: {error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadServices}
              className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-amber-300 rounded-lg text-amber-900 hover:bg-amber-100/50 cursor-pointer shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredServices.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-sm font-semibold text-slate-700">No services found in this category.</p>
            <p className="text-xs text-slate-500 mt-1">Please select "All" to view all available care options.</p>
            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className="mt-4 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100 cursor-pointer"
            >
              Show All Services
            </button>
          </div>
        )}

        {/* Services Grid */}
        {!isLoading && filteredServices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service: Service) => {
              const IconComponent = iconMap[service.icon] || Stethoscope;
              const displayImage =
                service.image ||
                service.image_url ||
                '/images/clinic_interior_consultation_1791390183063.jpg';

              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:border-rose-300 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Service Visual Preview */}
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                      <ClinicImage
                        src={displayImage}
                        alt={service.name}
                        aspectRatio="16/9"
                        className="w-full h-full object-cover"
                        spec={{
                          page: 'Services',
                          section: 'Service Catalogue Card',
                          purpose: `Clinical illustration for ${service.name}`,
                          recommendedDimensions: '800x450',
                          aspectRatio: '16:9',
                          imageStyle: 'Clean medical consultation room, modern clinical diagnostics',
                          transparent: false,
                          mobileSuitability: 'Maintains 16:9 ratio across all viewports',
                        }}
                      />
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-rose-800 border border-slate-200/80 shadow-2xs">
                        {service.category}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {service.duration}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {service.description}
                      </p>

                      {/* Features Checklist */}
                      {service.features && service.features.length > 0 && (
                        <div className="space-y-2 pt-3 border-t border-slate-100">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            What’s Included:
                          </p>
                          {service.features.map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                              <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                              <span className="leading-tight">{feature}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 pt-0 mt-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/appointment?service=${service.id}`)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book For {service.name.split(' ')[0]}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Database Notice Footnote */}
        <div className="mt-12 p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-600" />
            <span>Supabase Database Schema: public.services</span>
          </div>
          <span className="font-mono text-[11px] text-slate-400">Phase 2 Live Connected</span>
        </div>
      </div>
    </div>
  );
};
