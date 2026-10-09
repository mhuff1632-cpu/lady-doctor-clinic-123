import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ClinicPoster } from '../types/poster';
import { fetchPosters } from '../lib/supabase/posters';
import { ClinicPostersSection } from '../components/posters/ClinicPostersSection';
import { clinicInfo } from '../data/clinicInfo';
import { useRouter } from '../context/RouterContext';
import {
  Sparkles,
  Printer,
  Calendar,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Heart,
  Info,
} from 'lucide-react';

export const PostersPage: React.FC = () => {
  const { navigate } = useRouter();
  const [posters, setPosters] = useState<ClinicPoster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosters(true).then((data) => {
      setPosters(data);
      setLoading(false);
    });
  }, []);

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Top Banner Header */}
      <section className="bg-linear-to-b from-rose-50/70 via-white to-slate-50 pt-10 pb-8 border-b border-rose-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="Patient Information & Announcements"
            title="Official Clinic Healthcare Posters"
            description="Explore our five comprehensive educational and service posters highlighting obstetrics, gynecology, pediatric immunization, 4D ultrasound scans, and emergency maternity support."
          />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                5
              </span>
              <div>
                <span className="font-semibold text-slate-900 block">
                  Active Clinical Posters on Display
                </span>
                <span>Regularly reviewed and approved by attending Lady Specialists</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrintAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print All Posters</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/appointment')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Consultation</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Posters Grid Component */}
      <ClinicPostersSection showAllButton={false} />

      {/* Clinical Transparency Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Authenticity & Clinical Integrity Assurance</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every poster adheres strictly to the clinic's verified scope of practice. Lady Doctor Clinic does not publish unverified claims, fabricated success rates, or stock model doctors. Posters are also displayed physically at our reception pavilion near The Inspire Business Academy, Sadiqabad.
            </p>
          </div>

          <a
            href={clinicInfo.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors shrink-0"
          >
            <span>Ask Questions via WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>
    </div>
  );
};
