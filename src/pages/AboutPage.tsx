import React from 'react';
import { useRouter } from '../context/RouterContext';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ClinicImage } from '../components/ui/ClinicImage';
import { Heart, ShieldCheck, Stethoscope, Users, CheckCircle2, Calendar, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigate } = useRouter();

  const values = [
    {
      title: 'Dignity & Discretion',
      description:
        'Every medical inquiry, examination, and test result is treated with the highest degree of discretion and personal privacy.',
      icon: ShieldCheck,
    },
    {
      title: 'Empathy in Practice',
      description:
        'We believe healing starts with feeling heard. Our clinicians listen without interruption, judgment, or rush.',
      icon: Heart,
    },
    {
      title: 'Evidence-Based Care',
      description:
        'Modern medical knowledge delivered through personalized treatment plans that respect each woman’s individual preferences.',
      icon: Stethoscope,
    },
    {
      title: 'Family-Centered Atmosphere',
      description:
        'Welcoming mothers, infants, adolescents, and mature women in an environment that puts nerves and clinical anxiety at ease.',
      icon: Users,
    },
  ];

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Top label */}
        <div className="mb-8">
          <SectionHeader
            kicker="About Lady Doctor Clinic"
            title="A Dedicated Medical Sanctuary for Women & Children"
            description="Established to bridge the gap between sterile hospital settings and personalized, compassionate female-led healthcare."
          />
        </div>

        {/* Narrative & Visual Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-6 space-y-5 text-slate-600 leading-relaxed text-sm sm:text-base">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Our Clinical Philosophy
            </h3>
            <p>
              Women navigate complex, interconnected physiological changes throughout life—from
              adolescent hormonal development and reproductive planning to maternity, pediatric
              rearing, and mature menopause.
            </p>
            <p>
              Traditional healthcare environments often leave women feeling rushed through brief,
              impersonal appointments. <strong>Lady Doctor Clinic</strong> was founded with a singular
              purpose: to provide a patient-centered clinic where consultations are deliberate, private,
              and led entirely by qualified female healthcare providers.
            </p>
            <p>
              We take the necessary time to listen to your history, explain diagnosis pathways in
              plain language, and partner with you in making informed decisions about your body and your
              family’s wellbeing.
            </p>

            <div className="pt-2">
              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-100 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-slate-700">
                  <span className="font-semibold text-rose-950 block mb-0.5">
                    Our Mission
                  </span>
                  To deliver compassionate, comprehensive, and evidence-grounded medical care that
                  empowers women to prioritize their physical and emotional health at every stage of
                  life.
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-white">
              <ClinicImage
                src="/images/clinic_interior_consultation_1791390183063.jpg"
                alt="Lady Doctor Clinic consultation room interior"
                aspectRatio="16/9"
                className="w-full h-auto object-cover"
                spec={{
                  page: 'About',
                  section: 'Clinic Philosophy',
                  purpose: 'Showcasing the serene, modern clinic consultation atmosphere',
                  recommendedDimensions: '1200x675',
                  aspectRatio: '16:9',
                  imageStyle: 'Warm natural light, calm consultation room with wooden accents and comfortable seating',
                  transparent: false,
                  mobileSuitability: 'Adapts gracefully to mobile and tablet screens',
                }}
              />
              <div className="p-4 bg-white border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Lady Doctor Clinic Consultation Suite</span>
                <span className="font-mono text-slate-400">Private & Disinfectant-Maintained</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guiding Principles */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-700 mb-1">
              Core Principles
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Why Patients Place Their Trust In Us
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-rose-200 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">
                    {v.title}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {v.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clinic Appointment CTA Banner */}
        <div className="bg-gradient-to-r from-rose-700 to-rose-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-md">
          <div className="max-w-xl space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to meet with our lady doctors?
            </h3>
            <p className="text-sm text-rose-100 leading-relaxed">
              We look forward to welcoming you. Reserve your confidential consultation today with
              flexible morning and afternoon slots.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate('/appointment')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold text-rose-950 bg-white hover:bg-rose-50 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-rose-700" />
              <span>Book Appointment</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/doctors')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-xs font-semibold text-white bg-rose-800/80 hover:bg-rose-800 border border-rose-600 rounded-xl transition-colors cursor-pointer"
            >
              <span>View Specialists</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
