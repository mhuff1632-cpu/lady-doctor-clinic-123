export interface ClinicPoster {
  id: string;
  title: string;
  theme: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  highlights?: string[];
  created_at: string;
  updated_at?: string;
}

export interface CreatePosterInput {
  title: string;
  theme: string;
  description: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  highlights?: string[];
}
