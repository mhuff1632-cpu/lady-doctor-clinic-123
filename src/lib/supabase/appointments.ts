import { getSupabaseClient, isSupabaseConfigured } from './client';
import { AppointmentFormData, BookedSlotRecord } from '../../types/appointment';
import { generateAppointmentReference } from '../../utils/scheduling';

export interface SubmitAppointmentResult {
  success: boolean;
  appointmentId?: string;
  reference?: string;
  status?: string;
  error?: string;
  isConflict?: boolean;
  isLive: boolean;
}

// Map known demo IDs to seed database UUIDs for seamless compatibility
const legacyDoctorMap: Record<string, string> = {
  'doc-sarah-khan': 'a1111111-1111-4111-8111-111111111111',
  'doc-amina-rehman': 'a2222222-2222-4222-8222-222222222222',
  'doc-fatima-al-zahra': 'a3333333-3333-4333-8333-333333333333',
  'doc-zainab-malik': 'a4444444-4444-4444-8444-444444444444',
};

const legacyServiceMap: Record<string, string> = {
  'obstetrics-maternity': 'b1111111-1111-4111-8111-111111111111',
  'general-gynecology': 'b2222222-2222-4222-8222-222222222222',
  'fertility-hormone-health': 'b3333333-3333-4333-8333-333333333333',
  'pediatric-newborn-care': 'b4444444-4444-4444-8444-444444444444',
  'menopause-healthy-aging': 'b5555555-5555-4555-8555-555555555555',
  'ultrasound-diagnostics': 'b6666666-6666-4666-8666-666666666666',
};

export const isValidUuid = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

export function resolveDoctorId(id: string): string | null {
  if (!id || id === 'any-available') return null;
  if (isValidUuid(id)) return id;
  return legacyDoctorMap[id] || null;
}

export function resolveServiceId(id: string): string | null {
  if (!id || id === 'general-consult') return null;
  if (isValidUuid(id)) return id;
  return legacyServiceMap[id] || null;
}

