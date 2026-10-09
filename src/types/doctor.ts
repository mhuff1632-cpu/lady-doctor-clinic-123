export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  specialization: string;
  experience: string;
  bio: string;
  image: string;
  image_url?: string | null;
  consultation_fee: string;
  availability: string;
  daysAvailable?: string[];
  days_available?: string[];
  department: 'Obstetrics' | 'Gynecology' | 'Pediatrics' | 'Women Wellness' | string;
  is_active?: boolean;
  featured?: boolean;
}

