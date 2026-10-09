import React from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { HospitalVideoPlayer } from '../components/video/HospitalVideoPlayer';
import { hospitalTourStops } from '../data/hospitalTourData';
import { clinicInfo } from '../data/clinicInfo';
import { useRouter, Link } from '../context/RouterContext';
import {
  Sparkles,
  Calendar,
  Phone,
  CheckCircle2,
  ShieldCheck,
  Building,
  Heart,
  Clock,
  ArrowRight,
  MapPin,
} from 'lucide-react';

export const HospitalTourPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="space-y-12 pb-16">
      {/* Top Banner Header */}
      <section className="bg-linear-to-b from-rose-50/70 via-white to-slate-50 pt-10 pb-8 border-b border-rose-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            kicker="Interactive Virtual Walkthrough"
            title="Explore Lady Doctor Clinic"
            description="Take an interactive virtual video tour through our six specialized departments in Sadiqabad: female doctor clinics, 4D ultrasound sonography, postpartum nursery, and 24/7 maternity triage."
          />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                HD
              </span>
              <div>
                <span className="font-semibold text-slate-900 block">
                  Virtual Clinic Tour with Urdu & English Voice Guidance
                </span>
                <span>Experience our hygienic, 100% female-staffed clinical haven before your visit</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/appointment')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Appointment</span>
              </button>
              <a
                href={`tel:${clinicInfo.phoneFormatted}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Reception Desk</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Video Player Container */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HospitalVideoPlayer />
      </section>

      {/* Six Departments Overview Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Key Department Highlights
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Detailed walkthrough of each clinical department inspected in the tour.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitalTourStops.map((stop, index) => (
            <div
              key={stop.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    0{index + 1}
                  </span>
                  <span>{stop.category}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {stop.name}
                </h3>
                <div className="text-xs font-semibold text-rose-700" dir="rtl">
                  {stop.urduName}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {stop.description}
                </p>
              </div>

              {stop.highlights && stop.highlights.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  {stop.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Clinic Hygiene & Female Privacy Policy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-950 text-white p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Female Clinical Sanctuary</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Strict Hygiene, Dignity & Confidentiality Protocols
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every procedure room, ultrasound couch, and maternity bed is sterilized after each consultation. All medical examinations are attended strictly by female doctors, licensed nurses, and female attendants to protect female privacy.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/appointment')}
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors shrink-0 shadow-lg cursor-pointer"
          >
            <span>Book In-Person Consultation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
