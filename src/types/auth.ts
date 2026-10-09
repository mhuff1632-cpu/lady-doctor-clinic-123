export type AdminRole = 'admin' | 'staff';

export interface UserProfile {
  id: string;
  email: string;
  role: AdminRole;
  full_name?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  role: AdminRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode?: boolean;
  error: string | null;
}
