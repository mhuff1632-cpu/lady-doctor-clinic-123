export interface Service {
  id: string;
  name: string;
  category: string;
  shortDescription?: string;
  description: string;
  icon: string;
  image?: string;
  image_url?: string | null;
  status?: 'active' | 'coming_soon';
  is_active?: boolean;
  features: string[];
  duration: string;
  featured?: boolean;
}

