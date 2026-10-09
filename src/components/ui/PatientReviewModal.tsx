import React, { useState } from 'react';
import { submitPatientReview } from '../../lib/supabase/reviews';
import { Star, X, CheckCircle2, AlertCircle, Heart } from 'lucide-react';

interface PatientReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDoctorId?: string;
  defaultDoctorName?: string;
  defaultAppointmentRef?: string;
  onSuccess?: () => void;
}

export const PatientReviewModal: React.FC<PatientReviewModalProps> = ({
  isOpen,
  onClose,
  defaultDoctorId = 'a1111111-1111-4111-8111-111111111111',
  defaultDoctorName = 'Dr. Ayesha Malik',
  defaultAppointmentRef = '',
  onSuccess,
}) => {
  const [patientName, setPatientName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [appointmentRef, setAppointmentRef] = useState(defaultAppointmentRef);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setError('Please provide your name or initials.');
      return;
    }
    if (!reviewText.trim() || reviewText.trim().length < 10) {
      setError('Please write at least 10 characters of feedback.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await submitPatientReview({
        doctor_id: defaultDoctorId,
        doctor_name: defaultDoctorName,
        patient_name: patientName.trim(),
        rating,
        review_text: reviewText.trim(),
        appointment_ref: appointmentRef.trim() || undefined,
      });

      if (res.success) {
        setSubmitted(true);
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Failed to submit review.');
      }
    } catch {
      setError('A network error occurred while submitting your review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-slate-900 border border-slate-200 space-y-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Thank You for Your Feedback!</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Your review for <strong>{defaultDoctorName}</strong> has been received by our clinical desk. To protect patient privacy and clinical authenticity, all feedback is reviewed before appearing publicly.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200 mb-2">
                <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600/30" />
                <span>Patient Experience Feedback</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Review Your Consultation with {defaultDoctorName}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your respectful feedback helps other women choose compassionate clinical care.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Rating (1 to 5 Stars) <span className="text-rose-600">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">
                    {rating === 5 ? 'Excellent Care' : `${rating} Stars`}
                  </span>
                </div>
              </div>

              {/* Patient Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Name / Display Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Layla A. or Patient"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900"
                />
              </div>

              {/* Appointment Reference (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Appointment Reference Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. LDC-2026-000001"
                  value={appointmentRef}
                  onChange={(e) => setAppointmentRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Enables "Verified Patient Visit" badge upon admin approval.
                </span>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Review & Clinical Experience <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe doctor attentiveness, privacy, waiting times, and clinical guidance..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
