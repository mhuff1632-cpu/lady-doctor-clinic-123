/**
 * Supabase Database Schema Definitions (Phase 3: Auth & Admin)
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type ContactInquiryStatus = 'new' | 'read' | 'resolved';
export type AdminRole = 'admin' | 'staff';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: AdminRole;
          full_name: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: AdminRole;
          full_name?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: AdminRole;
          full_name?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      doctors: {
        Row: {
          id: string;
          name: string;
          qualification: string;
          specialization: string;
          department: string;
          experience: string;
          bio: string;
          image_url: string | null;
          consultation_fee: string;
          availability: string;
          days_available: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          qualification: string;
          specialization: string;
          department: string;
          experience: string;
          bio: string;
          image_url?: string | null;
          consultation_fee: string;
          availability: string;
          days_available?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          qualification?: string;
          specialization?: string;
          department?: string;
          experience?: string;
          bio?: string;
          image_url?: string | null;
          consultation_fee?: string;
          availability?: string;
          days_available?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          name: string;
          category: string;
          description: string;
          icon: string;
          image_url: string | null;
          duration: string;
          features: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          description: string;
          icon?: string;
          image_url?: string | null;
          duration?: string;
          features?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          description?: string;
          icon?: string;
          image_url?: string | null;
          duration?: string;
          features?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          patient_name: string;
          phone: string;
          email: string;
          doctor_id: string | null;
          service_id: string | null;
          appointment_date: string;
          appointment_time: string;
          message: string | null;
          status: AppointmentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_name: string;
          phone: string;
          email: string;
          doctor_id?: string | null;
          service_id?: string | null;
          appointment_date: string;
          appointment_time: string;
          message?: string | null;
          status?: AppointmentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_name?: string;
          phone?: string;
          email?: string;
          doctor_id?: string | null;
          service_id?: string | null;
          appointment_date?: string;
          appointment_time?: string;
          message?: string | null;
          status?: AppointmentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'appointments_doctor_id_fkey';
            columns: ['doctor_id'];
            isOneToOne: false;
            referencedRelation: 'doctors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'appointments_service_id_fkey';
            columns: ['service_id'];
            isOneToOne: false;
            referencedRelation: 'services';
            referencedColumns: ['id'];
          }
        ];
      };
      contact_inquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          subject: string;
          message: string;
          status: ContactInquiryStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          subject: string;
          message: string;
          status?: ContactInquiryStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          subject?: string;
          message?: string;
          status?: ContactInquiryStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      posters: {
        Row: {
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
        };
        Insert: {
          id?: string;
          title: string;
          theme: string;
          description: string;
          image_url: string;
          display_order: number;
          is_active?: boolean;
          highlights?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          theme?: string;
          description?: string;
          image_url?: string;
          display_order?: number;
          is_active?: boolean;
          highlights?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      patient_reviews: {
        Row: {
          id: string;
          doctor_id: string;
          doctor_name: string;
          patient_name: string;
          rating: number;
          review_text: string;
          status: 'pending' | 'approved' | 'rejected' | 'hidden';
          appointment_ref?: string;
          admin_note?: string;
          created_at: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          doctor_name: string;
          patient_name: string;
          rating: number;
          review_text: string;
          status?: 'pending' | 'approved' | 'rejected' | 'hidden';
          appointment_ref?: string;
          admin_note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          doctor_name?: string;
          patient_name?: string;
          rating?: number;
          review_text?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'hidden';
          appointment_ref?: string;
          admin_note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      doctor_salaries: {
        Row: {
          id: string;
          doctor_id: string;
          doctor_name: string;
          amount: number;
          contract_type: 'monthly' | 'weekly' | 'per_consultation' | 'other';
          effective_date: string;
          notes?: string;
          created_at: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          doctor_name: string;
          amount: number;
          contract_type: 'monthly' | 'weekly' | 'per_consultation' | 'other';
          effective_date: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          doctor_name?: string;
          amount?: number;
          contract_type?: 'monthly' | 'weekly' | 'per_consultation' | 'other';
          effective_date?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_booked_slots: {
        Args: {
          p_doctor_id: string;
          p_date: string;
        };
        Returns: Array<{
          appointment_time: string;
          status: string;
        }>;
      };
      book_appointment_atomic: {
        Args: {
          p_patient_name: string;
          p_phone: string;
          p_email: string;
          p_doctor_id: string | null;
          p_service_id: string | null;
          p_appointment_date: string;
          p_appointment_time: string;
          p_message?: string | null;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
