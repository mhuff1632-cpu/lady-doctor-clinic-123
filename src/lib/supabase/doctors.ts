import { getSupabaseClient, isSupabaseConfigured } from './client';
import { Doctor } from '../../types/doctor';
import { demoDoctors } from '../../data/doctors';

export interface FetchDoctorsResult {
  data: Doctor[];
  error: string | null;
  isLive: boolean;
}

export async function fetchActiveDoctors(): Promise<FetchDoctorsResult> {
  const client = getSupabaseClient();

  if (!isSupabaseConfigured || !client) {
    return {
      data: demoDoctors,
      error: null,
      isLive: false,
    };
  }

  try {
    const { data, error } = await client
      .from('doctors')
      .select('id, name, qualification, specialization, department, experience, bio, image_url, consultation_fee, availability, days_available, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase doctors query notice:', error.message);
      return {
        data: demoDoctors,
        error: error.message,
        isLive: false,
      };
    }

    if (!data || data.length === 0) {
      return {
        data: [],
        error: null,
        isLive: true,
      };
    }

    const mappedDoctors: Doctor[] = data.map((row) => ({
      id: row.id,
      name: row.name,
      qualification: row.qualification,
      specialization: row.specialization,
      department: row.department,
      experience: row.experience,
      bio: row.bio,
      image: row.image_url || '/src/assets/images/doctor_dr_sarah_khan_1791390148660.jpg',
      image_url: row.image_url,
      consultation_fee: row.consultation_fee,
      availability: row.availability,
      daysAvailable: row.days_available || [],
      days_available: row.days_available || [],
      is_active: row.is_active,
    }));

    return {
      data: mappedDoctors,
      error: null,
      isLive: true,
    };
  } catch (err: any) {
    console.error('Unexpected error fetching doctors from Supabase:', err);
    return {
      data: demoDoctors,
      error: err?.message || 'Unable to connect to live database.',
      isLive: false,
    };
  }
}
