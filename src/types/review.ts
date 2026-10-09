export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden';

export interface PatientReview {
  id: string;
  doctor_id: string;
  doctor_name: string;
  patient_name: string;
  rating: number; // 1 to 5
  review_text: string;
  status: ReviewStatus;
  appointment_ref?: string;
  admin_note?: string;
  created_at: string;
  updated_at?: string;
}

export interface SubmitReviewInput {
  doctor_id: string;
  doctor_name: string;
  patient_name: string;
  rating: number;
  review_text: string;
  appointment_ref?: string;
}
