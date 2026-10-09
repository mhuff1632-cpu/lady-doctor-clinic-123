// Clinical Scheduling & Timezone Configuration for Lady Doctor Clinic
// Location: Sadiqabad, Punjab, Pakistan (Asia/Karachi UTC+5)
export const CLINIC_TIMEZONE = 'Asia/Karachi';

export interface DoctorWorkingHours {
  startHour: number; // 24-hr format (e.g. 9 for 9:00 AM)
  startMinute: number;
  endHour: number; // 24-hr format (e.g. 15 for 3:00 PM)
  endMinute: number;
  days: number[]; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  rawDays: string[];
}

// Map day string to day index (0 = Sun, 1 = Mon ... 6 = Sat)
const DAY_MAP: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
};

/**
 * Parses time string like "9:00 AM", "14:30", "2:30 PM" into { hour24, minute }
 */
export function parseTimeString(timeStr: string): { hour: number; minute: number } | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const meridiem = match[3];

  if (meridiem === 'PM' && hour < 12) {
    hour += 12;
  } else if (meridiem === 'AM' && hour === 12) {
    hour = 0;
  }

  return { hour, minute };
}

/**
 * Formats 24-hr hour & minute to 12-hr string "09:30 AM"
 */
export function formatTime12(hour24: number, minute: number): string {
  const period = hour24 >= 12 ? 'PM' : 'AM';
  let h12 = hour24 % 12;
  if (h12 === 0) h12 = 12;
  const hStr = h12.toString().padStart(2, '0');
  const mStr = minute.toString().padStart(2, '0');
  return `${hStr}:${mStr} ${period}`;
}

/**
 * Parses service duration string like "30 mins", "45 mins", "60 mins", "1 hour" into integer minutes
 */
export function parseDurationMinutes(durationStr?: string | null): number {
  if (!durationStr) return 30; // default 30 mins
  const str = durationStr.toLowerCase();
  if (str.includes('hour') || str.includes('hr')) {
    const match = str.match(/(\d+(?:\.\d+)?)/);
    if (match) return Math.round(parseFloat(match[1]) * 60);
  }
  const match = str.match(/(\d+)/);
  if (match) {
    const mins = parseInt(match[1], 10);
    return mins > 0 ? mins : 30;
  }
  return 30;
}

/**
 * Parses a doctor's availability string (e.g. "Mon, Wed, Fri (9:00 AM – 3:00 PM)")
 * or days_available array into structured working hours.
 */
export function parseDoctorAvailability(
  availabilityStr?: string | null,
  daysArray?: string[] | null
): DoctorWorkingHours {
  // Default clinic schedule if unspecified
  const defaultHours: DoctorWorkingHours = {
    startHour: 9,
    startMinute: 0,
    endHour: 17,
    endMinute: 0,
    days: [1, 2, 3, 4, 5, 6], // Mon - Sat
    rawDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  };

  if (!availabilityStr && (!daysArray || daysArray.length === 0)) {
    return defaultHours;
  }

  let days: number[] = [];
  let rawDays: string[] = [];

  if (daysArray && daysArray.length > 0) {
    rawDays = [...daysArray];
    days = daysArray
      .map((d) => DAY_MAP[d.toLowerCase().trim()])
      .filter((d) => d !== undefined);
  }

  let startHour = 9;
  let startMinute = 0;
  let endHour = 17;
  let endMinute = 0;

  if (availabilityStr) {
    // If days weren't in array, try parsing days from string e.g. "Mon, Wed, Fri"
    if (days.length === 0) {
      const parts = availabilityStr.split('(');
      const dayPart = parts[0];
      const tokens = dayPart.replace(/–|-/g, ' to ').split(/[\s,]+/);

      // Check for range like "Monday to Friday"
      if (dayPart.toLowerCase().includes('monday to friday') || dayPart.toLowerCase().includes('mon - fri')) {
        days = [1, 2, 3, 4, 5];
        rawDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      } else {
        tokens.forEach((t) => {
          const mapped = DAY_MAP[t.toLowerCase().trim()];
          if (mapped !== undefined && !days.includes(mapped)) {
            days.push(mapped);
            rawDays.push(t);
          }
        });
      }
    }

    // Try parsing time bounds e.g. "(9:00 AM – 3:00 PM)" or "(10:00 AM - 4:00 PM)"
    const timeMatch = availabilityStr.match(
      /(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*(?:–|-|to)\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i
    );
    if (timeMatch) {
      const parsedStart = parseTimeString(timeMatch[1]);
      const parsedEnd = parseTimeString(timeMatch[2]);
      if (parsedStart && parsedEnd) {
        startHour = parsedStart.hour;
        startMinute = parsedStart.minute;
        endHour = parsedEnd.hour;
        endMinute = parsedEnd.minute;
      }
    }
  }

  if (days.length === 0) {
    days = [1, 2, 3, 4, 5, 6];
  }

  return {
    startHour,
    startMinute,
    endHour,
    endMinute,
    days,
    rawDays,
  };
}

/**
 * Checks if a date string 'YYYY-MM-DD' falls on a working day for the doctor.
 */
export function isDoctorAvailableOnDate(dateStr: string, availability: DoctorWorkingHours): boolean {
  if (!dateStr) return false;
  // Parse date safely ignoring local browser timezone skew
  const [year, month, day] = dateStr.split('-').map((v) => parseInt(v, 10));
  if (!year || !month || !day) return false;
  // Note: month is 0-indexed in JS Date
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay();
  return availability.days.includes(dayOfWeek);
}

/**
 * Converts a 12-hr time string "10:00 AM" to total minutes from midnight (600)
 */
export function timeStringToMinutes(timeStr: string): number {
  const parsed = parseTimeString(timeStr);
  if (!parsed) return 0;
  return parsed.hour * 60 + parsed.minute;
}

/**
 * Returns current date in YYYY-MM-DD format according to Clinic Timezone
 */
export function getClinicTodayDateString(): string {
  // Use Intl.DateTimeFormat to reliably determine date in Asia/Karachi
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date()); // Outputs YYYY-MM-DD
}

