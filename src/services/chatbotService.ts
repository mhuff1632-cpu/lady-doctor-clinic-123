import { clinicInfo } from '../data/clinicInfo';
import { initialClinicPosters } from '../data/postersData';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  quickActions?: {
    label: string;
    action: () => void;
  }[];
}

const emergencyKeywords = [
  'bleeding',
  'emergency',
  'severe pain',
  'unconscious',
  'labour pain',
  'labor pain',
  'fainted',
  'critical',
  'heart attack',
  'accident',
  'dard',
  'khoon',
  'emargency',
];

const medicalDiagnosisKeywords = [
  'medicine do',
  'medicine',
  'dawa',
  'prescription',
  'dosage',
  'konsi dawai',
  'cure',
  'diagnose',
  'treatment for fever',
  'antibiotic',
  'painkiller',
];

const salaryKeywords = ['salary', 'income', 'pay', 'tankhwah', 'kamayi', 'earnings'];

export async function processChatQuery(
  userInput: string,
  navigate: (path: string) => void
): Promise<{ text: string; quickActions?: { label: string; action: () => void }[] }> {
  const query = userInput.toLowerCase().trim();

  // 1. Strict Emergency Guardrail
  if (emergencyKeywords.some((k) => query.includes(k))) {
    return {
      text: `⚠️ **Medical Emergency Alert**\n\nIf the patient is experiencing acute pain, active bleeding, or emergency labor pains, please do not wait for an online reply.\n\n• **Direct Emergency Line:** ${clinicInfo.phone}\n• **WhatsApp Triage:** ${clinicInfo.whatsapp}\n• **Address:** ${clinicInfo.address.full}\n\nPlease proceed directly to our emergency triage desk or nearest tertiary hospital immediately.`,
      quickActions: [
        {
          label: '📞 Call Emergency Desk',
          action: () => {
            window.location.href = `tel:${clinicInfo.phoneFormatted}`;
          },
        },
        {
          label: '💬 WhatsApp Desk',
          action: () => {
            window.open(clinicInfo.whatsappUrl, '_blank');
          },
        },
      ],
    };
  }

  // 2. Strict Prescription / Medical Diagnosis Guardrail
  if (medicalDiagnosisKeywords.some((k) => query.includes(k))) {
    return {
      text: `👩‍⚕️ **Clinical Safety Notice**\n\nAs a virtual clinic assistant, I cannot prescribe medicines, suggest dosages, or diagnose clinical conditions. For safe treatment, an in-person physical consultation with our lady specialists is required.\n\nWould you like to book an appointment with our specialist?`,
      quickActions: [
        {
          label: '📅 Book In-Person Visit',
          action: () => navigate('/appointment'),
        },
        {
          label: '👩‍⚕️ View Specialists',
          action: () => navigate('/doctors'),
        },
      ],
    };
  }

  // 3. Strict Salary / Financial Guardrail
  if (salaryKeywords.some((k) => query.includes(k))) {
    return {
      text: `🔒 Doctor compensation and employee payroll details are strictly private administrative records and cannot be disclosed. For consultation fee details, please review our official Doctor Directory.`,
      quickActions: [
        {
          label: '👩‍⚕️ View Consultation Fees',
          action: () => navigate('/doctors'),
        },
      ],
    };
  }

  // 4. Appointment Booking / Booking Help
  if (
    query.includes('book') ||
    query.includes('appointment') ||
    query.includes('time') ||
    query.includes('slot') ||
    query.includes('raabta') ||
    query.includes('booking')
  ) {
    return {
      text: `🗓️ **Booking an Appointment is Easy**\n\n1. Go to the **Book Appointment** page.\n2. Select your attending Lady Doctor.\n3. Choose your clinical service (e.g. Antenatal Care, PCOS, Ultrasound).\n4. Select your preferred date and available time slot.\n5. Enter patient name & contact details to receive your official reference code (e.g. LDC-2026-XXXXXX).`,
      quickActions: [
        {
          label: '📅 Book Appointment Now',
          action: () => navigate('/appointment'),
        },
        {
          label: '🔍 Track Existing Booking',
          action: () => navigate('/lookup'),
        },
      ],
    };
  }

  // 5. Tracking / Reference Status
  if (
    query.includes('track') ||
    query.includes('status') ||
    query.includes('reference') ||
    query.includes('check') ||
    query.includes('pata karna')
  ) {
    return {
      text: `🔍 **Track Appointment Status**\n\nYou can verify your appointment anytime using your Reference Code (e.g. LDC-2026-000001) along with your registered phone or email address to verify real-time status (Pending, Confirmed, Completed, or Cancelled).`,
      quickActions: [
        {
          label: '🔍 Track Appointment Status',
          action: () => navigate('/lookup'),
        },
      ],
    };
  }

  // 6. Hospital Virtual Tour / Video
  if (
    query.includes('tour') ||
    query.includes('video') ||
    query.includes('hospital dekhna') ||
    query.includes('hospital kaisa hai') ||
    query.includes('clinic video')
  ) {
    return {
      text: `📹 **HD Virtual Hospital Tour**\n\nTake an interactive video walkthrough of our 6 clinical departments:\n1. Main Entrance & Ambulance Bay\n2. Reception & Family Waiting Lounge\n3. Lady Doctors Private Chambers\n4. 4D Ultrasound Diagnostic Room\n5. Maternity Recovery Ward & Nursery\n6. 24/7 Emergency & Pharmacy`,
      quickActions: [
        {
          label: '📹 Watch Hospital Tour',
          action: () => navigate('/tour'),
        },
      ],
    };
  }

  // 7. Posters / Clinic Updates
  if (
    query.includes('poster') ||
    query.includes('ishtihaar') ||
    query.includes('updates') ||
    query.includes('service poster')
  ) {
    return {
      text: `🖼️ **Official Clinic Healthcare Posters**\n\nWe feature 5 verified educational and clinical posters:\n1. Complete Women's Healthcare\n2. Pregnancy & Mother Care\n3. Ultrasound & Diagnostic Services\n4. Family Planning & Fertility Care\n5. Complete Clinic Services Overview`,
      quickActions: [
        {
          label: '🖼️ Explore Clinic Posters',
          action: () => navigate('/posters'),
        },
      ],
    };
  }

  // 8. Timings & Working Hours
  if (
    query.includes('timing') ||
    query.includes('hour') ||
    query.includes('open') ||
    query.includes('khula') ||
    query.includes('schedule')
  ) {
    return {
      text: `⏰ **Clinic Operating Timings**\n\n• **Monday – Friday:** 8:30 AM – 6:30 PM (Routine Consultations & Scans)\n• **Saturday:** 9:00 AM – 3:30 PM (Antenatal, Pediatric & Vaccines)\n• **Sunday:** Closed for routine OPD (Emergency on-call via phone)\n• **24/7 Maternity Emergency:** Always on-call.`,
      quickActions: [
        {
          label: '📍 Location & Contact',
          action: () => navigate('/contact'),
        },
      ],
    };
  }

  // 9. Location & Address
  if (
    query.includes('location') ||
    query.includes('address') ||
    query.includes('kahan') ||
    query.includes('map') ||
    query.includes('sadiqabad')
  ) {
    return {
      text: `📍 **Clinic Location & Directions**\n\n**Lady Doctor Clinic**\n${clinicInfo.address.full}\n(Centrally located near The Inspire Business Academy in Sadiqabad).\n\nCheck our interactive Google Map on the Contact page for driving directions!`,
      quickActions: [
        {
          label: '🗺️ View Map on Contact Page',
          action: () => navigate('/contact'),
        },
        {
          label: '💬 WhatsApp Location Pin',
          action: () => window.open(clinicInfo.whatsappUrl, '_blank'),
        },
      ],
    };
  }

  // 10. Doctors & Specialists
  if (
    query.includes('doctor') ||
    query.includes('specialist') ||
    query.includes('gynecologist') ||
    query.includes('ayesha') ||
    query.includes('fatima') ||
    query.includes('zainab')
  ) {
    return {
      text: `👩‍⚕️ **Board-Certified Lady Specialists**\n\nOur attending specialists include:\n• **Dr. Ayesha Malik:** High-Risk Pregnancy & Antenatal Care\n• **Dr. Fatima Noor:** PCOS, Hormonal & Infertility Specialist\n• **Dr. Zainab Rehman:** Pediatrics & Newborn Care\n• **Dr. Maryam Tariq:** Women's Preventive Health & Sonography\n\nAll consultations are 100% private and confidential.`,
      quickActions: [
        {
          label: '👩‍⚕️ View Doctor Directory',
          action: () => navigate('/doctors'),
        },
        {
          label: '📅 Book Consultation',
          action: () => navigate('/appointment'),
        },
      ],
    };
  }

  // Default helpful response
  return {
    text: `Hello! I am your Lady Doctor Clinic virtual receptionist. I can assist you with:\n\n• Booking consultations with lady specialists\n• Checking doctor visiting days and fees\n• Tracking your appointment status\n• Virtual hospital video walkthrough\n• Official healthcare posters\n• Clinic timings & location in Sadiqabad\n\nHow may I help you today?`,
    quickActions: [
      {
        label: '📅 Book Appointment',
        action: () => navigate('/appointment'),
      },
      {
        label: '🔍 Track Status',
        action: () => navigate('/lookup'),
      },
      {
        label: '📹 Hospital Tour',
        action: () => navigate('/tour'),
      },
      {
        label: '🖼️ 5 Clinic Posters',
        action: () => navigate('/posters'),
      },
    ],
  };
}
