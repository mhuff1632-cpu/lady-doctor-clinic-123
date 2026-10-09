import { ClinicPoster } from '../types/poster';

export const initialClinicPosters: ClinicPoster[] = [
  {
    id: 'poster-1',
    title: "Complete Women's Healthcare",
    theme: "Gynecology & Women's Health",
    description:
      "Comprehensive gynecological consultations, PCOS & hormone balancing, preventive pap smears, menstrual irregularities management, and private female-only medical care.",
    image_url: '/images/poster-1.jpg',
    display_order: 1,
    is_active: true,
    highlights: [
      'PCOS & Hormonal Panel Evaluations',
      'Confidential Lady Doctor Consultations',
      'Annual Women’s Health Checkups',
      'Minimally Invasive Treatments'
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'poster-2',
    title: 'Pregnancy & Mother Care',
    theme: 'Pregnancy & Antenatal Care',
    description:
      'Dedicated maternal health tracking from first trimester confirmation to postpartum recovery. High-risk pregnancy monitoring, nutritional guidance, and gentle normal delivery preparation.',
    image_url: '/images/poster-2.jpg',
    display_order: 2,
    is_active: true,
    highlights: [
      'Routine Antenatal Vitals & Blood Screening',
      'Fetal Heart Rate & Growth Monitoring',
      'High-Risk Pregnancy Protocols',
      'Postpartum & Lactation Support'
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'poster-3',
    title: 'Ultrasound & Diagnostic Services',
    theme: "Ultrasound & Women's Diagnostics",
    description:
      'High-resolution diagnostic ultrasound equipment operated by certified female sonographers. Complete pelvic imaging, early pregnancy confirmation, fetal anomaly checks, and same-day clinical reports.',
    image_url: '/images/poster-3.jpg',
    display_order: 3,
    is_active: true,
    highlights: [
      'Pelvic & Transvaginal (TVS) Sonography',
      'Fetal Well-being & Anomaly Scans',
      'Certified Lady Ultrasonologist on Duty',
      'Immediate Physician Consultation'
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'poster-4',
    title: 'Family Planning & Fertility Care',
    theme: 'Family Planning & Reproductive Health',
    description:
      'Empathetic, medically sound counseling for pre-conceptional readiness, fertility diagnostics, hormonal profiling, and personalized family planning choices.',
    image_url: '/images/poster-4.jpg',
    display_order: 4,
    is_active: true,
    highlights: [
      'Pre-marital & Pre-pregnancy Screening',
      'Ovulation Induction & Follicular Tracking',
      'Safe Family Planning Counseling',
      'Couple Reproductive Guidance'
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: 'poster-5',
    title: 'Complete Clinic Services',
    theme: "Overview of Verified Clinic Services",
    description:
      'A holistic view of all specialized clinical services offered at Lady Doctor Clinic, Sadiqabad: Obstetrics, Gynecology, Pediatric Immunization, Diagnostics, and 24/7 Maternity Emergency triage.',
    image_url: '/images/poster-5.jpg',
    display_order: 5,
    is_active: true,
    highlights: [
      '100% Female Medical & Nursing Staff',
      'Strict Hygiene & Sterilization Standards',
      'Central Sadiqabad Location (Near Inspire Academy)',
      'Direct WhatsApp Desk & Online Appointment'
    ],
    created_at: new Date().toISOString(),
  },
];
