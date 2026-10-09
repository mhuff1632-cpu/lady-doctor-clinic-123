import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from '../context/RouterContext';
import { demoDoctors } from '../data/doctors';
import { demoServices } from '../data/services';
import { SectionHeader } from '../components/ui/SectionHeader';
import { AppointmentFormData, AppointmentFormErrors, AppointmentSlot } from '../types/appointment';
import { Doctor } from '../types/doctor';
import { Service } from '../types/service';
import { fetchActiveDoctors } from '../lib/supabase/doctors';
import { fetchActiveServices } from '../lib/supabase/services';
import {
  submitAppointmentRequest,
  SubmitAppointmentResult,
  fetchDoctorBookedSlots,
} from '../lib/supabase/appointments';
import { isSupabaseConfigured } from '../lib/supabase/client';
import { clinicInfo } from '../data/clinicInfo';
import { APPOINTMENT_STATUS_COMMUNICATION } from '../types/communication';
import {
  parseDoctorAvailability,
  parseDurationMinutes,
  isDoctorAvailableOnDate,
  generateAvailableSlots,
  getClinicTodayDateString,
  CLINIC_TIMEZONE,
} from '../utils/scheduling';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Stethoscope,
  HeartHandshake,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Database,
  ShieldCheck,
  Check,
  Info,
  CalendarCheck2,
  Copy,
  MessageCircle,
  ArrowRight,
  Search,
} from 'lucide-react';

