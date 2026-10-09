import { AppointmentStatus } from '../types/database';

export interface PatientAppointmentStatusInfo {
  reference: string;
  status: AppointmentStatus;
  patientName: string;
  doctorName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  clinicPhone: string;
  clinicWhatsappUrl: string;
}

export interface StatusContent {
  title: string;
  badgeLabel: string;
  badgeColorClass: string;
  badgeBorderClass: string;
  badgeBgClass: string;
  description: string;
  alertType: 'warning' | 'success' | 'info' | 'danger';
  nextSteps: string[];
  actionRecommendation: string;
}

export const APPOINTMENT_STATUS_COMMUNICATION: Record<AppointmentStatus, StatusContent> = {
  pending: {
    title: 'Appointment Request Received & Awaiting Confirmation',
    badgeLabel: 'Pending Review',
    badgeColorClass: 'text-amber-800',
    badgeBorderClass: 'border-amber-300',
    badgeBgClass: 'bg-amber-50',
    description:
      'Your consultation request has been safely logged in our clinical system. Our patient care desk is currently reviewing schedule availability with the attending specialist and will verify your slot shortly.',
    alertType: 'warning',
    nextSteps: [
      'Our reception desk will contact you via phone or WhatsApp to finalize your visit window.',
      'No prepayment is required at this stage; fee settlement is completed at clinic reception.',
      'Keep your appointment reference code handy when speaking to clinic staff.',
    ],
    actionRecommendation:
      'Please keep your telephone available. If you have an urgent clinical query, contact our WhatsApp desk directly.',
  },
  confirmed: {
    title: 'Appointment Confirmed & Reserved',
    badgeLabel: 'Confirmed',
    badgeColorClass: 'text-teal-800',
    badgeBorderClass: 'border-teal-300',
    badgeBgClass: 'bg-teal-50',
    description:
      'Your consultation booking has been officially accepted and confirmed by Lady Doctor Clinic. Your designated specialist and clinical room have been reserved for your visit.',
    alertType: 'success',
    nextSteps: [
      'Please arrive 10 to 15 minutes before your scheduled appointment time for routine vitals check.',
      'Present your appointment reference code or registered phone number at the reception desk.',
      'Bring any relevant previous medical records, diagnostic lab tests, ultrasound scans, or current medications.',
    ],
    actionRecommendation:
      'We look forward to welcoming you. If you need directions to our clinic near Inspire Business Academy, check our interactive map or call reception.',
  },
  completed: {
    title: 'Consultation Completed',
    badgeLabel: 'Completed',
    badgeColorClass: 'text-emerald-800',
    badgeBorderClass: 'border-emerald-300',
    badgeBgClass: 'bg-emerald-50',
    description:
      'This clinical visit has been concluded. Medical consultation notes, prescription summaries, and follow-up guidance have been issued by the attending physician.',
    alertType: 'info',
    nextSteps: [
      'Follow all prescribed dosages, medication schedules, and clinical guidance strictly.',
      'Schedule any recommended follow-up or routine ultrasound scans according to your physician’s instructions.',
      'For repeat consultations or follow-up visits, you may book a new appointment online at any time.',
    ],
    actionRecommendation:
      'Thank you for entrusting your care to Lady Doctor Clinic. Wishing you continued wellness and health.',
  },
  cancelled: {
    title: 'Appointment Cancelled',
    badgeLabel: 'Cancelled',
    badgeColorClass: 'text-rose-800',
    badgeBorderClass: 'border-rose-300',
    badgeBgClass: 'bg-rose-50',
    description:
      'This appointment booking has been cancelled and the scheduled slot has been released. If this cancellation was unexpected or you need to reschedule, our team is ready to assist you.',
    alertType: 'danger',
    nextSteps: [
      'If you still require medical attention, you are welcome to book a new appointment for an upcoming date.',
      'Reach out directly to our reception desk or WhatsApp line if you require urgent assistance or rescheduling support.',
    ],
    actionRecommendation:
      'Need to reschedule? Click below to select a new consultation date or speak with our front desk.',
  },
};

/**
 * Audit log entry for communication history
 */
export interface CommunicationLogEntry {
  id: string;
  appointmentId: string;
  reference: string;
  patientName: string;
  recipientContact: string; // phone or email
  type: 'status_update' | 'manual_message' | 'sms_dispatch' | 'whatsapp_dispatch' | 'email_dispatch';
  channel: 'WhatsApp' | 'Phone Call' | 'SMS' | 'Email' | 'In-App Portal' | 'In-Person';
  subject: string;
  content: string;
  sentBy: string; // staff or admin name / system
  timestamp: string;
}

/**
 * In-memory fallback communication audit log for immediate testing and continuity
 */
export const fallbackCommunicationLogs: CommunicationLogEntry[] = [
  {
    id: 'log-001',
    appointmentId: 'apt-001',
    reference: 'LDC-2026-000001',
    patientName: 'Maryam Fatima',
    recipientContact: '+92 300 1234567',
    type: 'status_update',
    channel: 'In-App Portal',
    subject: 'Appointment Request Submitted',
    content: 'Initial consultation request received for Obstetrics & Antenatal Care. Status set to Pending.',
    sentBy: 'System',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'log-002',
    appointmentId: 'apt-002',
    reference: 'LDC-2026-000002',
    patientName: 'Ayesha Noor',
    recipientContact: '+92 321 7654321',
    type: 'status_update',
    channel: 'WhatsApp',
    subject: 'Appointment Confirmed',
    content: 'Appointment confirmed with Dr. Ayesha Siddiqua for Infant 6-month vaccination on 2026-10-14 at 11:30 AM.',
    sentBy: 'Reception Desk',
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
];
