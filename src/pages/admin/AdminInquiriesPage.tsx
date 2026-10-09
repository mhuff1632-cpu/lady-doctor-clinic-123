import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  fetchAdminInquiries,
  updateInquiryStatus,
  AdminInquiryItem,
} from '../../lib/supabase/admin';
import { ContactInquiryStatus } from '../../types/database';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Loader2,
  RefreshCw,
  Eye,
  X,
  Send,
  MessageCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const AdminInquiriesPage: React.FC = () => {
  const [inquiries, setInquiries] = useState<AdminInquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Detail Modal state
  const [selectedInquiry, setSelectedInquiry] = useState<AdminInquiryItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadInquiries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminInquiries(statusFilter, searchQuery);
      setInquiries(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load inquiries.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [statusFilter]);

  const handleStatusChange = async (id: string, newStatus: ContactInquiryStatus) => {
    setUpdatingId(id);
    try {
      const res = await updateInquiryStatus(id, newStatus);
      if (res.success) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
        );
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        setToastMessage({
          text: `Inquiry status changed to "${newStatus}".`,
          type: 'success',
        });
      } else {
        setToastMessage({
          text: res.error || 'Failed to update message status.',
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
    }
  };

  const handleOpenDetail = (inq: AdminInquiryItem) => {
    setSelectedInquiry(inq);
    // Automatically mark as read if it was new
    if (inq.status === 'new') {
      handleStatusChange(inq.id, 'read');
    }
  };

  const filteredInquiries = useMemo(() => {
    if (!searchQuery.trim()) return inquiries;
    const q = searchQuery.toLowerCase();
    return inquiries.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.subject.toLowerCase().includes(q) ||
        i.phone.toLowerCase().includes(q)
    );
  }, [inquiries, searchQuery]);

  return (
    <AdminLayout
      title="Patient Contact Inquiries"
      subtitle="Inbound message triage, patient clinical questions, and reception inquiries."
    >
      {/* Controls Bar */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, subject..."
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
              <option value="new">New (Unread)</option>
              <option value="read">Read</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={loadInquiries}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Messages</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 text-rose-500 animate-spin" />
          <span className="text-xs">Loading Patient Inquiries...</span>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs mb-6 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={loadInquiries} className="underline text-xs">
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
          {filteredInquiries.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No inquiries found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Sender Details</th>
                    <th className="py-3.5 px-4 font-semibold">Subject & Preview</th>
                    <th className="py-3.5 px-4 font-semibold">Date Received</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {filteredInquiries.map((inq) => {
                    return (
                      <tr key={inq.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-xs">{inq.name}</div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                            <span>{inq.phone}</span>
                            <span>·</span>
                            <span>{inq.email}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="font-semibold text-slate-200 truncate">{inq.subject}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {inq.message}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                          {new Date(inq.created_at).toLocaleDateString()}
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={inq.status}
                            disabled={updatingId === inq.id}
                            onChange={(e) =>
                              handleStatusChange(inq.id, e.target.value as ContactInquiryStatus)
                            }
                            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer bg-slate-900 transition-colors ${
                              inq.status === 'resolved'
                                ? 'text-teal-300 border-teal-800'
                                : inq.status === 'read'
                                ? 'text-blue-300 border-blue-800'
                                : 'text-rose-300 border-rose-800'
                            }`}
                          >
                            <option value="new">New (Unread)</option>
                            <option value="read">Read</option>
                            <option value="resolved">Resolved</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(inq)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-slate-400" />
                            <span>Read Message</span>
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

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-150 text-xs">
            <button
              type="button"
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-teal-400">
              <MessageSquare className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Patient Inquiry Message</h3>
            </div>

            <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-850">
              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block">Sender</span>
                  <span className="font-bold text-white text-sm">{selectedInquiry.name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block">Phone</span>
                  <a href={`tel:${selectedInquiry.phone}`} className="font-mono text-teal-400 hover:underline">
                    {selectedInquiry.phone}
                  </a>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase text-slate-500 font-semibold block">Email</span>
                  <a href={`mailto:${selectedInquiry.email}`} className="text-slate-300 hover:underline">
                    {selectedInquiry.email}
                  </a>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 font-semibold block mb-1">
                  Subject
                </span>
                <p className="font-semibold text-white text-sm mb-2">{selectedInquiry.subject}</p>
                <span className="text-[10px] uppercase text-slate-500 font-semibold block mb-1">
                  Message Content
                </span>
                <div className="p-3.5 rounded-xl bg-slate-950 text-slate-200 leading-relaxed whitespace-pre-wrap border border-slate-850">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Inquiry ID: {selectedInquiry.id}</span>
                <span>Received: {new Date(selectedInquiry.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Mark Status:</span>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) =>
                    handleStatusChange(selectedInquiry.id, e.target.value as ContactInquiryStatus)
                  }
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold cursor-pointer"
                >
                  <option value="new">New (Unread)</option>
                  <option value="read">Read</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(() => {
                  const rawPhone = (selectedInquiry.phone || '').replace(/[^0-9]/g, '');
                  const cleanPhone = rawPhone.startsWith('0') ? `92${rawPhone.slice(1)}` : rawPhone.startsWith('92') ? rawPhone : `92${rawPhone}`;
                  const waText = encodeURIComponent(
                    `Assalam-o-Alaikum ${selectedInquiry.name}, thank you for contacting Lady Doctor Clinic regarding "${selectedInquiry.subject}". We are following up with your inquiry.`
                  );
                  return (
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${waText}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-xl hover:bg-emerald-900 transition-colors text-xs font-semibold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                      <ExternalLink className="w-3 h-3 text-emerald-400 opacity-70" />
                    </a>
                  );
                })()}

                {selectedInquiry.email && (
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(`Re: ${selectedInquiry.subject} - Lady Doctor Clinic`)}&body=${encodeURIComponent(`Dear ${selectedInquiry.name},\n\nThank you for contacting Lady Doctor Clinic regarding your message: "${selectedInquiry.subject}".\n\n`)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-950 text-blue-300 border border-blue-800 rounded-xl hover:bg-blue-900 transition-colors text-xs font-semibold"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Reply</span>
                  </a>
                )}

                <a
                  href={`tel:${selectedInquiry.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-950 text-teal-300 border border-teal-800 rounded-xl hover:bg-teal-900 transition-colors text-xs font-semibold"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Back</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs cursor-pointer border border-slate-800"
                >
                  Close
                </button>
              </div>
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