export const AppointmentPage: React.FC = () => {
  const { queryParams, navigate } = useRouter();

  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>(demoDoctors);
  const [availableServices, setAvailableServices] = useState<Service[]>(demoServices);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState<boolean>(true);
  const [isLoadingServices, setIsLoadingServices] = useState<boolean>(true);

  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: '',
    phone: '',
    email: '',
    doctorId: queryParams.get('doctor') || '',
    serviceId: queryParams.get('service') || '',
    preferredDate: '',
    preferredTime: '',
    message: '',
  });

  const [errors, setErrors] = useState<AppointmentFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<SubmitAppointmentResult | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isCopiedRef, setIsCopiedRef] = useState<boolean>(false);

  // Dynamic slot generation state
  const [bookedSlots, setBookedSlots] = useState<Array<{ appointment_time: string; status: string }>>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);

  // Sync with doctors & services from Supabase
  useEffect(() => {
    let isMounted = true;
    const loadOptions = async () => {
      try {
        const [docsRes, srvsRes] = await Promise.all([
          fetchActiveDoctors(),
          fetchActiveServices(),
        ]);
        if (isMounted) {
          if (docsRes.data && docsRes.data.length > 0) {
            setAvailableDoctors(docsRes.data);
          }
          if (srvsRes.data && srvsRes.data.length > 0) {
            setAvailableServices(srvsRes.data);
          }
        }
      } catch (e) {
        console.warn('Could not refresh appointment options from Supabase:', e);
      } finally {
        if (isMounted) {
          setIsLoadingDoctors(false);
          setIsLoadingServices(false);
        }
      }
    };
    loadOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync with URL query parameters when navigating
  useEffect(() => {
    const docQuery = queryParams.get('doctor');
    const servQuery = queryParams.get('service');
    if (docQuery) setFormData((prev) => ({ ...prev, doctorId: docQuery }));
    if (servQuery) setFormData((prev) => ({ ...prev, serviceId: servQuery }));
  }, [queryParams]);

  // Selected entities
  const selectedDoctor = useMemo(() => {
    return availableDoctors.find((d) => d.id === formData.doctorId) || null;
  }, [availableDoctors, formData.doctorId]);

  const selectedService = useMemo(() => {
    return availableServices.find((s) => s.id === formData.serviceId) || null;
  }, [availableServices, formData.serviceId]);

  // Doctor parsed availability
  const doctorAvailability = useMemo(() => {
    if (!selectedDoctor) {
      return parseDoctorAvailability(null, null);
    }
    return parseDoctorAvailability(
      selectedDoctor.availability,
      selectedDoctor.daysAvailable || selectedDoctor.days_available
    );
  }, [selectedDoctor]);

  // Selected service duration in minutes
  const serviceDurationMins = useMemo(() => {
    return parseDurationMinutes(selectedService?.duration);
  }, [selectedService]);

  // Fetch occupied slots whenever doctor or date changes
  useEffect(() => {
    let isMounted = true;
    if (!formData.doctorId || !formData.preferredDate) {
      setBookedSlots([]);
      return;
    }

    const loadOccupiedSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const slots = await fetchDoctorBookedSlots(formData.doctorId, formData.preferredDate);
        if (isMounted) {
          setBookedSlots(slots);
        }
      } catch (e) {
        console.warn('Error fetching occupied slots:', e);
      } finally {
        if (isMounted) {
          setIsLoadingSlots(false);
        }
      }
    };

    loadOccupiedSlots();
    return () => {
      isMounted = false;
    };
  }, [formData.doctorId, formData.preferredDate]);

  // Generate slot candidates based on availability, date, service duration, and booked slots
  const { generatedSlots, isDoctorOnDutyOnSelectedDate } = useMemo(() => {
    if (!formData.preferredDate) {
      return { generatedSlots: [], isDoctorOnDutyOnSelectedDate: true };
    }

    // Check if doctor works on selected day
    const onDuty = selectedDoctor
      ? isDoctorAvailableOnDate(formData.preferredDate, doctorAvailability)
      : true;

    if (!onDuty) {
      return { generatedSlots: [], isDoctorOnDutyOnSelectedDate: false };
    }

    const { allSlots } = generateAvailableSlots({
      selectedDate: formData.preferredDate,
      availability: doctorAvailability,
      serviceDurationMins,
      existingBookings: bookedSlots.map((b) => ({
        time: b.appointment_time,
        status: b.status,
      })),
    });

    return { generatedSlots: allSlots, isDoctorOnDutyOnSelectedDate: true };
  }, [formData.preferredDate, selectedDoctor, doctorAvailability, serviceDurationMins, bookedSlots]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: AppointmentFormErrors = {};

    // Patient Name
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient full name is required.';
    } else if (formData.patientName.trim().length < 3) {
      newErrors.patientName = 'Name must be at least 3 characters.';
    } else if (formData.patientName.trim().length > 60) {
      newErrors.patientName = 'Name cannot exceed 60 characters.';
    }

    // Phone Number
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required for appointment confirmation.';
    } else if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number (e.g. +92 300 1234567 or +1 555-123-4567).';
    }

    // Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. patient@example.com).';
    }

    // Doctor selection
    if (!formData.doctorId) {
      newErrors.doctorId = 'Please select a lady doctor or choose "Any Available Specialist".';
    }

    // Service selection
    if (!formData.serviceId) {
      newErrors.serviceId = 'Please select the clinical service or consultation reason.';
    }

    // Preferred Date
    const clinicToday = getClinicTodayDateString();
    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Please select a consultation date.';
    } else if (formData.preferredDate < clinicToday) {
      newErrors.preferredDate = 'Consultation date cannot be in the past.';
    } else if (selectedDoctor && !isDoctorOnDutyOnSelectedDate) {
      newErrors.preferredDate = `${selectedDoctor.name} does not have clinic hours on this day. Please select one of her visiting days: ${doctorAvailability.rawDays.join(', ')}.`;
    }

    // Preferred Time
    if (!formData.preferredTime) {
      newErrors.preferredTime = 'Please select an available consultation time slot.';
    } else {
      // Check if chosen time slot is marked unavailable in generatedSlots
      const chosen = generatedSlots.find((s) => s.time === formData.preferredTime);
      if (chosen && !chosen.available) {
        newErrors.preferredTime = 'This appointment slot is no longer available. Please select another time.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Immediate lock preventing double-submit

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const result = await submitAppointmentRequest(formData);

      if (result.success) {
        setSubmissionResult(result);
      } else {
        if (result.isConflict) {
          setSubmissionError('This appointment slot is no longer available. Please select another time.');
          // Refresh booked slots to reflect the newly taken slot
          if (formData.doctorId && formData.preferredDate) {
            const updated = await fetchDoctorBookedSlots(formData.doctorId, formData.preferredDate);
            setBookedSlots(updated);
          }
        } else {
          setSubmissionError(
            result.error ||
              'Unable to complete appointment request. Please call our clinic desk directly.'
          );
        }
      }
    } catch (err: any) {
      setSubmissionError(
        err?.message || 'A network error occurred while sending your request to the database.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmissionResult(null);
    setSubmissionError(null);
    setFormData({
      patientName: '',
      phone: '',
      email: '',
      doctorId: '',
      serviceId: '',
      preferredDate: '',
      preferredTime: '',
      message: '',
    });
    setErrors({});
  };

  const minDate = getClinicTodayDateString();

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Online Consultation Request"
          title="Book Your Appointment"
          description="Complete the form below to request a private consultation with our lady specialists. Our patient desk coordinates all bookings personally."
        />

        {/* Existing Appointment Quick Lookup Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-rose-50/70 border border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-rose-950">
            <Search className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Already booked a visit with us? You can track or inspect your appointment confirmation status anytime.
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/appointment/lookup')}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-rose-700 bg-white hover:bg-rose-100/60 border border-rose-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <span>Check Appointment Status</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Database Connectivity & Clinic Timezone Notice */}
        <div className="mb-8 p-4 rounded-xl bg-slate-100/80 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database
              className={`w-4 h-4 shrink-0 ${isSupabaseConfigured ? 'text-teal-600' : 'text-amber-600'}`}
            />
            <span>
              Database Channel:{' '}
              <strong className="text-slate-800">
                {isSupabaseConfigured
                  ? 'Supabase Production Backend Connected (table: appointments)'
                  : 'Supabase Staged Mode Active (Atomic Conflict Guarding Enabled)'}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>Clinic Timezone: {CLINIC_TIMEZONE} (PKT)</span>
          </div>
        </div>

        {/* Genuine Success Screen */}
        {submissionResult && submissionResult.success ? (
          <div className="bg-white p-8 sm:p-10 rounded-2xl border border-teal-200 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 text-teal-800">
              <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Appointment Request Successfully Received!
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Initial booking status:{' '}
                  <span className="font-semibold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {submissionResult.status || 'pending'}
                  </span>
                </p>
              </div>
            </div>

            {/* Reference Badge with Copy Action */}
            <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block">
                  Official Appointment Reference Number
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-lg font-extrabold text-teal-900">
                    {submissionResult.reference || `LDC-${new Date().getFullYear()}-000000`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (submissionResult.reference) {
                        navigator.clipboard.writeText(submissionResult.reference);
                        setIsCopiedRef(true);
                        setTimeout(() => setIsCopiedRef(false), 2500);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-teal-800 bg-white hover:bg-teal-100/70 border border-teal-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {isCopiedRef ? (
                      <>
                        <Check className="w-3 h-3 text-teal-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-teal-600" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="text-[11px] text-teal-700 flex items-center gap-1.5">
                <CalendarCheck2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Save this reference number to inspect status or check-in.</span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
              <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Confirmed Consultation Request Details:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Patient:</span>
                  <span className="font-medium text-slate-900">{formData.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Contact:</span>
                  <span className="font-mono">{formData.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Attending Specialist:</span>
                  <span className="text-rose-700 font-semibold">
                    {selectedDoctor?.name || 'Any Available Lady Specialist'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Clinical Service:</span>
                  <span>
                    {selectedService?.name || 'General Health Consultation'}
                    {selectedService?.duration && ` (${selectedService.duration})`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Scheduled Window:</span>
                  <span className="font-mono font-medium text-slate-900">
                    {formData.preferredDate} at {formData.preferredTime}
                  </span>
                </div>
                {submissionResult.appointmentId && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">System UUID:</span>
                    <span className="text-[10px] text-slate-500 font-mono truncate block">
                      {submissionResult.appointmentId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Clear Phase 6 Status Communication Box */}
            <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="block mb-0.5">Current Status: Pending Clinic Confirmation</strong>
                Your appointment request is safely stored in our system and will be reviewed by the clinic.
                Our patient care desk will reach you at <span className="font-mono font-medium">{formData.phone}</span> or via WhatsApp to confirm your slot before your visit.
              </div>
            </div>

            {/* Next Steps List */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                Next Steps For Your Visit:
              </span>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                <li>Keep your phone reachable so reception can confirm any pre-visit details.</li>
                <li>You can track this booking anytime at our lookup portal using reference <strong>{submissionResult.reference}</strong>.</li>
                <li>No prepayment is required online; consultation charges are settled at clinic reception.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <a
                  href={clinicInfo.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-800 font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Inquire via WhatsApp &rarr;</span>
                </a>

                <button
                  type="button"
                  onClick={() => navigate(`/appointment/lookup?ref=${encodeURIComponent(submissionResult.reference || '')}`)}
                  className="text-xs text-rose-700 hover:text-rose-800 font-semibold underline cursor-pointer"
                >
                  View in Patient Lookup
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Book Another Consultation</span>
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200/90 shadow-2xs space-y-8"
          >
            {/* Error banner if submission failed */}
            {submissionError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3 animate-in fade-in duration-150">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-rose-950">Slot Conflict or Submission Notice</h4>
                  <p className="mt-0.5 text-rose-800">{submissionError}</p>
                  <p className="mt-2 text-[11px] text-rose-700">
                    If you require immediate booking assistance, call our clinic reception at{' '}
                    <strong>{clinicInfo.phone}</strong> or message on WhatsApp ({clinicInfo.whatsapp}).
                  </p>
                </div>
              </div>
            )}

            {/* STEP 1: Medical Selection (Doctor & Service) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-rose-700" />
                  <span>1. Select Specialist & Clinical Service</span>
                </h3>
                <span className="text-[11px] text-slate-400">Step 1 of 4</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Doctor Selection */}
                <div>
                  <label htmlFor="doctorId" className="block text-xs font-semibold text-slate-700 mb-1">
                    Consulting Lady Doctor <span className="text-rose-600">*</span>
                  </label>
                  {isLoadingDoctors ? (
                    <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                  ) : (
                    <select
                      id="doctorId"
                      disabled={isSubmitting}
                      value={formData.doctorId}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          doctorId: e.target.value,
                          preferredTime: '', // Reset slot selection when doctor changes
                        });
                      }}
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 ${
                        errors.doctorId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    >
                      <option value="">-- Choose a Lady Doctor --</option>
                      <option value="any-available">Any Available Specialist (First Open Slot)</option>
                      {availableDoctors
                        .filter((d) => d.is_active !== false)
                        .map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name} – {doc.specialization} ({doc.consultation_fee})
                          </option>
                        ))}
                    </select>
                  )}
                  {errors.doctorId && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.doctorId}</span>
                    </p>
                  )}

                  {/* Doctor Info Card */}
                  {selectedDoctor && (
                    <div className="mt-2.5 p-3 rounded-xl bg-rose-50/40 border border-rose-100 text-xs text-slate-600 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-200 border border-rose-200">
                        <img
                          src={selectedDoctor.image_url || selectedDoctor.image}
                          alt={selectedDoctor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 text-xs truncate">
                          {selectedDoctor.name}
                        </div>
                        <div className="text-[11px] text-rose-700 font-medium">
                          {selectedDoctor.department} · {selectedDoctor.experience}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Visiting Hours: {selectedDoctor.availability}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Service Selection */}
                <div>
                  <label htmlFor="serviceId" className="block text-xs font-semibold text-slate-700 mb-1">
                    Clinical Service <span className="text-rose-600">*</span>
                  </label>
                  {isLoadingServices ? (
                    <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                  ) : (
                    <select
                      id="serviceId"
                      disabled={isSubmitting}
                      value={formData.serviceId}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          serviceId: e.target.value,
                          preferredTime: '', // Reset slot selection when service duration changes
                        });
                      }}
                      className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 ${
                        errors.serviceId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    >
                      <option value="">-- Choose Clinical Service --</option>
                      <option value="general-consult">General Health Assessment & Consultation (30 mins)</option>
                      {availableServices
                        .filter((s) => s.is_active !== false)
                        .map((srv) => (
                          <option key={srv.id} value={srv.id}>
                            {srv.name} ({srv.duration || '30 mins'})
                          </option>
                        ))}
                    </select>
                  )}
                  {errors.serviceId && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.serviceId}</span>
                    </p>
                  )}

                  {/* Service Info Card */}
                  {selectedService && (
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{selectedService.name}</span>
                        <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px] font-bold">
                          {selectedService.duration || '30 mins'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {selectedService.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 2: Date & Available Time Slot */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-700" />
                  <span>2. Consultation Date & Time Slot</span>
                </h3>
                <span className="text-[11px] text-slate-400">Step 2 of 4</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Date Picker */}
                <div className="sm:col-span-1">
                  <label htmlFor="preferredDate" className="block text-xs font-semibold text-slate-700 mb-1">
                    Consultation Date <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="preferredDate"
                    type="date"
                    disabled={isSubmitting}
                    min={minDate}
                    value={formData.preferredDate}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        preferredDate: e.target.value,
                        preferredTime: '', // Reset slot when date changes
                      });
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 ${
                      errors.preferredDate ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {errors.preferredDate && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.preferredDate}</span>
                    </p>
                  )}

                  {selectedDoctor && (
                    <div className="mt-2 text-[11px] text-slate-500">
                      <strong>Visiting Days:</strong> {doctorAvailability.rawDays.join(', ')}
                    </div>
                  )}
                </div>

                {/* Slot Selector */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Available Appointment Slots <span className="text-rose-600">*</span>
                    </label>
                    {isLoadingSlots && (
                      <span className="text-[10px] text-teal-700 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Checking slot availability...
                      </span>
                    )}
                  </div>

                  {!formData.preferredDate ? (
                    <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-500">
                      Please pick a consultation date to view doctor availability and live appointment slots.
                    </div>
                  ) : !isDoctorOnDutyOnSelectedDate ? (
                    <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/60 text-xs text-amber-900 space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Doctor Off Duty on Selected Date</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        {selectedDoctor?.name} does not hold consultations on this day of the week.
                        Available visiting days are: <strong>{doctorAvailability.rawDays.join(', ')}</strong>.
                      </p>
                    </div>
                  ) : generatedSlots.length === 0 ? (
                    <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
                      No appointment slots are available for this date. Please choose another date.
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {generatedSlots.map((slot) => {
                          const isSelected = formData.preferredTime === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available || isSubmitting}
                              onClick={() => {
                                setFormData({ ...formData, preferredTime: slot.time });
                                if (errors.preferredTime) {
                                  setErrors((prev) => ({ ...prev, preferredTime: undefined }));
                                }
                              }}
                              className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                isSelected
                                  ? 'bg-rose-700 text-white border-rose-700 shadow-xs ring-2 ring-rose-500/20'
                                  : slot.available
                                  ? 'bg-white text-slate-800 border-slate-200 hover:border-rose-400 hover:bg-rose-50/40'
                                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 shrink-0" />}
                              <span>{slot.time}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300" />
                          <span>Open</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-700" />
                          <span>Selected</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                          <span>Booked / Passed</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {errors.preferredTime && (
                    <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.preferredTime}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 3: Patient Information */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <User className="w-4 h-4 text-rose-700" />
                  <span>3. Patient Information</span>
                </h3>
                <span className="text-[11px] text-slate-400">Step 3 of 4</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="patientName" className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Full Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="patientName"
                    type="text"
                    disabled={isSubmitting}
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="e.g. Maryam Fatima"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 ${
                      errors.patientName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {errors.patientName && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.patientName}</span>
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone / WhatsApp <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="phone"
                      type="tel"
                      disabled={isSubmitting}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+92 300 1234567"
                      className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 ${
                        errors.phone ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="email"
                      type="email"
                      disabled={isSubmitting}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="patient@example.com"
                      className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 ${
                        errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 4: Confidential Notes */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Info className="w-4 h-4 text-rose-700" />
                  <span>4. Clinical Notes & Visit Reason (Optional)</span>
                </h3>
                <span className="text-[11px] text-slate-400">Step 4 of 4</span>
              </div>

              <textarea
                id="message"
                rows={3}
                disabled={isSubmitting}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Share any symptom notes, previous scan dates, or specific questions for the specialist..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Submit Action Bar */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Strictly confidential · Conflict-protected database booking</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 disabled:bg-rose-400 rounded-xl shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reserving Slot Securely...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Confirm & Submit Appointment Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
