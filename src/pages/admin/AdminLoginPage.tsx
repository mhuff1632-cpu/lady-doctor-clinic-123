import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowLeft, ShieldCheck, Heart } from 'lucide-react';
import { ClinicLogo } from '../../components/ui/ClinicLogo';

export const AdminLoginPage: React.FC = () => {
  const { navigate } = useRouter();
  const { isAuthenticated, login, isLoading, error: authContextError, isDemoMode } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setLoginError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setValidationError('Please enter your staff email address.');
      return;
    }

    if (!password) {
      setValidationError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(cleanEmail, password);
      if (res.success) {
        navigate('/admin');
      } else {
        setLoginError(res.error || 'Invalid email or password. Please verify your credentials and try again.');
      }
    } catch {
      setLoginError('An unexpected network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@ladydoctorclinic.com');
    setPassword('Admin@2026');
    setValidationError(null);
  };

  const handleFillDemoStaff = () => {
    setEmail('staff@ladydoctorclinic.com');
    setPassword('staff123');
    setValidationError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top back shortcut */}
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Public Website</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link to="/" className="inline-block hover:opacity-95 transition-opacity mb-2">
            <ClinicLogo variant="light" size="lg" />
          </Link>
          <p className="text-xs text-rose-400 font-mono tracking-wider uppercase">
            Staff & Clinical Portal Access
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900/90 backdrop-blur-md p-8 rounded-3xl border border-slate-800 shadow-2xl">
          {/* Error Banner */}
          {(validationError || loginError || authContextError) && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs leading-relaxed animate-in fade-in duration-150">
              {validationError || loginError || authContextError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled={isSubmitting}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ladydoctorclinic.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-rose-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  disabled={isSubmitting}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-rose-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-rose-700 hover:bg-rose-600 active:bg-rose-800 transition-colors shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In to Clinical Portal</span>
              )}
            </button>
          </form>

          {/* Quick Development Demo Credentials Helper */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <p className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Quick Test Credentials:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={handleFillDemoAdmin}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left cursor-pointer transition-colors"
              >
                <div className="font-semibold text-rose-300 text-[11px]">Administrator</div>
                <div className="text-[10px] text-slate-400 truncate">admin@ladydoctorclinic.com</div>
              </button>
              <button
                type="button"
                onClick={handleFillDemoStaff}
                className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left cursor-pointer transition-colors"
              >
                <div className="font-semibold text-teal-300 text-[11px]">Staff Reception</div>
                <div className="text-[10px] text-slate-400 truncate">staff@ladydoctorclinic.com</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-500" />
          <span>Encrypted Session · Role-Based Medical Access Protection</span>
        </div>
      </div>
    </div>
  );
};
