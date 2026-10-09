import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useRouter, Link } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import {
  fetchDashboardStats,
  DashboardStats,
  updateAppointmentStatus,
  updateInquiryStatus,
} from '../../lib/supabase/admin';
import { AppointmentStatus, ContactInquiryStatus } from '../../types/database';
import {
  UserCheck,
  Stethoscope,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Plus,
  Image as ImageIcon,
  Star,
  DollarSign,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const { role } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load clinic statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickAppointmentStatus = async (id: string, newStatus: AppointmentStatus) => {
    setUpdatingId(id);
    try {
      const res = await updateAppointmentStatus(id, newStatus);
      if (res.success) {
        setStats((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            recentAppointments: prev.recentAppointments.map((a) =>
              a.id === id ? { ...a, status: newStatus } : a
            ),
          };
        });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleQuickInquiryStatus = async (id: string, newStatus: ContactInquiryStatus) => {
    setUpdatingId(id);
    try {
      const res = await updateInquiryStatus(id, newStatus);
      if (res.success) {
        setStats((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            recentInquiries: prev.recentInquiries.map((i) =>
              i.id === id ? { ...i, status: newStatus } : i
            ),
          };
        });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout
      title="Clinic Management Overview"
      subtitle="Real-time clinical operations, patient schedule requests, and inquiry pipeline."
    >
      {/* Top refresh & quick action bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-xs text-slate-400">
          Showing real-time data from database records.
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/doctors')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-600 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Doctors</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-950 border border-slate-800 animate-pulse h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 animate-pulse h-80" />
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 animate-pulse h-80" />
          </div>
        </div>
      )}

      {/* Error Banner */}
      {!isLoading && error && (
        <div className="p-4 mb-6 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="px-3 py-1 text-xs font-semibold bg-rose-900 rounded-lg hover:bg-rose-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      {!isLoading && stats && (
        <div className="space-y-8">
          {/* 4 Core Metric Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Appointments Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Appointments
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-800/60 text-rose-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  {stats.appointments.total}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-amber-400 font-semibold">{stats.appointments.pending} Pending</span>
                  <span>·</span>
                  <span className="text-teal-400 font-semibold">{stats.appointments.confirmed} Confirmed</span>
                </div>
              </div>
              <Link
                to="/admin/appointments"
                className="mt-4 pt-3 border-t border-slate-900 text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
              >
                <span>View All Appointments</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Inquiries Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Inquiries
                </span>
                <div className="w-8 h-8 rounded-lg bg-teal-950 border border-teal-800/60 text-teal-400 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  {stats.inquiries.total}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-rose-400 font-semibold">{stats.inquiries.new} New Unread</span>
                  <span>·</span>
                  <span className="text-teal-400 font-semibold">{stats.inquiries.resolved} Resolved</span>
                </div>
              </div>
              <Link
                to="/admin/inquiries"
                className="mt-4 pt-3 border-t border-slate-900 text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
              >
                <span>Review Inquiries</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Doctors Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Lady Doctors
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/60 text-indigo-400 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  {stats.doctors.total}
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  <span className="text-indigo-400 font-semibold">{stats.doctors.active} Active</span> in public directory
                </div>
              </div>
              <Link
                to="/admin/doctors"
                className="mt-4 pt-3 border-t border-slate-900 text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>Manage Specialists</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Services Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Services
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800/60 text-amber-400 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  {stats.services.total}
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  <span className="text-amber-400 font-semibold">{stats.services.active} Active</span> catalog offerings
                </div>
              </div>
              <Link
                to="/admin/services"
                className="mt-4 pt-3 border-t border-slate-900 text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <span>Edit Offerings</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Section 11 & 12: Recent Appointments & Recent Inquiries Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Appointments */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-rose-500" />
                    <h3 className="text-sm font-bold text-white">Recent Appointment Bookings</h3>
                  </div>
                  <Link to="/admin/appointments" className="text-xs text-rose-400 hover:text-rose-300 font-semibold">
                    View All &rarr;
                  </Link>
                </div>

                {stats.recentAppointments.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    No appointments recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/80 overflow-x-auto">
                    {stats.recentAppointments.map((apt) => (
                      <div key={apt.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{apt.patient_name}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                            <span>{apt.appointment_date}</span>
                            <span>·</span>
                            <span>{apt.appointment_time}</span>
                            <span>·</span>
                            <span>{apt.phone}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Status Badge */}
                          <select
                            value={apt.status}
                            disabled={updatingId === apt.id}
                            onChange={(e) =>
                              handleQuickAppointmentStatus(apt.id, e.target.value as AppointmentStatus)
                            }
                            className={`text-[10px] font-semibold px-2 py-1 rounded-md border cursor-pointer bg-slate-900 ${
                              apt.status === 'confirmed'
                                ? 'text-teal-300 border-teal-800'
                                : apt.status === 'completed'
                                ? 'text-blue-300 border-blue-800'
                                : apt.status === 'cancelled'
                                ? 'text-slate-400 border-slate-800'
                                : 'text-amber-300 border-amber-800'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Contact Inquiries */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-teal-400" />
                    <h3 className="text-sm font-bold text-white">Recent Inbound Messages</h3>
                  </div>
                  <Link to="/admin/inquiries" className="text-xs text-teal-400 hover:text-teal-300 font-semibold">
                    View All &rarr;
                  </Link>
                </div>

                {stats.recentInquiries.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    No inquiries recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/80 overflow-x-auto">
                    {stats.recentInquiries.map((inq) => (
                      <div key={inq.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate">{inq.name}</p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{inq.subject}</p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(inq.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="shrink-0">
                          <select
                            value={inq.status}
                            disabled={updatingId === inq.id}
                            onChange={(e) =>
                              handleQuickInquiryStatus(inq.id, e.target.value as ContactInquiryStatus)
                            }
                            className={`text-[10px] font-semibold px-2 py-1 rounded-md border cursor-pointer bg-slate-900 ${
                              inq.status === 'resolved'
                                ? 'text-teal-300 border-teal-800'
                                : inq.status === 'read'
                                ? 'text-blue-300 border-blue-800'
                                : 'text-rose-300 border-rose-800'
                            }`}
                          >
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Management Modules */}
          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Additional Clinical & Outreach Modules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/admin/posters"
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-rose-600 transition-colors flex flex-col justify-between group shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-white text-xs block">Clinic Posters</span>
                  <span className="text-[11px] text-slate-400">Manage 5 clinical awareness posters</span>
                </div>
              </Link>

              <Link
                to="/admin/reviews"
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-600 transition-colors flex flex-col justify-between group shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-400 flex items-center justify-center">
                    <Star className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-white text-xs block">Patient Reviews</span>
                  <span className="text-[11px] text-slate-400">Moderate patient ratings & testimonials</span>
                </div>
              </Link>

              {role === 'admin' && (
                <Link
                  to="/admin/salaries"
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-600 transition-colors flex flex-col justify-between group shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="mt-3">
                    <span className="font-bold text-white text-xs block">Doctor Salaries</span>
                    <span className="text-[11px] text-slate-400">Confidential payroll agreements</span>
                  </div>
                </Link>
              )}

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-600 transition-colors flex flex-col justify-between group shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 flex items-center justify-center">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-3">
                  <span className="font-bold text-white text-xs block">Live Public Website</span>
                  <span className="text-[11px] text-slate-400">View public clinic portal</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
