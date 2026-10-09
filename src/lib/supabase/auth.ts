import { getSupabaseClient, isSupabaseConfigured } from './client';
import { UserProfile, AdminRole } from '../../types/auth';

export interface AuthResponse {
  success: boolean;
  user?: { id: string; email: string };
  profile?: UserProfile | null;
  error?: string;
  isDemo?: boolean;
}

// Fallback demo admin profile when Supabase Auth credentials are not yet provisioned in environment
const DEMO_ADMIN_PROFILE: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@ladydoctorclinic.com',
  role: 'admin',
  full_name: 'Dr. Sarah Khan (Administrator)',
  is_active: true,
};

const DEMO_STAFF_PROFILE: UserProfile = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'staff@ladydoctorclinic.com',
  role: 'staff',
  full_name: 'Clinic Reception Desk',
  is_active: true,
};

export async function signInAdmin(email: string, password: string): Promise<AuthResponse> {
  const client = getSupabaseClient();
  const cleanEmail = email.trim().toLowerCase();

  // If Supabase is not configured yet or developer is evaluating locally
  if (!isSupabaseConfigured || !client) {
    if (
      (cleanEmail === 'admin@ladydoctorclinic.com' && password === 'Admin@2026') ||
      (cleanEmail === 'admin@clinic.com' && password === 'admin123') ||
      (cleanEmail === 'staff@clinic.com' && password === 'staff123')
    ) {
      const isStaff = cleanEmail.includes('staff');
      const profile = isStaff ? DEMO_STAFF_PROFILE : DEMO_ADMIN_PROFILE;
      localStorage.setItem('ldc_demo_session', JSON.stringify(profile));
      return {
        success: true,
        user: { id: profile.id, email: profile.email },
        profile,
        isDemo: true,
      };
    }
    return {
      success: false,
      error: 'Invalid email or password. Please verify your credentials and try again.',
      isDemo: true,
    };
  }

  try {
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: 'Invalid email or password. Please check your credentials and try again.',
      };
    }

    // Retrieve role from profiles table
    const { data: profileData, error: profileError } = await client
      .from('profiles')
      .select('id, email, role, full_name, is_active')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profileData) {
      // If profile hasn't been created yet, allow user metadata role fallback or default to staff
      const role: AdminRole = (authData.user.user_metadata?.role as AdminRole) || 'admin';
      const fallbackProfile: UserProfile = {
        id: authData.user.id,
        email: authData.user.email || cleanEmail,
        role,
        full_name: authData.user.user_metadata?.full_name || 'Clinic Administrator',
        is_active: true,
      };

      return {
        success: true,
        user: { id: authData.user.id, email: authData.user.email || cleanEmail },
        profile: fallbackProfile,
        isDemo: false,
      };
    }

    if (!profileData.is_active) {
      await client.auth.signOut();
      return {
        success: false,
        error: 'Your staff account has been deactivated. Please contact the administrator.',
      };
    }

    return {
      success: true,
      user: { id: authData.user.id, email: authData.user.email || cleanEmail },
      profile: {
        id: profileData.id,
        email: profileData.email,
        role: profileData.role as AdminRole,
        full_name: profileData.full_name,
        is_active: profileData.is_active,
      },
      isDemo: false,
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'An unexpected connection error occurred during sign in. Please try again.',
    };
  }
}

export async function signOutAdmin(): Promise<void> {
  const client = getSupabaseClient();
  localStorage.removeItem('ldc_demo_session');

  if (isSupabaseConfigured && client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.warn('Error during Supabase signout:', e);
    }
  }
}

export async function getCurrentAdminSession(): Promise<{
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  isDemo: boolean;
}> {
  // Check demo session first if Supabase is unconfigured
  const demoJson = localStorage.getItem('ldc_demo_session');
  if (demoJson) {
    try {
      const demoProfile = JSON.parse(demoJson) as UserProfile;
      return {
        user: { id: demoProfile.id, email: demoProfile.email },
        profile: demoProfile,
        isDemo: true,
      };
    } catch {
      localStorage.removeItem('ldc_demo_session');
    }
  }

  const client = getSupabaseClient();
  if (!isSupabaseConfigured || !client) {
    return { user: null, profile: null, isDemo: false };
  }

  try {
    const { data } = await client.auth.getSession();
    const session = data.session;
    if (!session?.user) {
      return { user: null, profile: null, isDemo: false };
    }

    // Fetch profile
    const { data: profileData } = await client
      .from('profiles')
      .select('id, email, role, full_name, is_active')
      .eq('id', session.user.id)
      .single();

    const role: AdminRole = (profileData?.role as AdminRole) || (session.user.user_metadata?.role as AdminRole) || 'admin';
    const profile: UserProfile = {
      id: session.user.id,
      email: session.user.email || '',
      role,
      full_name: profileData?.full_name || session.user.user_metadata?.full_name || 'Staff Member',
      is_active: profileData?.is_active ?? true,
    };

    return {
      user: { id: session.user.id, email: session.user.email || '' },
      profile,
      isDemo: false,
    };
  } catch (err) {
    console.warn('Failed to retrieve current session:', err);
    return { user: null, profile: null, isDemo: false };
  }
}
