import { getSupabaseClient, isSupabaseConfigured } from './client';
import { Doctor } from '../../types/doctor';
import { Service } from '../../types/service';
import { AppointmentStatus, ContactInquiryStatus } from '../../types/database';
import { demoDoctors } from '../../data/doctors';
import { demoServices } from '../../data/services';
import { generateAppointmentReference } from '../../utils/scheduling';

export interface DashboardStats {
  doctors: { total: number; active: number };
  services: { total: number; active: number };
  appointments: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  inquiries: {
    total: number;
    new: number;
    read: number;
    resolved: number;
  };
  recentAppointments: AdminAppointmentItem[];
  recentInquiries: AdminInquiryItem[];
}

export interface AdminAppointmentItem {
  id: string;
  reference?: string;
  patient_name: string;
  phone: string;
  email: string;
  doctor_id: string | null;
  doctor_name?: string;
  service_id: string | null;
  service_name?: string;
  duration?: string;
  appointment_date: string;
  appointment_time: string;
  message: string | null;
  status: AppointmentStatus;
  created_at: string;
}

export interface AdminInquiryItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactInquiryStatus;
  created_at: string;
}

// Initial fallback mock data for testing when database is staged
let localFallbackAppointments: AdminAppointmentItem[] = [
  {
    id: 'apt-001',
    reference: 'LDC-2026-000001',
    patient_name: 'Maryam Fatima',
    phone: '+92 300 1234567',
    email: 'maryam.f@example.com',
    doctor_id: 'a1111111-1111-4111-8111-111111111111',
    doctor_name: 'Dr. Sarah Khan',
    service_id: 'b1111111-1111-4111-8111-111111111111',
    service_name: 'Obstetrics & Antenatal Care',
    duration: '45 mins',
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
    doctor_name: 'Dr. Amina Rehman',
    service_id: 'b4444444-4444-4444-8444-444444444444',
    service_name: 'Pediatrics & Newborn Care',
    duration: '30 mins',
    appointment_date: '2026-10-14',
    appointment_time: '11:30 AM',
    message: 'Infant 6-month vaccination checkup.',
    status: 'confirmed',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'apt-003',
    reference: 'LDC-2026-000003',
    patient_name: 'Zahra Batool',
    phone: '+92 333 9876543',
    email: 'zahra.b@example.com',
    doctor_id: 'a3333333-3333-4333-8333-333333333333',
    doctor_name: 'Dr. Fatima Al-Zahra',
    service_id: 'b3333333-3333-4333-8333-333333333333',
    service_name: 'Fertility & Hormone Clinic',
    duration: '45 mins',
    appointment_date: '2026-10-09',
    appointment_time: '02:00 PM',
    message: 'Follow-up for hormonal panel reviews.',
    status: 'completed',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
];

export let localFallbackInquiries: AdminInquiryItem[] = [
  {
    id: 'inq-001',
    name: 'Sana Tariq',
    email: 'sana.tariq@example.com',
    phone: '+92 301 5551234',
    subject: 'Consultation Fee and Ultrasound Timings',
    message: 'Hello, do you provide 4D anomaly ultrasound scans on Saturdays? Please inform us about package details.',
    status: 'new',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'inq-002',
    name: 'Hina Parveen',
    email: 'hina.p@example.com',
    phone: '+92 345 8889990',
    subject: 'Dr. Sarah Khan Visiting Days',
    message: 'Is Dr. Sarah Khan available for evening consultations this Thursday in Sadiqabad?',
    status: 'read',
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
];

let localDoctorsList: Doctor[] = [...demoDoctors];
let localServicesList: Service[] = [...demoServices];

/**
 * Fetch Overall Dashboard Statistics
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const client = getSupabaseClient();

  if (!isSupabaseConfigured || !client) {
    const pending = localFallbackAppointments.filter((a) => a.status === 'pending').length;
    const confirmed = localFallbackAppointments.filter((a) => a.status === 'confirmed').length;
    const completed = localFallbackAppointments.filter((a) => a.status === 'completed').length;
    const cancelled = localFallbackAppointments.filter((a) => a.status === 'cancelled').length;

    const inqNew = localFallbackInquiries.filter((i) => i.status === 'new').length;
    const inqRead = localFallbackInquiries.filter((i) => i.status === 'read').length;
    const inqResolved = localFallbackInquiries.filter((i) => i.status === 'resolved').length;

    return {
      doctors: {
        total: localDoctorsList.length,
        active: localDoctorsList.filter((d) => d.is_active !== false).length,
      },
      services: {
        total: localServicesList.length,
        active: localServicesList.filter((s) => s.is_active !== false).length,
      },
      appointments: {
        total: localFallbackAppointments.length,
        pending,
        confirmed,
        completed,
        cancelled,
      },
      inquiries: {
        total: localFallbackInquiries.length,
        new: inqNew,
        read: inqRead,
        resolved: inqResolved,
      },
      recentAppointments: localFallbackAppointments.slice(0, 5),
      recentInquiries: localFallbackInquiries.slice(0, 5),
    };
  }

  try {
    // 1. Doctors count
    const { data: docs } = await client.from('doctors').select('id, is_active');
    const totalDocs = docs?.length || 0;
    const activeDocs = docs?.filter((d) => d.is_active).length || 0;

    // 2. Services count
    const { data: srvs } = await client.from('services').select('id, is_active');
    const totalSrvs = srvs?.length || 0;
    const activeSrvs = srvs?.filter((s) => s.is_active).length || 0;

    // 3. Appointments
    const { data: apts } = await client
      .from('appointments')
      .select('id, patient_name, phone, email, doctor_id, service_id, appointment_date, appointment_time, message, status, created_at')
      .order('created_at', { ascending: false });

    const totalApts = apts?.length || 0;
    const pendingApts = apts?.filter((a) => a.status === 'pending').length || 0;
    const confirmedApts = apts?.filter((a) => a.status === 'confirmed').length || 0;
    const completedApts = apts?.filter((a) => a.status === 'completed').length || 0;
    const cancelledApts = apts?.filter((a) => a.status === 'cancelled').length || 0;

    // 4. Inquiries
    const { data: inqs } = await client
      .from('contact_inquiries')
      .select('id, name, email, phone, subject, message, status, created_at')
      .order('created_at', { ascending: false });

    const totalInqs = inqs?.length || 0;
    const newInqs = inqs?.filter((i) => i.status === 'new').length || 0;
    const readInqs = inqs?.filter((i) => i.status === 'read').length || 0;
    const resolvedInqs = inqs?.filter((i) => i.status === 'resolved').length || 0;

    const recentAppointments: AdminAppointmentItem[] = (apts || []).slice(0, 5).map((a) => ({
      id: a.id,
      patient_name: a.patient_name,
      phone: a.phone,
      email: a.email,
      doctor_id: a.doctor_id,
      service_id: a.service_id,
      appointment_date: a.appointment_date,
      appointment_time: a.appointment_time,
      message: a.message,
      status: a.status as AppointmentStatus,
      created_at: a.created_at,
    }));

    const recentInquiries: AdminInquiryItem[] = (inqs || []).slice(0, 5).map((i) => ({
      id: i.id,
      name: i.name,
      email: i.email,
      phone: i.phone,
      subject: i.subject,
      message: i.message,
      status: i.status as ContactInquiryStatus,
      created_at: i.created_at,
    }));

    return {
      doctors: { total: totalDocs, active: activeDocs },
      services: { total: totalSrvs, active: activeSrvs },
      appointments: {
        total: totalApts,
        pending: pendingApts,
        confirmed: confirmedApts,
        completed: completedApts,
        cancelled: cancelledApts,
      },
      inquiries: {
        total: totalInqs,
        new: newInqs,
        read: readInqs,
        resolved: resolvedInqs,
      },
      recentAppointments,
      recentInquiries,
    };
  } catch (err) {
    console.warn('Dashboard stats query notice:', err);
    return fetchDashboardStats(); // fallback
  }
}

/**
 * Appointments Management
 */
export async function fetchAdminAppointments(
  statusFilter?: string,
  search?: string
): Promise<AdminAppointmentItem[]> {
  const client = getSupabaseClient();

  if (!isSupabaseConfigured || !client) {
    let list = [...localFallbackAppointments];
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.patient_name.toLowerCase().includes(q) ||
          a.phone.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q)
      );
    }
    return list;
  }

  try {
    let query = client
      .from('appointments')
      .select('id, patient_name, phone, email, doctor_id, service_id, appointment_date, appointment_time, message, status, created_at, doctors(name), services(name, duration)')
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter as AppointmentStatus);
    }

    if (search) {
      query = query.or(`patient_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) {
      // If relation join fails due to custom foreign keys, fallback to standard select
      const fallbackQuery = await client
        .from('appointments')
        .select('id, patient_name, phone, email, doctor_id, service_id, appointment_date, appointment_time, message, status, created_at')
        .order('created_at', { ascending: false });
      if (fallbackQuery.error) throw fallbackQuery.error;
      return (fallbackQuery.data || []).map((row: any) => ({
        id: row.id,
        reference: generateAppointmentReference(row.id),
        patient_name: row.patient_name,
        phone: row.phone,
        email: row.email,
        doctor_id: row.doctor_id,
        service_id: row.service_id,
        appointment_date: row.appointment_date,
        appointment_time: row.appointment_time,
        message: row.message,
        status: row.status as AppointmentStatus,
        created_at: row.created_at,
      }));
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      reference: generateAppointmentReference(row.id),
      patient_name: row.patient_name,
      phone: row.phone,
      email: row.email,
      doctor_id: row.doctor_id,
      doctor_name: row.doctors?.name || undefined,
      service_id: row.service_id,
      service_name: row.services?.name || undefined,
      duration: row.services?.duration || undefined,
      appointment_date: row.appointment_date,
      appointment_time: row.appointment_time,
      message: row.message,
      status: row.status as AppointmentStatus,
      created_at: row.created_at,
    }));
  } catch (err: any) {
    console.error('Error fetching admin appointments:', err);
    return localFallbackAppointments;
  }
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();

  if (!isSupabaseConfigured || !client) {
    const idx = localFallbackAppointments.findIndex((a) => a.id === id);
    if (idx !== -1) {
      localFallbackAppointments[idx].status = status;
      return { success: true };
    }
    return { success: false, error: 'Appointment not found' };
  }

  try {
    const { error } = await client
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update appointment status.' };
  }
}

/**
 * Contact Inquiries Management
 */
export async function fetchAdminInquiries(
  statusFilter?: string,
  search?: string
): Promise<AdminInquiryItem[]> {
  const client = getSupabaseClient();

  if (!isSupabaseConfigured || !client) {
    let list = [...localFallbackInquiries];
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((i) => i.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.subject.toLowerCase().includes(q)
      );
    }
    return list;
  }

  try {
    let query = client
      .from('contact_inquiries')
      .select('id, name, email, phone, subject, message, status, created_at')
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter as ContactInquiryStatus);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      subject: row.subject,
      message: row.message,
      status: row.status as ContactInquiryStatus,
      created_at: row.created_at,
    }));
  } catch (err: any) {
    console.error('Error fetching admin inquiries:', err);
    return localFallbackInquiries;
  }
}

export async function updateInquiryStatus(
  id: string,
  status: ContactInquiryStatus
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();

  if (!isSupabaseConfigured || !client) {
    const idx = localFallbackInquiries.findIndex((i) => i.id === id);
    if (idx !== -1) {
      localFallbackInquiries[idx].status = status;
      return { success: true };
    }
    return { success: false, error: 'Inquiry not found' };
  }

  try {
    const { error } = await client
      .from('contact_inquiries')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update inquiry status.' };
  }
}

/**
 * Doctors Management (CRUD)
 */
export async function fetchAllAdminDoctors(): Promise<Doctor[]> {
  const client = getSupabaseClient();

  if (!isSupabaseConfigured || !client) {
    return localDoctorsList;
  }

  try {
    const { data, error } = await client
      .from('doctors')
      .select('id, name, qualification, specialization, department, experience, bio, image_url, consultation_fee, availability, days_available, is_active')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      qualification: row.qualification,
      specialization: row.specialization,
      department: row.department,
      experience: row.experience,
      bio: row.bio,
      image: row.image_url || '/images/doctor-sarah.jpg',
      image_url: row.image_url,
      consultation_fee: row.consultation_fee,
      availability: row.availability,
      daysAvailable: row.days_available || [],
      is_active: row.is_active,
    }));
  } catch (err: any) {
    console.error('Error fetching all doctors for admin:', err);
    return localDoctorsList;
  }
}

export async function createDoctor(
  doctor: Omit<Doctor, 'id'>
): Promise<{ success: boolean; doctor?: Doctor; error?: string }> {
  const client = getSupabaseClient();

  if (!isSupabaseConfigured || !client) {
    const newDoc: Doctor = {
      ...doctor,
      id: `doc-${Date.now()}`,
      is_active: doctor.is_active ?? true,
    };
    localDoctorsList.push(newDoc);
    return { success: true, doctor: newDoc };
  }

  try {
    const { data, error } = await client
      .from('doctors')
      .insert([
        {
          name: doctor.name.trim(),
          qualification: doctor.qualification.trim(),
          specialization: doctor.specialization.trim(),
          department: doctor.department,
          experience: doctor.experience.trim(),
          bio: doctor.bio.trim(),
          image_url: doctor.image || doctor.image_url || null,
          consultation_fee: doctor.consultation_fee.trim(),
          availability: doctor.availability.trim(),
          days_available: doctor.daysAvailable || doctor.days_available || [],
          is_active: doctor.is_active ?? true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      doctor: {
        id: data.id,
        name: data.name,
        qualification: data.qualification,
        specialization: data.specialization,
        department: data.department,
        experience: data.experience,
        bio: data.bio,
        image: data.image_url || '/images/doctor-sarah.jpg',
        image_url: data.image_url,
        consultation_fee: data.consultation_fee,
        availability: data.availability,
        daysAvailable: data.days_available || [],
        is_active: data.is_active,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create doctor.' };
  }
}

export async function updateDoctor(
  id: string,
  doctor: Partial<Doctor>
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();

  if (!isSupabaseConfigured || !client) {
    const idx = localDoctorsList.findIndex((d) => d.id === id);
    if (idx !== -1) {
      localDoctorsList[idx] = { ...localDoctorsList[idx], ...doctor };
      return { success: true };
    }
    return { success: false, error: 'Doctor not found.' };
  }

  try {
    const updatePayload: any = {};
    if (doctor.name) updatePayload.name = doctor.name.trim();
    if (doctor.qualification) updatePayload.qualification = doctor.qualification.trim();
    if (doctor.specialization) updatePayload.specialization = doctor.specialization.trim();
    if (doctor.department) updatePayload.department = doctor.department;
    if (doctor.experience) updatePayload.experience = doctor.experience.trim();
    if (doctor.bio) updatePayload.bio = doctor.bio.trim();
    if (doctor.image || doctor.image_url) updatePayload.image_url = doctor.image || doctor.image_url;
    if (doctor.consultation_fee) updatePayload.consultation_fee = doctor.consultation_fee.trim();
    if (doctor.availability) updatePayload.availability = doctor.availability.trim();
    if (doctor.daysAvailable) updatePayload.days_available = doctor.daysAvailable;
    if (doctor.is_active !== undefined) updatePayload.is_active = doctor.is_active;

    const { error } = await client.from('doctors').update(updatePayload).eq('id', id);
    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update doctor.' };
  }
}

export async function toggleDoctorStatus(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  return updateDoctor(id, { is_active: isActive });
}

/**
 * Services Management (CRUD)
 */
export async function fetchAllAdminServices(): Promise<Service[]> {
  const client = getSupabaseClient();

  if (!isSupabaseConfigured || !client) {
    return localServicesList;
  }

  try {
    const { data, error } = await client
      .from('services')
      .select('id, name, category, description, icon, image_url, duration, features, is_active')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      icon: row.icon || 'Stethoscope',
      image: row.image_url || '/images/clinic_interior_consultation_1791390183063.jpg',
      image_url: row.image_url,
      duration: row.duration,
      features: Array.isArray(row.features) ? (row.features as string[]) : [],
      is_active: row.is_active,
    }));
  } catch (err: any) {
    console.error('Error fetching all services for admin:', err);
    return localServicesList;
  }
}

export async function createService(
  service: Omit<Service, 'id'>
): Promise<{ success: boolean; service?: Service; error?: string }> {
  const client = getSupabaseClient();

  if (!isSupabaseConfigured || !client) {
    const newSrv: Service = {
      ...service,
      id: `srv-${Date.now()}`,
      is_active: service.is_active ?? true,
    };
    localServicesList.push(newSrv);
    return { success: true, service: newSrv };
  }

  try {
    const { data, error } = await client
      .from('services')
      .insert([
        {
          name: service.name.trim(),
          category: service.category.trim(),
          description: service.description.trim(),
          icon: service.icon || 'Stethoscope',
          image_url: service.image || service.image_url || null,
          duration: service.duration.trim(),
          features: service.features || [],
          is_active: service.is_active ?? true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      service: {
        id: data.id,
        name: data.name,
        category: data.category,
        description: data.description,
        icon: data.icon,
        image: data.image_url || '/images/clinic_interior_consultation_1791390183063.jpg',
        image_url: data.image_url,
        duration: data.duration,
        features: Array.isArray(data.features) ? (data.features as string[]) : [],
        is_active: data.is_active,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create service.' };
  }
}

export async function updateService(
  id: string,
  service: Partial<Service>
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();

  if (!isSupabaseConfigured || !client) {
    const idx = localServicesList.findIndex((s) => s.id === id);
    if (idx !== -1) {
      localServicesList[idx] = { ...localServicesList[idx], ...service };
      return { success: true };
    }
    return { success: false, error: 'Service not found.' };
  }

  try {
    const updatePayload: any = {};
    if (service.name) updatePayload.name = service.name.trim();
    if (service.category) updatePayload.category = service.category.trim();
    if (service.description) updatePayload.description = service.description.trim();
    if (service.icon) updatePayload.icon = service.icon;
    if (service.image || service.image_url) updatePayload.image_url = service.image || service.image_url;
    if (service.duration) updatePayload.duration = service.duration.trim();
    if (service.features) updatePayload.features = service.features;
    if (service.is_active !== undefined) updatePayload.is_active = service.is_active;

    const { error } = await client.from('services').update(updatePayload).eq('id', id);
    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update service.' };
  }
}

export async function toggleServiceStatus(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  return updateService(id, { is_active: isActive });
}
