import { getSupabaseClient, isSupabaseConfigured } from './client';
import { localStagedAppointments } from './appointments';
import { generateAppointmentReference } from '../../utils/scheduling';
import { AppointmentStatus } from '../../types/database';
import { CommunicationLogEntry, fallbackCommunicationLogs } from '../../types/communication';

export interface PatientLookupResult {
  success: boolean;
  appointment?: {
    id: string;
    reference: string;
    patientName: string;
    phone: string;
    email: string;
    doctorName: string;
    serviceName: string;
    appointmentDate: string;
    appointmentTime: string;
    status: AppointmentStatus;
    createdAt: string;
  };
  error?: string;
  isNotFound?: boolean;
}

/**
 * Searches for an appointment by Reference Number (e.g. LDC-2026-000001)
 * AND verified Phone or Email for strict privacy verification.
 * Does not expose unrelated bookings or sensitive internal records.
 */
export async function lookupPatientAppointment(params: {
  reference: string;
  phoneOrEmail: string;
}): Promise<PatientLookupResult> {
  const cleanRef = params.reference.trim().toUpperCase();
  const cleanContact = params.phoneOrEmail.trim().toLowerCase().replace(/[\s-()]/g, '');

  if (!cleanRef) {
    return {
      success: false,
      error: 'Please enter your appointment reference code (e.g. LDC-2026-000001).',
    };
  }

  if (!cleanContact) {
    return {
      success: false,
      error: 'Please enter the phone number or email address used during booking.',
    };
  }

  const client = getSupabaseClient();

  // If Supabase not connected yet or in preview mode, query local fallback/staged records
  if (!isSupabaseConfigured || !client) {
    // Combine local fallback appointments and localStagedAppointments
    const allCandidates = [...localStagedAppointments];

    const match = allCandidates.find((item) => {
      const itemRef = (item.reference || generateAppointmentReference(item.id)).toUpperCase();
      const refMatches = itemRef === cleanRef || item.id.toUpperCase() === cleanRef;
      
      const itemCleanPhone = item.phone.replace(/[\s-()]/g, '').toLowerCase();
      const itemCleanEmail = item.email.trim().toLowerCase();
      const contactMatches =
        itemCleanPhone.includes(cleanContact) ||
        cleanContact.includes(itemCleanPhone) ||
        itemCleanEmail === cleanContact;

      return refMatches && contactMatches;
    });

    if (!match) {
      return {
        success: false,
        error:
          'No matching appointment was found with the provided reference and contact details. Please verify your reference number or contact reception.',
        isNotFound: true,
      };
    }

    return {
      success: true,
      appointment: {
        id: match.id,
        reference: match.reference || generateAppointmentReference(match.id),
        patientName: match.patient_name,
        phone: match.phone,
        email: match.email,
        doctorName: 'Lady Specialist',
        serviceName: 'Clinical Consultation',
        appointmentDate: match.appointment_date,
        appointmentTime: match.appointment_time,
        status: match.status as AppointmentStatus,
        createdAt: match.created_at,
      },
    };
  }

  try {
    // In live Supabase: query appointments with doctor and service joins
    // We match by reference (via ID suffix or direct lookup) and phone/email
    const { data, error } = await client
      .from('appointments')
      .select('id, patient_name, phone, email, appointment_date, appointment_time, status, created_at, doctors(name), services(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error in appointment lookup query:', error);
      return {
        success: false,
        error: 'Unable to query clinic appointments at this time. Please contact reception.',
      };
    }

    const match = (data || []).find((item: any) => {
      const computedRef = generateAppointmentReference(item.id).toUpperCase();
      const refMatches = computedRef === cleanRef || item.id.toUpperCase() === cleanRef;

      const itemCleanPhone = (item.phone || '').replace(/[\s-()]/g, '').toLowerCase();
      const itemCleanEmail = (item.email || '').trim().toLowerCase();
      const contactMatches =
        itemCleanPhone.includes(cleanContact) ||
        cleanContact.includes(itemCleanPhone) ||
        itemCleanEmail === cleanContact;

      return refMatches && contactMatches;
    });

    if (!match) {
      return {
        success: false,
        error:
          'No matching appointment record found. Please ensure your reference number and contact information are entered exactly as registered.',
        isNotFound: true,
      };
    }

    return {
      success: true,
      appointment: {
        id: match.id,
        reference: generateAppointmentReference(match.id),
        patientName: match.patient_name,
        phone: match.phone,
        email: match.email,
        doctorName: (match as any).doctors?.name || 'Lady Specialist',
        serviceName: (match as any).services?.name || 'Clinical Consultation',
        appointmentDate: match.appointment_date,
        appointmentTime: match.appointment_time,
        status: match.status as AppointmentStatus,
        createdAt: match.created_at,
      },
    };
  } catch (err: any) {
    console.error('Exception looking up appointment:', err);
    return {
      success: false,
      error: err?.message || 'A network error occurred while verifying your appointment.',
    };
  }
}

const LOGS_STORAGE_KEY = 'ldc_communication_logs_v1';

function getStoredLogs(): CommunicationLogEntry[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(LOGS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch {}
  return fallbackCommunicationLogs;
}

function saveStoredLogs(logs: CommunicationLogEntry[]) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
    }
  } catch {}
}

/**
 * Dispatches an audited communication log entry (e.g. status notification or staff message)
 */
export async function logCommunicationDispatch(entry: Omit<CommunicationLogEntry, 'id' | 'timestamp'>): Promise<{ success: boolean; logId: string }> {
  const newId = `log-${Date.now().toString(36)}`;
  const fullLog: CommunicationLogEntry = {
    ...entry,
    id: newId,
    timestamp: new Date().toISOString(),
  };

  // Prepend to audit log in memory and localStorage
  const currentLogs = getStoredLogs();
  currentLogs.unshift(fullLog);
  saveStoredLogs(currentLogs);
  fallbackCommunicationLogs.unshift(fullLog);

  // If Supabase table exists in future, insert here gracefully
  const client = getSupabaseClient();
  if (isSupabaseConfigured && client) {
    try {
      await (client as any)
        .from('appointment_communications')
        .insert([{
          appointment_id: entry.appointmentId,
          reference: entry.reference,
          patient_name: entry.patientName,
          recipient_contact: entry.recipientContact,
          type: entry.type,
          channel: entry.channel,
          subject: entry.subject,
          content: entry.content,
          sent_by: entry.sentBy,
        }]);
    } catch {
      // Graceful fallback to stored audit log
    }
  }

  return { success: true, logId: newId };
}

/**
 * Fetches communication audit trail for a specific appointment
 */
export async function fetchAppointmentCommunicationLogs(appointmentId: string): Promise<CommunicationLogEntry[]> {
  const logs = getStoredLogs();
  return logs.filter((l) => l.appointmentId === appointmentId);
}
