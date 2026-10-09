export interface TourStop {
  id: string;
  name: string;
  urduName: string;
  category: string;
  durationSeconds: number;
  description: string;
  urduDescription: string;
  highlights: string[];
  hotspots: {
    label: string;
    description: string;
    x: number; // percentage
    y: number; // percentage
  }[];
  voiceGuidance: {
    en: string;
    ur: string;
  };
}

export const hospitalTourStops: TourStop[] = [
  {
    id: 'entrance',
    name: 'Main Entrance & Ambulance Bay',
    urduName: 'مرکزی گیٹ، ویل چیئر ریمپ اور ایمبولینس بے',
    category: 'Access & Facilities',
    durationSeconds: 28,
    description:
      'Spacious ground-floor access with gentle wheelchair ramps, 24/7 emergency ambulance bay, security check desk, and well-lit exterior pavilion near Inspire Business Academy.',
    urduDescription:
      'آسان رسائی، کشادہ ویل چیئر ریمپ، 24 گھنٹے ایمبولینس بے، اور محفوظ خاندانی ماحول۔',
    highlights: [
      'Zero-barrier wheelchair accessibility ramp',
      'Direct stretcher access to emergency triage',
      'Dedicated female security & reception guide',
      'Central Sadiqabad location with family parking'
    ],
    hotspots: [
      { label: 'Wheelchair Ramp', description: 'Gentle gradient compliant with international patient transport standards', x: 25, y: 72 },
      { label: 'Emergency Bay', description: 'Immediate stretcher drop-off directly connected to labor triage', x: 78, y: 55 },
    ],
    voiceGuidance: {
      en: 'Welcome to Lady Doctor Clinic. Our central entrance provides ramp access, dedicated ambulance drop-off, and round-the-clock female nursing support.',
      ur: 'لیڈی ڈاکٹر کلینک میں خوش آمدید۔ ہمارا مرکزی گیٹ کشادہ ویل چیئر ریمپ اور 24 گھنٹے ایمبولینس رسائی سے لیس ہے۔',
    },
  },
  {
    id: 'reception',
    name: 'Reception & Family Waiting Lounge',
    urduName: 'استقبالیہ اور فیملی ویٹنگ لاؤنج',
    category: 'Patient Services',
    durationSeconds: 32,
    description:
      'Comfortable, fully air-conditioned family waiting lounge with a digital token queuing system, purified drinking water, baby nursing corner, and patient care registration counter.',
    urduDescription:
      'مکمل ایئر کنڈیشنڈ فیملی لاؤنج، ڈیجیٹل ٹوکن سسٹم، اور خواتین کے لیے پردہ دار ویٹنگ ایریا۔',
    highlights: [
      'Automated digital appointment check-in token desk',
      'Private curtained nursing & infant feeding area',
      'Free high-speed Wi-Fi and health education displays',
      'Courteous lady patient coordinators'
    ],
    hotspots: [
      { label: 'Token Desk', description: 'Scan your appointment reference code or registered phone number', x: 30, y: 50 },
      { label: 'Family Seating', description: 'Spacious cushioned sofas for mothers and accompanying family members', x: 68, y: 65 },
    ],
    voiceGuidance: {
      en: 'Our reception lounge offers comfortable air-conditioned seating, private baby feeding facilities, and instant digital appointment check-in.',
      ur: 'ہمارا استقبالیہ لاؤنج آرام دہ ایئر کنڈیشنڈ ماحول اور پرائیویٹ فیڈنگ ایریا کے ساتھ آپ کے استقبال کے لیے تیار ہے۔',
    },
  },
  {
    id: 'consultation',
    name: "Lady Doctors Private Consultation Suites",
    urduName: 'ماہر لیڈی ڈاکٹرز کے پرائیویٹ کلینکس',
    category: 'Physician Chambers',
    durationSeconds: 38,
    description:
      'Soundproofed, private consultation chambers for Dr. Ayesha Malik (Obstetrics) and Dr. Fatima Noor (Infertility & PCOS). Equipped with private examination beds, ultrasound review monitors, and digital history archives.',
    urduDescription:
      'مکمل پرائیویٹ، پُرسکون اور جدید معائنہ گاہ برائے لیڈی سپیشلسٹ ڈاکٹرز۔',
    highlights: [
      '100% private, soundproof female physician chambers',
      'Hygienic examination couch with fresh disposable sheets',
      'Integrated digital ultrasound image review display',
      'Strict confidentiality and patient dignity protocols'
    ],
    hotspots: [
      { label: 'Examination Couch', description: 'Private screen divider with female clinical attendant present', x: 42, y: 60 },
      { label: 'Doctor Desk', description: 'Detailed one-on-one consultation with certified lady specialist', x: 75, y: 45 },
    ],
    voiceGuidance: {
      en: 'Each consultation chamber ensures complete patient privacy, allowing open discussions with our board-certified lady specialists.',
      ur: 'ہماری پرائیویٹ کلینیکل رومز میں خواتین مریض بغیر کسی جھجھک کے اپنی صحت کے مسائل پر بات کر سکتی ہیں۔',
    },
  },
  {
    id: 'ultrasound',
    name: '4D Color Doppler Ultrasound & Diagnostics',
    urduName: 'جدید فور ڈی کلر ڈوپلر الٹرا ساؤنڈ روم',
    category: 'Imaging & Scans',
    durationSeconds: 35,
    description:
      'Advanced Japanese ultrasound technology providing crystal-clear 4D fetal anomaly scans, pelvic imaging, and uterine artery Doppler. Operated exclusively by certified female ultrasonologists.',
    urduDescription:
      'جدید ترین فور ڈی بے بی اسکین، کلر ڈوپلر اور لیڈی سونوگرافر کی نگرانی میں تشخیصی خدمات۔',
    highlights: [
      'High-resolution 4D fetal growth and anomaly scans',
      'Experienced certified lady ultrasonologist on duty',
      'Dual-screen setup so expectant mothers can see their baby',
      'Instant printed reports and digital video clips'
    ],
    hotspots: [
      { label: '4D Sonography Machine', description: 'Advanced multi-frequency transducers for accurate obstetrical assessment', x: 35, y: 48 },
      { label: 'Patient View Monitor', description: 'Wall-mounted ceiling screen for mother and family viewing', x: 80, y: 35 },
    ],
    voiceGuidance: {
      en: 'Our diagnostics suite features advanced 4D ultrasound, enabling high-resolution scans conducted by experienced female imaging specialists.',
      ur: 'ہمارا جدید فور ڈی الٹراساؤنڈ روم بے بی کے تفصیلی معائنے اور کلر ڈوپلر کے لیے مخصوص ہے۔',
    },
  },
  {
    id: 'maternity',
    name: 'Maternity Recovery Ward & Neonatal Nursery',
    urduName: 'زچہ و بچہ ریکوری وارڈ اور نرسری',
    category: 'Maternity & Inpatient',
    durationSeconds: 34,
    description:
      'Clean, temperature-controlled postpartum recovery rooms with specialized adjustable labor beds, neonatal warming incubators, oxygen concentrators, and 24/7 dedicated midwife oversight.',
    urduDescription:
      'صاف ستھرا، جراثیم سے پاک پوسٹ پارٹم وارڈ اور نوزائیدہ بچوں کے لیے فوٹو تھراپی اور انکیوبیٹر سہولیات۔',
    highlights: [
      'HEPA-filtered sterile air circulation systems',
      'Continuous pulse oximetry and fetal heart rate monitors',
      'Mother and baby bassinet rooming-in setup',
      'Round-the-clock trained female nursing and midwife staff'
    ],
    hotspots: [
      { label: 'Postpartum Bed', description: 'Fully adjustable electric bed with emergency nurse-call button', x: 30, y: 55 },
      { label: 'Infant Warmer', description: 'Microprocessor radiant warmer for newborn transition and vitals stabilization', x: 75, y: 52 },
    ],
    voiceGuidance: {
      en: 'Our maternity recovery ward provides dedicated midwife care, infant warming cribs, and quiet healing spaces for new mothers and babies.',
      ur: 'ہمارا زچہ و بچہ وارڈ نومولود بچوں کے لیے انکیوبیٹر اور ماؤں کے لیے پُرسکون دیکھ بھال فراہم کرتا ہے۔',
    },
  },
  {
    id: 'emergency',
    name: '24/7 Emergency Triage & Vaccination Pharmacy',
    urduName: '24 گھنٹے ایمرجنسی رسپانس، حفاظتی ٹیکہ جات اور فارمیسی',
    category: 'Emergency & Pharmacy',
    durationSeconds: 30,
    description:
      'Immediate obstetrical emergency stabilization desk, cold-chain compliant EPI vaccines refrigerator, infant phototherapy units, and verified pharmaceutical dispensary.',
    urduDescription:
      'ہنگامی طبی امداد، کولڈ چین ویکسینیشن سنٹر، اور مستند ادویات کی فوری دستیابی۔',
    highlights: [
      '24/7 emergency maternity admission and life support',
      'WHO-approved temperature controlled vaccine storage',
      'Pediatric emergency medication doses and nebulizers',
      'Direct phone coordination for emergency ambulance transfers'
    ],
    hotspots: [
      { label: 'Emergency Crash Cart', description: 'Equipped with emergency obstetrical medications and neonatal bag-mask kits', x: 45, y: 58 },
      { label: 'Cold-Chain Fridge', description: 'Monitored 2°C to 8°C storage for infant vaccines and oxytocin', x: 82, y: 42 },
    ],
    voiceGuidance: {
      en: 'The 24/7 emergency and vaccination counter ensures prompt emergency care and cold-chain certified pediatric vaccines at all hours.',
      ur: 'ایمرجنسی کاؤنٹر اور کولڈ چین فارمیسی چوبیس گھنٹے حاملہ خواتین اور بچوں کی فوری طبی مدد کے لیے حاضر ہے۔',
    },
  },
];
