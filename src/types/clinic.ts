export interface OpeningHours {
  days: string;
  hours: string;
  note?: string;
}

export interface SocialMediaLinks {
  facebook_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  youtube_url?: string;
}

export interface ClinicInfo {
  name: string;
  tagline: string;
  subheadline: string;
  phone: string;
  phoneFormatted: string;
  whatsapp: string;
  whatsappUrl: string;
  email: string;
  address: {
    street: string;
    suite: string;
    area: string;
    city: string;
    state: string;
    zip: string;
    full: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  hours: OpeningHours[];
  emergencyNote: string;
  socialMedia: SocialMediaLinks;
  socials: {
    platform: string;
    url: string;
    label: string;
  }[];
}
