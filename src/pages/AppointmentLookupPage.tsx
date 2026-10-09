import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { clinicInfo } from '../data/clinicInfo';
import { useRouter } from '../context/RouterContext';
import { lookupPatientAppointment, PatientLookupResult } from '../lib/supabase/communication';
import { APPOINTMENT_STATUS_COMMUNICATION } from '../types/communication';
import { PatientReviewModal } from '../components/ui/PatientReviewModal';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  Mail,
  Calendar,
  User,
  ShieldCheck,
  RefreshCw,
  Loader2,
  MessageCircle,
  FileText,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Info,
  Star,
} from 'lucide-react';

export const AppointmentLookupPage: React.FC = () => {
  const { navigate, queryParams } = useRouter();

  const [referenceInput, setReferenceInput] = useState<string>(
    queryParams.get('ref') || ''
  );
  const [contactInput, setContactInput] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<PatientLookupResult | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const ref = referenceInput.trim();
    const contact = contactInput.trim();

    if (!ref) {
      setFormError('Please enter your appointment reference code (e.g. LDC-2026-000001).');
      return;
    }

    if (!contact) {
      setFormError('Please enter your phone number or email address for security verification.');
      return;
    }

    setIsSearching(true);
    try {
      const result = await lookupPatientAppointment({
        reference: ref,
        phoneOrEmail: contact,
      });
      setSearchResult(result);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to query appointment status. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setSearchResult(null);
    setFormError(null);
    setReferenceInput('');
    setContactInput('');
  };

  const apt = searchResult?.appointment;
  const statusInfo = apt ? APPOINTMENT_STATUS_COMMUNICATION[apt.status] : null;

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Patient Communication Portal"
          title="Check Your Appointment Status"
          description="Track your consultation schedule, review verification notes, or inspect next steps for your upcoming visit using your official reference number."
        />

        {/* Verification Info Box */}
        <div className="mb-8 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-slate-800">Confidential Verification: </span>
            To protect patient medical privacy, appointment lookup requires both your unique booking reference number
            and either the registered phone number or email provided during booking.
          </div>
        </div>

        {!searchResult || !searchResult.success ? (
          /* Search Form Card */
          <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-rose-600" />
                <span>Enter Booking Verification Details</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your reference code was provided on your booking confirmation screen (Format: LDC-YYYY-XXXXXX).
              </p>
            </div>

            {formError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-rose-950">Lookup Error</h4>
                  <p className="mt-0.5 text-rose-800">{formError}</p>
                </div>
              </div>
            )}

            {searchResult && !searchResult.success && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-950">Record Not Found</h4>
                  <p className="mt-0.5 text-amber-800 leading-relaxed">
                    {searchResult.error || 'No appointment found matching the provided reference and contact details.'}
                  </p>
                  <p className="mt-2 text-[11px] text-amber-800 font-medium">
                    If you booked recently and do not have your reference, please call reception directly at {clinicInfo.phone} or chat on WhatsApp.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleLookup} className="space-y-5">
              <div>
                <label htmlFor="refInput" className="block text-xs font-semibold text-slate-700 mb-1">
                  Appointment Reference Number <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="refInput"
                    type="text"
                    value={referenceInput}
                    onChange={(e) => setReferenceInput(e.target.value)}
                    placeholder="e.g. LDC-2026-000001"
                    disabled={isSearching}
                    className="w-full px-3.5 py-2.5 text-xs font-mono uppercase rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 placeholder:normal-case placeholder:font-sans"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Check your initial booking screen or WhatsApp confirmation for this code.
                </span>
              </div>

              <div>
                <label htmlFor="contactInput" className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Phone Number or Email <span className="text-rose-600">*</span>
                </label>
                <input
                  id="contactInput"
                  type="text"
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  placeholder="e.g. +92 300 1234567 or patient@example.com"
                  disabled={isSearching}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Used exclusively to verify patient identity against this appointment record.
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking Records...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Check Status Now</span>
                    </>
                  )}
                </button>

                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>Need to schedule a new visit?</span>
                  <button
                    type="button"
                    onClick={() => navigate('/appointment')}
                    className="text-rose-700 hover:text-rose-800 font-semibold underline cursor-pointer"
                  >
                    Book Appointment &rarr;
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* Detailed Appointment Status Card */
          apt && statusInfo && (
            <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Header Status Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusInfo.badgeBgClass} ${statusInfo.badgeColorClass} ${statusInfo.badgeBorderClass}`}
                    >
                      {apt.status === 'confirmed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {apt.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                      {apt.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {apt.status === 'cancelled' && <AlertCircle className="w-3.5 h-3.5" />}
                      <span>{statusInfo.badgeLabel}</span>
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="font-mono text-xs font-semibold text-slate-700">
                      Ref: {apt.reference}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {statusInfo.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Check Another</span>
                </button>
              </div>

              {/* Status Explanation Banner */}
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${
                  apt.status === 'confirmed'
                    ? 'bg-teal-50/80 border-teal-200 text-teal-900'
                    : apt.status === 'pending'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : apt.status === 'completed'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/80 border-rose-200 text-rose-900'
                }`}
              >
                {apt.status === 'confirmed' && <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />}
                {apt.status === 'pending' && <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />}
                {apt.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />}
                {apt.status === 'cancelled' && <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />}
                <div>
                  <p className="font-semibold mb-1">Status Overview:</p>
                  <p>{statusInfo.description}</p>
                </div>
              </div>

              {/* Appointment Details Grid */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-4">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200/60 pb-2">
                  Verified Consultation Summary
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Patient Name:</span>
                    <span className="font-medium text-slate-900 text-sm">{apt.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Attending Doctor:</span>
                    <span className="text-rose-700 font-semibold text-sm">{apt.doctorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Consultation Service:</span>
                    <span className="text-slate-900">{apt.serviceName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Scheduled Window:</span>
                    <span className="font-mono font-medium text-slate-900">
                      {apt.appointmentDate} at {apt.appointmentTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contact Phone:</span>
                    <span className="font-mono text-slate-800">{apt.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Registered Email:</span>
                    <span className="text-slate-800">{apt.email}</span>
                  </div>
                </div>
              </div>

              {/* Next Steps Guide */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Important Next Steps & Patient Instructions
                </h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {statusInfo.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clinic Direct Support & Quick Action Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs">
                  <a
                    href={`tel:${clinicInfo.phoneFormatted}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-rose-600" />
                    <span>Call Reception</span>
                  </a>

                  <a
                    href={clinicInfo.whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100/80 text-teal-800 font-semibold border border-teal-200 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-teal-600" />
                    <span>WhatsApp Desk</span>
                  </a>

                  {(apt.status === 'completed' || apt.status === 'confirmed') && (
                    <button
                      type="button"
                      onClick={() => setReviewModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold border border-amber-200 transition-colors cursor-pointer text-xs"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Review Doctor</span>
                    </button>
                  )}
                </div>

                {apt.status === 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => navigate('/appointment')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <span>Re-Book Consultation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )
        )}

        {/* FAQ / Direct Assistance Notice */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-600" />
              <span>Need to Change or Reschedule?</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              If your personal schedule changes or you need to adjust your consultation time slot, please contact our front desk at least 24 hours in advance so we can assist other patients in need.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Lost Your Reference Code?</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Do not worry. Our reception staff can locate your booking securely using your registered contact phone number upon your arrival at Lady Doctor Clinic.
            </p>
          </div>
        </div>

        {/* Patient Review Modal */}
        {apt && (
          <PatientReviewModal
            isOpen={reviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
            defaultDoctorName={apt.doctorName}
            defaultAppointmentRef={apt.reference}
          />
        )}
      </div>
    </div>
  );
};
