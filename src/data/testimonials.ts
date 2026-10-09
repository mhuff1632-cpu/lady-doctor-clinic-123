import { Testimonial } from '../types/testimonial';

/**
 * Demo Testimonials for Phase 1 Prototype.
 * Clearly marked as demonstrative data pending real patient feedback integration via Supabase.
 */
export const demoTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    patientName: 'A. M., Maternal Patient',
    careReceived: 'Antenatal & Maternity Consultations',
    verifiedVisit: true,
    quote:
      'Finding a clinic where the lady doctors truly take time to listen without rushing made all the difference during my first pregnancy. The serene clinic environment and Dr. Sarah’s calm reassurance kept me at ease.',
    rating: 5,
    date: 'Demo Review · Maternal Care',
    isDemo: true,
  },
  {
    id: 'test-2',
    patientName: 'R. K., Preventive Wellness Patient',
    careReceived: 'Routine Gynecological Screening & PCOS Plan',
    verifiedVisit: true,
    quote:
      'I had postponed routine checks for years due to clinical anxiety. The team at Lady Doctor Clinic made me feel safe, respected, and completely heard from the moment I entered.',
    rating: 5,
    date: 'Demo Review · Women’s Health',
    isDemo: true,
  },
  {
    id: 'test-3',
    patientName: 'H. S., Pediatric Parent',
    careReceived: 'Pediatric Milestone Check & Immunization',
    verifiedVisit: true,
    quote:
      'Dr. Amina was wonderful with my 6-month-old daughter. The clinic is clean, child-friendly, and appointments run punctually. A blessing for busy mothers seeking compassionate doctors.',
    rating: 5,
    date: 'Demo Review · Pediatric Care',
    isDemo: true,
  },
];
