import { PatientReview, SubmitReviewInput, ReviewStatus } from '../../types/review';
import { getSupabaseClient, isSupabaseConfigured } from './client';

const REVIEWS_STORAGE_KEY = 'ldc_patient_reviews_v1';

const initialApprovedReviews: PatientReview[] = [
  {
    id: 'rev-1',
    doctor_id: 'a1111111-1111-4111-8111-111111111111',
    doctor_name: 'Dr. Ayesha Malik',
    patient_name: 'Maryam F.',
    rating: 5,
    review_text:
      'Dr. Ayesha Malik is an exceptional obstetrician. She guided me through my high-risk twin pregnancy with profound reassurance, calm professionalism, and unmatched clinical skill.',
    status: 'approved',
    appointment_ref: 'LDC-2026-000001',
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  },
  {
    id: 'rev-2',
    doctor_id: 'a2222222-2222-4222-8222-222222222222',
    doctor_name: 'Dr. Fatima Noor',
    patient_name: 'Amina S.',
    rating: 5,
    review_text:
      'After years of struggling with severe PCOS, Dr. Fatima put me on an individualized lifestyle and clinical management plan. The private atmosphere of the clinic made all the difference.',
    status: 'approved',
    appointment_ref: 'LDC-2026-000002',
    created_at: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
  },
  {
    id: 'rev-3',
    doctor_id: 'a3333333-3333-4333-8333-333333333333',
    doctor_name: 'Dr. Zainab Rehman',
    patient_name: 'Hina P.',
    rating: 5,
    review_text:
      'We bring our infant daughter to Dr. Zainab for all vaccinations and routine growth checks. Her gentle demeanor with newborns puts parents completely at ease.',
    status: 'approved',
    appointment_ref: 'LDC-2026-000003',
    created_at: new Date(Date.now() - 3600000 * 24 * 18).toISOString(),
  },
  {
    id: 'rev-4',
    doctor_id: 'a1111111-1111-4111-8111-111111111111',
    doctor_name: 'Dr. Ayesha Malik',
    patient_name: 'Zahra K.',
    rating: 5,
    review_text:
      'Very clean and strictly female-staffed clinic. Registration was fast and the scan was explained thoroughly with empathy and respect.',
    status: 'approved',
    appointment_ref: 'LDC-2026-000004',
    created_at: new Date(Date.now() - 3600000 * 24 * 22).toISOString(),
  },
];

function getStoredReviews(): PatientReview[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch {}
  return [...initialApprovedReviews];
}

function saveStoredReviews(reviews: PatientReview[]) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    }
  } catch {}
}

export async function fetchApprovedReviews(doctorId?: string): Promise<PatientReview[]> {
  const all = getStoredReviews();
  let approved = all.filter((r) => r.status === 'approved');
  if (doctorId) {
    approved = approved.filter((r) => r.doctor_id === doctorId);
  }

  const client = getSupabaseClient();
  if (isSupabaseConfigured && client) {
    try {
      let query = client
        .from('patient_reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (doctorId) {
        query = query.eq('doctor_id', doctorId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as PatientReview[];
      }
    } catch {}
  }

  return approved;
}

export async function fetchAllReviewsForAdmin(): Promise<PatientReview[]> {
  const all = getStoredReviews();
  const client = getSupabaseClient();
  if (isSupabaseConfigured && client) {
    try {
      const { data, error } = await client
        .from('patient_reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as PatientReview[];
      }
    } catch {}
  }
  return all;
}

export async function submitPatientReview(
  input: SubmitReviewInput
): Promise<{ success: boolean; data?: PatientReview; error?: string }> {
  // Validate rating
  const ratingNum = Math.min(5, Math.max(1, Math.round(Number(input.rating))));

  const newReview: PatientReview = {
    id: `rev-${Date.now().toString(36)}`,
    doctor_id: input.doctor_id,
    doctor_name: input.doctor_name,
    patient_name: input.patient_name.trim(),
    rating: ratingNum,
    review_text: input.review_text.trim(),
    status: 'pending', // Strictly enters moderation queue
    appointment_ref: input.appointment_ref?.trim() || undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const stored = getStoredReviews();
  stored.unshift(newReview);
  saveStoredReviews(stored);

  const client = getSupabaseClient();
  if (isSupabaseConfigured && client) {
    try {
      await client.from('patient_reviews').insert([newReview]);
    } catch {}
  }

  return { success: true, data: newReview };
}

export async function updateReviewStatus(
  id: string,
  status: ReviewStatus,
  adminNote?: string
): Promise<{ success: boolean; error?: string }> {
  const stored = getStoredReviews();
  const idx = stored.findIndex((r) => r.id === id);
  if (idx !== -1) {
    stored[idx] = {
      ...stored[idx],
      status,
      admin_note: adminNote !== undefined ? adminNote : stored[idx].admin_note,
      updated_at: new Date().toISOString(),
    };
    saveStoredReviews(stored);
  }

  const client = getSupabaseClient();
  if (isSupabaseConfigured && client) {
    try {
      await client
        .from('patient_reviews')
        .update({ status, admin_note: adminNote })
        .eq('id', id);
    } catch {}
  }

  return { success: true };
}

export async function deleteReview(id: string): Promise<{ success: boolean; error?: string }> {
  const stored = getStoredReviews();
  const filtered = stored.filter((r) => r.id !== id);
  saveStoredReviews(filtered);

  const client = getSupabaseClient();
  if (isSupabaseConfigured && client) {
    try {
      await client.from('patient_reviews').delete().eq('id', id);
    } catch {}
  }

  return { success: true };
}
