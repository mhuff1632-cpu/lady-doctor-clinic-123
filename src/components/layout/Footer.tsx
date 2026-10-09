import React, { useState } from 'react';
import { useRouter, Link } from '../../context/RouterContext';
import { clinicInfo } from '../../data/clinicInfo';
import { Phone, Mail, MapPin, Clock, ArrowRight, ShieldCheck, HeartHandshake, X } from 'lucide-react';
import { SocialLinks } from '../ui/SocialLinks';
import { ClinicLogo } from '../ui/ClinicLogo';

export const Footer: React.FC = () => {
  const { navigate } = useRouter();
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Our Clinic', path: '/about' },
    { label: 'Our Lady Doctors', path: '/doctors' },
    { label: 'Clinical Services', path: '/services' },
    { label: 'Book Appointment', path: '/appointment' },
    { label: 'Track Appointment Status', path: '/lookup' },
    { label: 'Clinic Posters & Updates', path: '/posters' },
    { label: 'Hospital Virtual Tour', path: '/tour' },
    { label: 'Contact & Location', path: '/contact' },
    { label: 'Staff / Admin Portal', path: '/admin/login' },
  ];

  const servicesLinks = [
    { label: 'Obstetrics & Antenatal', path: '/services' },
    { label: 'Gynecology & Screenings', path: '/services' },
    { label: 'Hormone & PCOS Clinic', path: '/services' },
    { label: 'Pediatrics & Newborns', path: '/services' },
    { label: 'Diagnostic Ultrasound', path: '/services' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & clinic bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block hover:opacity-95 transition-opacity">
              <ClinicLogo variant="light" size="md" />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              A private, reassuring clinical haven dedicated to women and children. Delivering
              patient-centered healthcare with empathy, dignity, and expert clinical precision.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/appointment')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer"
              >
                <span>Book Appointment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <a
                href={clinicInfo.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              >
                <span>WhatsApp Desk</span>
              </a>
            </div>

            {/* Social Media Follow Us */}
            <div className="pt-3 border-t border-slate-800/80">
              <h5 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                Follow Us
              </h5>
              <p className="text-xs text-slate-400 mb-2.5">
                Stay connected with Lady Doctor Clinic
              </p>
              <SocialLinks variant="footer" />
            </div>
          </div>

          {/* Navigation Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-100 mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-slate-400 hover:text-rose-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Clinical Departments */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-100 mb-4">
              Specialties
            </h4>
            <ul className="space-y-2.5 text-sm">
              {servicesLinks.map((s) => (
                <li key={s.label}>
                  <Link
                    to={s.path}
                    className="text-slate-400 hover:text-rose-300 transition-colors"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-100 mb-4">
              Clinic Contact
            </h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{clinicInfo.address.full}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <a href={`tel:${clinicInfo.phoneFormatted}`} className="hover:text-white transition-colors">
                  {clinicInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-rose-400 shrink-0" />
                <a href={`mailto:${clinicInfo.email}`} className="hover:text-white transition-colors">
                  {clinicInfo.email}
                </a>
              </div>
              <div className="flex items-start gap-2.5 pt-1 text-xs text-slate-400">
                <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>Mon–Fri: 8:30 AM – 6:30 PM<br />Sat: 9:00 AM – 3:30 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-rose-400" />
            <span>&copy; {new Date().getFullYear()} Lady Doctor Clinic. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <button
              type="button"
              onClick={() => setActiveModal('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms of Care
            </button>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <Link
              to="/admin/login"
              className="hover:text-rose-400 text-slate-400 transition-colors"
            >
              Staff Portal
            </Link>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              HIPAA & Medical Privacy Compliant
            </span>
          </div>
        </div>
      </div>

      {/* Legal modal popup */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {activeModal === 'privacy' ? 'Patient Privacy & Confidentiality Notice' : 'Clinical Care & Consultation Terms'}
            </h3>
            <div className="text-sm text-slate-600 space-y-3 max-h-[60vh] overflow-y-auto pr-2 mt-4">
              {activeModal === 'privacy' ? (
                <>
                  <p>
                    Lady Doctor Clinic is committed to maintaining the utmost confidentiality regarding all patient medical histories, clinical records, consultation notes, and personal communications.
                  </p>
                  <p>
                    Patient data collected through appointment requests and consultations is protected strictly under recognized medical privacy principles. Information is accessed solely by authorized clinical care personnel.
                  </p>
                  <p>
                    We do not share, lease, or monetize your health data or contact information with third parties.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Consultations provided at Lady Doctor Clinic are scheduled appointments intended to provide personalized medical evaluation by licensed female physicians.
                  </p>
                  <p>
                    For life-threatening or emergent medical events, patients should directly contact emergency services or proceed to the nearest emergency room.
                  </p>
                  <p>
                    Cancellations or appointment rescheduling should kindly be communicated at least 24 hours prior to the booked consultation slot to accommodate waiting patients.
                  </p>
                </>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