/**
 * Returns current minutes from midnight in Clinic Timezone
 */
export function getClinicCurrentMinutes(): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: CLINIC_TIMEZONE,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  let h = 0;
  let m = 0;
  for (const part of parts) {
    if (part.type === 'hour') h = parseInt(part.value, 10);
    if (part.type === 'minute') m = parseInt(part.value, 10);
  }
  return h * 60 + m;
}

/**
 * Generates valid slot candidates for a doctor on a specific date,
 * filtering out past times (if date is today), out-of-availability slots,
 * and already occupied/conflicting slots.
 */
export function generateAvailableSlots(params: {
  selectedDate: string;
  availability: DoctorWorkingHours;
  serviceDurationMins: number;
  existingBookings: Array<{
    time: string;
    durationMins?: number;
    status: string;
  }>;
}): {
  allSlots: Array<{ time: string; available: boolean; reason?: string }>;
  hasAvailableSlots: boolean;
} {
  const { selectedDate, availability, serviceDurationMins, existingBookings } = params;
  const result: Array<{ time: string; available: boolean; reason?: string }> = [];

  const startTotalMinutes = availability.startHour * 60 + availability.startMinute;
  const endTotalMinutes = availability.endHour * 60 + availability.endMinute;
  const slotIntervalMins = Math.min(30, serviceDurationMins); // Step every 30 mins or service duration

  const clinicToday = getClinicTodayDateString();
  const isToday = selectedDate === clinicToday;
  const clinicNowMinutes = getClinicCurrentMinutes();

  // Active bookings that block slots (pending and confirmed block slots; cancelled and completed do not)
  const blockingBookings = existingBookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed'
  );

  for (let m = startTotalMinutes; m + serviceDurationMins <= endTotalMinutes; m += slotIntervalMins) {
    const slotHour = Math.floor(m / 60);
    const slotMinute = m % 60;
    const timeFormatted = formatTime12(slotHour, slotMinute);
    const slotStartMin = m;
    const slotEndMin = m + serviceDurationMins;

    // Check if slot is already in the past (if today)
    if (isToday && slotStartMin <= clinicNowMinutes + 15) {
      // Slot has passed or starts within 15 mins
      result.push({
        time: timeFormatted,
        available: false,
        reason: 'Time passed',
      });
      continue;
    }

    // Check conflict with existing bookings
    // A booking overlaps if: max(slotStart, bookingStart) < min(slotEnd, bookingEnd)
    let isConflicting = false;
    for (const booking of blockingBookings) {
      const bookingStartMin = timeStringToMinutes(booking.time);
      const bDuration = booking.durationMins || 30;
      const bookingEndMin = bookingStartMin + bDuration;

      if (Math.max(slotStartMin, bookingStartMin) < Math.min(slotEndMin, bookingEndMin)) {
        isConflicting = true;
        break;
      }
    }

    if (isConflicting) {
      result.push({
        time: timeFormatted,
        available: false,
        reason: 'Already booked',
      });
    } else {
      result.push({
        time: timeFormatted,
        available: true,
      });
    }
  }

  const hasAvailableSlots = result.some((s) => s.available);
  return { allSlots: result, hasAvailableSlots };
}

/**
 * Generates an appointment reference code (e.g. LDC-2026-004812)
 */
export function generateAppointmentReference(uuid?: string): string {
  const year = new Date().getFullYear();
  if (uuid) {
    // Extract last 6 chars from UUID hex converted to uppercase
    const suffix = uuid.replace(/-/g, '').slice(-6).toUpperCase();
    return `LDC-${year}-${suffix}`;
  }
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `LDC-${year}-${randomSuffix}`;
}
