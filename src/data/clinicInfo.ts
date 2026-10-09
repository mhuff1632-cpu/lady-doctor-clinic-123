import { ClinicInfo } from '../types/clinic';

export const clinicInfo: ClinicInfo = {
  name: 'Lady Doctor Clinic',
  tagline: "Dedicated Women's Healthcare by Experienced Lady Specialists",
  subheadline:
    'A sanctuary of compassionate, private, and comprehensive clinical care designed specifically for women and children at every life stage.',
  phone: '+1 (800) 523-9362',
  phoneFormatted: '+18005239362',
  whatsapp: '+1 (800) 523-9362',
  whatsappUrl: 'https://wa.me/18005239362',
  email: 'care@ladydoctorclinic.com',
  address: {
    street: 'Near The Inspire Business Academy, KRL Road',
    suite: 'Lady Doctor Clinic, Healthcare Pavilion Floor 1',
    area: 'Central Medical District',
    city: 'Sadiqabad',
    state: 'Punjab',
    zip: '64350',
    full: 'Near The Inspire Business Academy, KRL Road, Sadiqabad, Punjab 64350',
  },
  coordinates: {
    lat: 28.302814,
    lng: 70.122588,
  },
  hours: [
    {
      days: 'Monday – Friday',
      hours: '8:30 AM – 6:30 PM',
      note: 'Routine Consultations & Specialized Clinics',
    },
    {
      days: 'Saturday',
      hours: '9:00 AM – 3:30 PM',
      note: 'Antenatal, Pediatric & Preventive Wellness',
    },
    {
      days: 'Sunday',
      hours: 'Closed',
      note: 'On-call emergency triage via phone line',
    },
  ],
  emergencyNote: 'For acute emergencies outside operating hours, please visit the nearest hospital emergency department or call emergency services immediately.',
  socialMedia: {
    facebook_url: 'https://facebook.com/ladydoctorclinic',
    instagram_url: 'https://instagram.com/ladydoctorclinic',
    tiktok_url: 'https://tiktok.com/@ladydoctorclinic',
    youtube_url: 'https://youtube.com/@ladydoctorclinic',
  },
  socials: [
    { platform: 'WhatsApp', url: 'https://wa.me/18005239362', label: 'Chat on WhatsApp' },
    { platform: 'Instagram', url: '#instagram', label: 'Follow our Health Tips' },
    { platform: 'Facebook', url: '#facebook', label: 'Join Community Forum' },
    { platform: 'LinkedIn', url: '#linkedin', label: 'Professional Network' },
  ],
};