// In-memory appointments list for stage / preview environments when Supabase is not configured
let localStagedAppointments: Array<{
  id: string;
  reference: string;
  patient_name: string;
  phone: string;
  email: string;
  doctor_id: string | null;
  service_id: string | null;
  appointment_date: string;
  appointment_time: string;
  message: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}> = [
  {
    id: 'apt-001',
    reference: 'LDC-2026-000001',
    patient_name: 'Maryam Fatima',
    phone: '+92 300 1234567',
    email: 'maryam.f@example.com',
    doctor_id: 'a1111111-1111-4111-8111-111111111111',
    service_id: 'b1111111-1111-4111-8111-111111111111',
    appointment_date: '2026-10-12',
    appointment_time: '10:00 AM',
    message: 'First trimester antenatal scan request.',
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'apt-002',
    reference: 'LDC-2026-000002',
    patient_name: 'Ayesha Noor',
    phone: '+92 321 7654321',
    email: 'ayesha.n@example.com',
    doctor_id: 'a2222222-2222-4222-8222-222222222222',
    service_id: 'b4444444-4444-4444-8444-444444444444',
    appointment_date: '2026-10-14',
    appointment_time: '11:30 AM',
    message: 'Infant 6-month vaccination checkup.',
    status: 'confirmed',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

/**
 * Fetches booked slots for a specific doctor and date.
 * Public safe: returns only appointment_time and status.
 */
export async function fetchDoctorBookedSlots(
  doctorId: string,
  date: string
): Promise<BookedSlotRecord[]> {
  const resolvedDocId = resolveDoctorId(doctorId);
  const client = getSupabaseClient();

  if (!isSupabaseConfigured || !client) {
    // Return from local staged bookings matching doctor and date
    const matches = localStagedAppointments.filter(
      (a) =>
        (a.doctor_id === resolvedDocId || a.doctor_id === doctorId) &&
        a.appointment_date === date &&
        (a.status === 'pending' || a.status === 'confirmed')
    );
    return matches.map((m) => ({
      appointment_time: m.appointment_time,
      status: m.status,
    }));
  }

  try {
    if (!resolvedDocId) {
      return [];
    }

    // Try calling get_booked_slots RPC if available
    const { data, error } = await client.rpc('get_booked_slots', {
      p_doctor_id: resolvedDocId,
      p_date: date,
    });

    if (!error && Array.isArray(data)) {
      return data;
    }

    // Fallback: direct query
    const { data: directData, error: directErr } = await client
      .from('appointments')
      .select('appointment_time, status')
      .eq('doctor_id', resolvedDocId)
      .eq('appointment_date', date)
      .in('status', ['pending', 'confirmed']);

    if (directErr) {
      console.warn('Notice querying booked slots:', directErr.message);
      return [];
    }

    return (directData || []).map((row) => ({
      appointment_time: row.appointment_time,
      status: row.status,
    }));
  } catch (err) {
    console.warn('Could not fetch booked slots:', err);
    return [];
  }
}

/**
 * Submits an appointment request atomically with database-level conflict protection.
 */
export async function submitAppointmentRequest(
  formData: AppointmentFormData
): Promise<SubmitAppointmentResult> {
  const resolvedDocId = resolveDoctorId(formData.doctorId);
  const resolvedServId = resolveServiceId(formData.serviceId);

  const client = getSupabaseClient();

  // If Supabase credentials are staged in preview mode
  if (!isSupabaseConfigured || !client) {
    // Test for conflicting slot in local staged appointments
    const conflict = localStagedAppointments.find(
      (a) =>
        a.doctor_id === resolvedDocId &&
        a.appointment_date === formData.preferredDate &&
        a.appointment_time === formData.preferredTime &&
        (a.status === 'pending' || a.status === 'confirmed')
    );

    if (conflict) {
      return {
        success: false,
        error: 'This appointment slot is no longer available. Please select another time.',
        isConflict: true,
        isLive: false,
      };
    }

    const generatedId = `apt-${Date.now().toString(36)}`;
    const reference = generateAppointmentReference(generatedId);

    localStagedAppointments.push({
      id: generatedId,
      reference,
      patient_name: formData.patientName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
      doctor_id: resolvedDocId,
      service_id: resolvedServId,
      appointment_date: formData.preferredDate,
      appointment_time: formData.preferredTime,
      message: formData.message.trim() || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
      appointmentId: generatedId,
      reference,
      status: 'pending',
      isLive: false,
    };
  }

  try {
    // 1. Try atomic booking RPC
    const { data: rpcData, error: rpcError } = await client.rpc('book_appointment_atomic', {
      p_patient_name: formData.patientName.trim(),
      p_phone: formData.phone.trim(),
      p_email: formData.email.trim().toLowerCase(),
      p_doctor_id: resolvedDocId,
      p_service_id: resolvedServId,
      p_appointment_date: formData.preferredDate,
      p_appointment_time: formData.preferredTime,
      p_message: formData.message.trim() || null,
    });

    if (!rpcError && rpcData && typeof rpcData === 'object') {
      const res = rpcData as any;
      if (res.success) {
        return {
          success: true,
          appointmentId: res.appointment_id,
          reference: res.reference || generateAppointmentReference(res.appointment_id),
          status: res.status || 'pending',
          isLive: true,
        };
      } else {
        return {
          success: false,
          error: res.error || 'This appointment slot is no longer available.',
          isConflict: Boolean(res.conflict),
          isLive: true,
        };
      }
    }

    // 2. Direct insert fallback if RPC not installed
    const payload = {
      patient_name: formData.patientName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
      doctor_id: resolvedDocId,
      service_id: resolvedServId,
      appointment_date: formData.preferredDate,
      appointment_time: formData.preferredTime,
      message: formData.message.trim() || null,
      status: 'pending' as const,
    };

    const { data, error } = await client
      .from('appointments')
      .insert([payload])
      .select('id')
      .single();

    if (error) {
      console.error('Supabase appointment insertion error:', error);
      const isUniqueViolation = error.code === '23505' || error.message.includes('unique');
      return {
        success: false,
        error: isUniqueViolation
          ? 'This appointment slot was just booked by another patient. Please select another time.'
          : error.message || 'Unable to record appointment. Please contact our reception desk.',
        isConflict: isUniqueViolation,
        isLive: true,
      };
    }

    const appointmentId = data?.id;
    const reference = generateAppointmentReference(appointmentId);

    return {
      success: true,
      appointmentId,
      reference,
      status: 'pending',
      isLive: true,
    };
  } catch (err: any) {
    console.error('Unexpected error submitting appointment:', err);
    return {
      success: false,
      error: err?.message || 'A network error occurred while connecting to the clinic server.',
      isLive: true,
    };
  }
}

export { localStagedAppointments };
