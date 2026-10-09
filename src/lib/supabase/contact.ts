import { getSupabaseClient, isSupabaseConfigured } from './client';
import { localFallbackInquiries } from './admin';

export interface ContactInquiryPayload {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface SubmitContactResult {
  success: boolean;
  inquiryId?: string;
  error?: string;
  isLive: boolean;
}

export async function submitContactInquiry(
  payload: ContactInquiryPayload
): Promise<SubmitContactResult> {
  const client = getSupabaseClient();

  // If Supabase is not configured yet, stage locally so form submission and admin inquiries work gracefully
  if (!isSupabaseConfigured || !client) {
    const stagedId = `inq-${Date.now().toString(36).toUpperCase()}`;
    const newInquiry = {
      id: stagedId,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      subject: payload.subject.trim(),
      message: payload.message.trim(),
      status: 'new' as const,
      created_at: new Date().toISOString(),
    };

    localFallbackInquiries.unshift(newInquiry);

    return {
      success: true,
      inquiryId: stagedId,
      isLive: false,
    };
  }

  try {
    const record = {
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      subject: payload.subject.trim(),
      message: payload.message.trim(),
      status: 'new' as const,
    };

    const { data, error } = await client
      .from('contact_inquiries')
      .insert([record])
      .select('id')
      .single();

    if (error) {
      console.error('Supabase contact submission error:', error);
      return {
        success: false,
        error: error.message || 'Unable to record your message. Please reach us directly via telephone.',
        isLive: true,
      };
    }

    return {
      success: true,
      inquiryId: data?.id,
      isLive: true,
    };
  } catch (err: any) {
    console.error('Unexpected error submitting inquiry:', err);
    return {
      success: false,
      error: err?.message || 'A network error occurred while sending your inquiry.',
      isLive: true,
    };
  }
}
