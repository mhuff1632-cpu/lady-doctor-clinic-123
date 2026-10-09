import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  fetchAdminAppointments,
  updateAppointmentStatus,
  AdminAppointmentItem,
} from '../../lib/supabase/admin';
import {
  logCommunicationDispatch,
  fetchAppointmentCommunicationLogs,
} from '../../lib/supabase/communication';
import { CommunicationLogEntry } from '../../types/communication';
import { fetchActiveDoctors } from '../../lib/supabase/doctors';
import { fetchActiveServices } from '../../lib/supabase/services';
import { Doctor } from '../../types/doctor';
import { Service } from '../../types/service';
import { AppointmentStatus } from '../../types/database';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  User,
  Loader2,
  RefreshCw,
  Eye,
  X,
  FileText,
  Stethoscope,
  Tag,
  Hash,
  MessageSquare,
  Send,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const AdminAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AdminAppointmentItem[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Detail Modal state
  const [selectedApt, setSelectedApt] = useState<AdminAppointmentItem | null>(null);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Patient Communication Log state
  const [commLogs, setCommLogs] = useState<CommunicationLogEntry[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteChannel, setNewNoteChannel] = useState<'Phone Call' | 'WhatsApp' | 'SMS' | 'In-Person'>('Phone Call');
  const [isLoggingComm, setIsLoggingComm] = useState(false);

  // Load communication history whenever an appointment is inspected
  useEffect(() => {
    if (selectedApt) {
      fetchAppointmentCommunicationLogs(selectedApt.id).then(setCommLogs);
    } else {
      setCommLogs([]);
      setNewNoteContent('');
    }
  }, [selectedApt?.id]);

  const handleLogCommunication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApt || !newNoteContent.trim()) return;
    setIsLoggingComm(true);
    try {
      await logCommunicationDispatch({
        appointmentId: selectedApt.id,
        reference: selectedApt.reference || `REF-${selectedApt.id.slice(0, 6)}`,
        patientName: selectedApt.patient_name,
        recipientContact: selectedApt.phone || selectedApt.email,
        type: 'manual_message',
        channel: newNoteChannel,
        subject: `Staff Record (${newNoteChannel})`,
        content: newNoteContent.trim(),
        sentBy: 'Clinic Reception Desk',
      });
      setNewNoteContent('');
      const refreshed = await fetchAppointmentCommunicationLogs(selectedApt.id);
      setCommLogs(refreshed);
      setToastMessage({ text: 'Patient communication note added to audit log.', type: 'success' });
    } catch {
      setToastMessage({ text: 'Failed to record communication note.', type: 'error' });
    } finally {
      setIsLoggingComm(false);
    }
  };

  const getWhatsAppLink = (apt: AdminAppointmentItem) => {
    const rawPhone = apt.phone.replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.startsWith('0') ? `92${rawPhone.slice(1)}` : rawPhone.startsWith('92') ? rawPhone : `92${rawPhone}`;
    let template = '';
    if (apt.status === 'confirmed') {
      template = `Assalam-o-Alaikum ${apt.patient_name}, your appointment with ${apt.doctor_name || 'our Lady Specialist'} at Lady Doctor Clinic on ${apt.appointment_date} at ${apt.appointment_time} (Ref: ${apt.reference || apt.id}) is CONFIRMED. Please arrive 10-15 minutes prior for vitals check. Near Inspire Business Academy, Sadiqabad.`;
    } else if (apt.status === 'cancelled') {
      template = `Assalam-o-Alaikum ${apt.patient_name}, regarding your appointment request (Ref: ${apt.reference || apt.id}) at Lady Doctor Clinic, this booking has been cancelled. Please reply if you need rescheduling assistance.`;
    } else {
      template = `Assalam-o-Alaikum ${apt.patient_name}, this is Lady Doctor Clinic regarding your appointment request (Ref: ${apt.reference || apt.id}) for ${apt.service_name || 'Consultation'} on ${apt.appointment_date} at ${apt.appointment_time}. Our team is reviewing specialist availability.`;
    }
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(template)}`;
  };

  // Load doctors and services for dropdown filters
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [docsRes, srvsRes] = await Promise.all([
          fetchActiveDoctors(),
          fetchActiveServices(),
        ]);
        if (docsRes.data) setDoctors(docsRes.data);
        if (srvsRes.data) setServices(srvsRes.data);
      } catch (e) {
        console.warn('Could not load filter metadata:', e);
      }
    };
    loadMetadata();
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminAppointments(statusFilter, searchQuery);
      setAppointments(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load appointments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  const executeStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    setUpdatingId(id);
    try {
      const res = await updateAppointmentStatus(id, newStatus);
      if (res.success) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );
        if (selectedApt && selectedApt.id === id) {
          setSelectedApt((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        setToastMessage({
          text: `Appointment updated to "${newStatus}".`,
          type: 'success',
        });

        // Record audited communication entry for this status transition
        const targetApt = appointments.find((a) => a.id === id) || selectedApt;
        if (targetApt) {
          logCommunicationDispatch({
            appointmentId: id,
            reference: targetApt.reference || `REF-${id.slice(0, 6).toUpperCase()}`,
            patientName: targetApt.patient_name,
            recipientContact: targetApt.phone || targetApt.email,
            type: 'status_update',
            channel: 'In-App Portal',
            subject: `Status changed to ${newStatus}`,
            content: `Clinical status transitioned to ${newStatus}.`,
            sentBy: 'Staff Portal',
          }).then(() => {
            if (selectedApt && selectedApt.id === id) {
              fetchAppointmentCommunicationLogs(id).then(setCommLogs);
            }
          }).catch(() => {});
        }
      } else {
        setToastMessage({
          text: res.error || 'Failed to update appointment status.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setToastMessage({
        text: err?.message || 'Error occurred while updating status.',
        type: 'error',
      });
    } finally {
      setUpdatingId(null);
      setPendingCancelId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    if (newStatus === 'cancelled') {
      setPendingCancelId(id);
      return;
    }
    await executeStatusChange(id, newStatus);
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      // 1. Search Query (Name, Phone, Email, Reference)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = a.patient_name.toLowerCase().includes(q);
        const matchesPhone = a.phone.toLowerCase().includes(q);
        const matchesEmail = a.email.toLowerCase().includes(q);
        const matchesRef = a.reference?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesPhone && !matchesEmail && !matchesRef) {
          return false;
        }
      }

      // 2. Doctor Filter
      if (doctorFilter !== 'all') {
        if (a.doctor_id !== doctorFilter) return false;
      }

      // 3. Service Filter
      if (serviceFilter !== 'all') {
        if (a.service_id !== serviceFilter) return false;
      }

      // 4. Date Filter
      if (dateFilter) {
        if (a.appointment_date !== dateFilter) return false;
      }

      return true;
    });
  }, [appointments, searchQuery, doctorFilter, serviceFilter, dateFilter]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDoctorFilter('all');
    setServiceFilter('all');
    setDateFilter('');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    doctorFilter !== 'all' ||
    serviceFilter !== 'all' ||
    dateFilter !== '';

  return (
    <AdminLayout
      title="Appointment Bookings"
      subtitle="Confidential management of patient visit requests, schedules, and clinical statuses."
    >
      {/* Controls Bar */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 mb-6 space-y-4">
        {/* Row 1: Search & Status */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, phone, email, ref..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}

            <button
              type="button"
              onClick={loadAppointments}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Filters (Doctor, Service, Date) */}
        <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center gap-3 text-xs">
          {/* Doctor Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] uppercase font-semibold">Doctor:</span>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Specialists</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Service Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] uppercase font-semibold">Service:</span>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Services</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] uppercase font-semibold">Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none cursor-pointer"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="text-slate-500 hover:text-slate-300 p-1"
                title="Clear date"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="ml-auto text-[11px] text-slate-400 font-mono">
            Showing <strong className="text-white">{filteredAppointments.length}</strong> of{' '}
            {appointments.length} records
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 text-rose-500 animate-spin" />
          <span className="text-xs">Loading Secure Appointments...</span>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs mb-6 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={loadAppointments} className="underline text-xs">
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No appointments found matching current criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Reference & Patient</th>
                    <th className="py-3.5 px-4 font-semibold">Scheduled Window</th>
                    <th className="py-3.5 px-4 font-semibold">Specialist & Service</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {filteredAppointments.map((apt) => {
                    return (
                      <tr key={apt.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/60">
                              {apt.reference || `REF-${apt.id.slice(0, 6).toUpperCase()}`}
                            </span>
                            <span className="font-bold text-white text-xs">{apt.patient_name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-500" />
                              {apt.phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-500" />
                              {apt.email}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <div className="text-white font-medium">{apt.appointment_date}</div>
                          <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{apt.appointment_time}</span>
                            {apt.duration && (
                              <span className="text-[10px] text-slate-500">({apt.duration})</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-rose-300 font-semibold">{apt.doctor_name || 'Assigned Lady Doctor'}</div>
                          <div className="text-[11px] text-slate-400">{apt.service_name || 'General Consultation'}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={apt.status}
                            disabled={updatingId === apt.id}
                            onChange={(e) =>
                              handleStatusChange(apt.id, e.target.value as AppointmentStatus)
                            }
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer bg-slate-900 transition-colors ${
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
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedApt(apt)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-slate-400" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-150 text-xs">
            <button
              type="button"
              onClick={() => setSelectedApt(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between mb-4 pr-8">
              <div className="flex items-center gap-2 text-rose-400">
                <Calendar className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Patient Appointment Record</h3>
              </div>
              <span className="font-mono text-xs font-bold text-teal-400 bg-teal-950 px-2.5 py-1 rounded-md border border-teal-800">
                {selectedApt.reference || `REF-${selectedApt.id.slice(0, 6).toUpperCase()}`}
              </span>
            </div>

            {/* Direct Patient Outreach Action Bar */}
            <div className="mb-4 p-3 bg-slate-900 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-slate-300">
                <MessageSquare className="w-4 h-4 text-rose-400" />
                <span className="font-semibold text-white">Direct Patient Outreach:</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={getWhatsAppLink(selectedApt)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 rounded-xl transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Message</span>
                  <ExternalLink className="w-3 h-3 text-emerald-400 opacity-70" />
                </a>
                <a
                  href={`tel:${selectedApt.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-300 bg-teal-950 hover:bg-teal-900 border border-teal-800 rounded-xl transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call ({selectedApt.phone})</span>
                </a>
                {selectedApt.email && (
                  <a
                    href={`mailto:${selectedApt.email}?subject=${encodeURIComponent(`Lady Doctor Clinic Appointment: ${selectedApt.reference || selectedApt.id}`)}&body=${encodeURIComponent(`Dear ${selectedApt.patient_name},\n\nThis is regarding your appointment at Lady Doctor Clinic scheduled for ${selectedApt.appointment_date} at ${selectedApt.appointment_time}.\n\nReference: ${selectedApt.reference || selectedApt.id}\nSpecialist: ${selectedApt.doctor_name || 'Lady Specialist'}\nStatus: ${selectedApt.status.toUpperCase()}\n\nPlease contact us if you need any assistance.\n\nWarm regards,\nLady Doctor Clinic\nPhone: +92 300 1234567`)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-300 bg-blue-950 hover:bg-blue-900 border border-blue-800 rounded-xl transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Email</span>
                  </a>
                )}
              </div>
            </div>

            {/* Core Appointment & Patient Profile */}
            <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-850">
              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block">Patient Name</span>
                  <span className="font-bold text-white text-sm">{selectedApt.patient_name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block">Phone</span>
                  <a href={`tel:${selectedApt.phone}`} className="font-mono text-teal-400 hover:underline">
                    {selectedApt.phone}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block">Email</span>
                  <a href={`mailto:${selectedApt.email}`} className="text-slate-300 hover:underline truncate block">
                    {selectedApt.email}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block">Scheduled Window</span>
                  <span className="font-mono text-white">
                    {selectedApt.appointment_date} at {selectedApt.appointment_time}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block">Assigned Doctor</span>
                  <span className="font-semibold text-rose-300">
                    {selectedApt.doctor_name || 'Any Available Specialist'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block">Clinical Service</span>
                  <span className="text-slate-300">
                    {selectedApt.service_name || 'General Consultation'}
                    {selectedApt.duration && ` (${selectedApt.duration})`}
                  </span>
                </div>
              </div>

              {selectedApt.message && (
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block mb-1">
                    Confidential Patient Message
                  </span>
                  <p className="p-3 rounded-xl bg-slate-950 text-slate-300 italic leading-relaxed">
                    "{selectedApt.message}"
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>UUID: {selectedApt.id}</span>
                <span>Created: {new Date(selectedApt.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Patient Communication History & Staff Notes Section */}
            <div className="mt-4 pt-4 border-t border-slate-850 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>Communication History & Staff Notes</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {commLogs.length} logged record{commLogs.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* History list */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {commLogs.length === 0 ? (
                  <p className="p-3 rounded-xl bg-slate-900 text-slate-500 text-xs italic text-center">
                    No communication events recorded yet for this appointment.
                  </p>
                ) : (
                  commLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                            {log.channel}
                          </span>
                          <span>{log.subject}</span>
                        </span>
                        <span className="text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {log.content}
                      </p>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>By: {log.sentBy}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Form to append communication note */}
              <form onSubmit={handleLogCommunication} className="pt-2 flex flex-col sm:flex-row gap-2">
                <select
                  value={newNoteChannel}
                  onChange={(e) => setNewNoteChannel(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="Phone Call">Phone Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="SMS">SMS</option>
                  <option value="In-Person">In-Person</option>
                </select>
                <input
                  type="text"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Record patient communication notes or instructions..."
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <button
                  type="submit"
                  disabled={isLoggingComm || !newNoteContent.trim()}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-600 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors cursor-pointer text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log Note</span>
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Current Status:</span>
                <select
                  value={selectedApt.status}
                  onChange={(e) =>
                    handleStatusChange(selectedApt.id, e.target.value as AppointmentStatus)
                  }
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApt(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Cancellation */}
      {pendingCancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-white">Confirm Appointment Cancellation</h3>
            <p className="text-xs text-slate-400 text-center mt-2 leading-relaxed">
              Are you sure you want to cancel this appointment request? Cancelling this appointment will release this time slot for other patients.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPendingCancelId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={() => executeStatusChange(pendingCancelId, 'cancelled')}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border text-xs font-semibold shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-teal-950 border-teal-800 text-teal-200'
              : 'bg-rose-950 border-rose-800 text-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </AdminLayout>
  );
};
