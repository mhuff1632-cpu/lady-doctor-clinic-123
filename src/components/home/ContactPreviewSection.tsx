import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { clinicInfo } from '../../data/clinicInfo';
import { MapPin, Phone, Mail, Clock, MessageSquare, ArrowRight } from 'lucide-react';

export const ContactPreviewSection: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-rose-50/60 via-slate-50/80 to-teal-50/40 rounded-3xl p-8 sm:p-12 border border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Heading and Contact Cards */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-700 mb-2">
                  Find & Reach Us
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  We Welcome You to Lady Doctor Clinic
                </h2>
                <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Located in the Central Healthcare District with convenient patient parking and
                  ground-floor accessibility. Our staff is ready to assist you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-slate-900 block mb-0.5">Clinic Location</span>
                    <span className="text-slate-600 leading-snug block">{clinicInfo.address.full}</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-slate-900 block mb-0.5">Telephone Inquiry</span>
                    <a
                      href={`tel:${clinicInfo.phoneFormatted}`}
                      className="text-rose-700 hover:text-rose-800 font-medium block"
                    >
                      {clinicInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-slate-900 block mb-0.5">Email Inquiries</span>
                    <a
                      href={`mailto:${clinicInfo.email}`}
                      className="text-slate-600 hover:text-slate-900 block"
                    >
                      {clinicInfo.email}
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-slate-900 block mb-0.5">WhatsApp Desk</span>
                    <a
                      href={clinicInfo.whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-700 hover:text-teal-800 font-medium block"
                    >
                      Instant Chat ({clinicInfo.whatsapp})
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Opening Hours & Navigation Action */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-rose-600" />
                  <h3 className="text-base font-bold text-slate-900">Clinic Hours & Access</h3>
                </div>

                <div className="space-y-3 divide-y divide-slate-100 text-xs text-slate-600">
                  {clinicInfo.hours.map((schedule) => (
                    <div key={schedule.days} className="pt-2.5 first:pt-0 flex items-center justify-between">
                      <span className="font-medium text-slate-800">{schedule.days}</span>
                      <span className="font-mono text-slate-600">{schedule.hours}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {clinicInfo.emergencyNote}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate('/contact')}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  <span>Detailed Directions & Contact Form</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
