import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { AdminRole } from '../../types/auth';
import { ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AdminRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Verifying Staff Authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center border border-slate-200 shadow-md">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Your current account role (<strong>{role}</strong>) does not have administrative permissions to
            modify this section. Please contact your medical director or clinic administrator.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
