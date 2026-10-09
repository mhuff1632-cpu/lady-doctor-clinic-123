export interface AppointmentFormData {
  patientName: string;
  phone: string;
  email: string;
  doctorId: string;
  serviceId: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
}

export type AppointmentFormErrors = Partial<Record<keyof AppointmentFormData, string>>;

export interface AppointmentSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export interface BookedSlotRecord {
  appointment_time: string;
  status: string;
  duration_minutes?: number;
}
