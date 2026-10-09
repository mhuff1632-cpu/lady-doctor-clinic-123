import React, { useState } from 'react';
import { clinicInfo } from '../data/clinicInfo';
import { SectionHeader } from '../components/ui/SectionHeader';
import { SocialLinks } from '../components/ui/SocialLinks';
import { submitContactInquiry, SubmitContactResult } from '../lib/supabase/contact';
import { isSupabaseConfigured } from '../lib/supabase/client';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Navigation,
  RefreshCw,
  Loader2,
  Database,
  Building,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<SubmitContactResult | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isRefCopied, setIsRefCopied] = useState<boolean>(false);

  const handleCopyInquiryRef = (refText: string) => {
    if (!refText) return;
    navigator.clipboard?.writeText(refText).then(() => {
      setIsRefCopied(true);
      setTimeout(() => setIsRefCopied(false), 2500);
    }).catch(() => {});
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please specify the subject of your inquiry.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please provide your message.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const result = await submitContactInquiry({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });

      if (result.success) {
        setSubmissionResult(result);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      } else {
        setSubmissionError(
          result.error ||
            'Unable to submit your inquiry to the clinic database. Please contact us via phone or WhatsApp.'
        );
      }
    } catch (err: any) {
      setSubmissionError(
        err?.message || 'A network error occurred while connecting to the clinic server.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmissionResult(null);
    setSubmissionError(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
    setErrors({});
  };

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Get In Touch"
          title="Contact Lady Doctor Clinic"
          description="Have questions about our doctors, booking availability, or services? Reach out directly or send us an inquiry."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          {/* Left Column: Contact Cards & Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900">
                  Clinic Details
                </h3>
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Database className="w-3 h-3 text-teal-600" />
                  <span>Phase 2 Live</span>
                </span>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Physical Location</h4>
                    <p className="text-sm text-slate-600 mt-0.5">{clinicInfo.address.full}</p>
                    <span className="text-[11px] text-slate-400 font-mono">
                      GPS: {clinicInfo.coordinates.lat.toFixed(4)}, {clinicInfo.coordinates.lng.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Telephone Line</h4>
                    <a
                      href={`tel:${clinicInfo.phoneFormatted}`}
                      className="text-sm text-rose-700 hover:text-rose-800 font-medium block mt-0.5"
                    >
                      {clinicInfo.phone}
                    </a>
                    <span className="text-[11px] text-slate-400">Reception desk during opening hours</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">WhatsApp Instant Desk</h4>
                    <a
                      href={clinicInfo.whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1 mt-0.5"
                    >
                      <span>{clinicInfo.whatsapp}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <span className="text-[11px] text-slate-400">Quick inquiries & location pin</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Official Email</h4>
                    <a
                      href={`mailto:${clinicInfo.email}`}
                      className="text-sm text-slate-700 hover:text-slate-900 block mt-0.5"
                    >
                      {clinicInfo.email}
                    </a>
                    <span className="text-[11px] text-slate-400">Administrative & general queries</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="w-full">
                    <h4 className="text-xs font-semibold text-slate-900 mb-1.5">Working Hours</h4>
                    <div className="space-y-1 text-xs text-slate-600">
                      {clinicInfo.hours.map((h) => (
                        <div key={h.days} className="flex justify-between">
                          <span>{h.days}:</span>
                          <span className="font-mono text-slate-800 font-medium">{h.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Social Media Channels */}
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-900 mb-1">Stay Connected on Social Media</h4>
                  <p className="text-[11px] text-slate-500 mb-2.5">
                    Follow our verified channels for specialist health tips, OPD schedules, and clinical announcements.
                  </p>
                  <SocialLinks variant="contact" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/90 shadow-2xs">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Send a Message to Patient Care Desk
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Direct, confidential messaging. Our patient care coordinators review and respond promptly during clinic operating hours.
              </p>

              {/* Success Screen */}
              {submissionResult && submissionResult.success ? (
                <div className="p-6 sm:p-8 rounded-xl bg-teal-50/80 border border-teal-200 text-teal-900 space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3 font-bold text-base text-teal-900">
                    <CheckCircle2 className="w-6 h-6 text-teal-700 shrink-0" />
                    <span>Inquiry Received by Patient Care</span>
                  </div>

                  <p className="text-xs text-teal-900 leading-relaxed">
                    Thank you. Your message has been received by Lady Doctor Clinic. Our patient care coordinator will review your inquiry and follow up with you via phone or email.
                  </p>

                  {/* Inquiry Reference Code Block */}
                  {submissionResult.inquiryId && (
                    <div className="bg-white p-3.5 rounded-xl border border-teal-200/80 flex items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                          Inquiry Reference Code
                        </span>
                        <span className="text-xs font-mono font-bold text-teal-900">
                          {submissionResult.inquiryId}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyInquiryRef(submissionResult.inquiryId!)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100/70 rounded-lg border border-teal-200 transition-colors cursor-pointer"
                      >
                        {isRefCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-teal-700" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-teal-700" />
                            <span>Copy Ref</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Expected Response Timeline */}
                  <div className="space-y-1.5 text-xs text-teal-850">
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                      <span><strong>Response Timeline:</strong> Typically within 2–4 hours during clinic operating hours (Mon–Fri 8:30 AM – 6:30 PM).</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
                      <span><strong>Urgent Inquiries:</strong> If you need immediate assistance or obstetrics triage, please call our emergency desk at <a href={`tel:${clinicInfo.phoneFormatted}`} className="underline font-semibold">{clinicInfo.phone}</a>.</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-teal-900 bg-white hover:bg-teal-100/60 rounded-lg border border-teal-200 cursor-pointer shadow-2xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Send Another Message</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {/* Error banner if submission failed */}
                  {submissionError && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-rose-950">Message Could Not Be Sent</h4>
                        <p className="mt-0.5 text-rose-800">{submissionError}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      disabled={isSubmitting}
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Layla Ahmed"
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 ${
                        errors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.fullName}</span>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contactEmail" className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="contactEmail"
                        type="email"
                        disabled={isSubmitting}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@domain.com"
                        className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 ${
                          errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contactPhone" className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number <span className="text-rose-600">*</span>
                      </label>
                      <input
                        id="contactPhone"
                        type="tel"
                        disabled={isSubmitting}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 ${
                          errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject / Inquiry Type <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="subject"
                      type="text"
                      disabled={isSubmitting}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Consultation availability, ultrasound query, etc."
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 ${
                        errors.subject ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.subject}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contactMessage" className="block text-xs font-semibold text-slate-700 mb-1">
                      Message <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      id="contactMessage"
                      rows={4}
                      disabled={isSubmitting}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Type your message..."
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 ${
                        errors.message ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 disabled:bg-rose-400 rounded-xl shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Message to Clinic</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 17: GOOGLE MAPS EMBED CONTAINER */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-rose-700" />
                <h3 className="text-lg font-bold text-slate-900">
                  Clinic Location & Map Directions
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {clinicInfo.name} · {clinicInfo.address.full}
              </p>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                clinicInfo.address.full
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Exact Client Supplied Google Maps Embed */}
          <div className="relative w-full h-[360px] sm:h-[420px] md:h-[450px] lg:h-[480px] bg-slate-100 overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3512.851771864592!2d70.1225884!3d28.302813999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39374100207d4e0b%3A0x6c2e2ef25234bcf2!2sTHE%20INSPIRE%20BUSINESS%20ACADEMY%20SADIQABAD!5e0!3m2!1sen!2s!4v1791390578992!5m2!1sen!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Lady Doctor Clinic Google Maps Location"
              className="w-full h-full block"
            />
          </div>

          {/* Direction assistance footer */}
          <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-200/80 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Ground floor entrance with wheelchair access & dedicated patient parking spaces.</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Coordinates: {clinicInfo.coordinates.lat}, {clinicInfo.coordinates.lng}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
