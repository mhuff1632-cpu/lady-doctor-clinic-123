import React from 'react';
import { SectionHeader } from '../ui/SectionHeader';
import { ShieldCheck, HeartHandshake, Clock, FileCheck2, Sparkles, UserCheck } from 'lucide-react';

export const WhyChooseUsSection: React.FC = () => {
  const pillars = [
    {
      icon: HeartHandshake,
      title: 'Comfort-First Environment',
      description:
        'A clinic space intentionally conceived for privacy, emotional safety, and physical comfort for women and young children.',
    },
    {
      icon: Clock,
      title: 'Unhurried Time With Doctors',
      description:
        'We allot dedicated 30 to 45-minute consultation slots so every concern is heard, investigated, and clearly explained.',
    },
    {
      icon: UserCheck,
      title: 'Certified Female Clinicians',
      description:
        'Experienced lady doctors with verified credentials across gynecology, maternal health, pediatrics, and preventive wellness.',
    },
    {
      icon: ShieldCheck,
      title: 'Strict Patient Confidentiality',
      description:
        'High standards of medical discretion and data protection for all routine, sensitive, and adolescent health consultations.',
    },
    {
      icon: FileCheck2,
      title: 'Evidence-Based Practice',
      description:
        'Treatment approaches guided by peer-reviewed clinical guidelines, clear diagnostic indications, and patient-centered choice.',
    },
    {
      icon: Sparkles,
      title: 'On-Site Diagnostic Sonography',
      description:
        'Integrated modern ultrasound scanning to reduce the hassle of multiple referrals and expedite clinical clarity.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FAFAFB] border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Why Lady Doctor Clinic"
          title="Healthcare Designed Around Trust, Dignity, and Empathy"
          description="We understand that medical visits—especially those concerning reproductive, maternal, and family wellness—require deep trust and compassionate communication."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-6 bg-white rounded-2xl border border-slate-200/80 hover:border-rose-200 shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
