import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PatientReview, ReviewStatus } from '../../types/review';
import {
  fetchAllReviewsForAdmin,
  updateReviewStatus,
  deleteReview,
} from '../../lib/supabase/reviews';
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  User,
} from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<PatientReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchAllReviewsForAdmin();
      setReviews(data);
    } catch {
      showToast('Error loading reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusChange = async (id: string, status: ReviewStatus) => {
    try {
      const res = await updateReviewStatus(id, status);
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
        showToast(`Review marked as ${status}.`, 'success');
      } else {
        showToast('Failed to update status.', 'error');
      }
    } catch {
      showToast('Error changing status.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await deleteReview(deleteTargetId);
      if (res.success) {
        showToast('Review permanently deleted.', 'success');
        await loadReviews();
      } else {
        showToast('Failed to delete review.', 'error');
      }
    } catch {
      showToast('Error deleting review.', 'error');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const avgRating =
    approvedCount > 0
      ? (
          reviews
            .filter((r) => r.status === 'approved')
            .reduce((sum, r) => sum + r.rating, 0) / approvedCount
        ).toFixed(1)
      : '5.0';

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.review_text.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <AdminLayout
      title="Patient Reviews Moderation"
      subtitle="Moderation desk for patient ratings and clinic testimonials. Only approved reviews appear publicly."
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs uppercase font-semibold text-slate-500">Pending Review</span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {pendingCount} Awaiting Moderation
          </div>
          <span className="text-[11px] text-slate-400">Must be reviewed before public display</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs uppercase font-semibold text-slate-500">Live Approved Reviews</span>
          <div className="text-2xl font-bold font-mono text-teal-400">
            {approvedCount} Published
          </div>
          <span className="text-[11px] text-slate-400">Visible on Doctors directory</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs uppercase font-semibold text-slate-500">Average Patient Rating</span>
          <div className="text-2xl font-bold font-mono text-rose-400 flex items-center gap-1.5">
            <span>{avgRating}</span>
            <Star className="w-5 h-5 fill-rose-400 text-rose-400" />
          </div>
          <span className="text-[11px] text-slate-400">Based on approved submissions</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name, doctor, or review text..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-rose-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              statusFilter === 'approved'
                ? 'bg-teal-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Approved ({approvedCount})
          </button>
        </div>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
          <span className="text-xs">Loading patient reviews...</span>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No reviews found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery
              ? 'No reviews match your search query.'
              : 'No patient reviews currently in the queue.'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Patient & Reference</th>
                  <th className="py-3 px-4 font-semibold">Doctor Specialist</th>
                  <th className="py-3 px-4 font-semibold">Rating</th>
                  <th className="py-3 px-4 font-semibold">Review Commentary</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>{rev.patient_name}</div>
                      {rev.appointment_ref && (
                        <span className="text-[10px] font-mono text-teal-400 block mt-0.5">
                          Ref: {rev.appointment_ref}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-rose-300">
                      {rev.doctor_name}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-2">
                        "{rev.review_text}"
                      </p>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          rev.status === 'approved'
                            ? 'bg-teal-950/80 text-teal-300 border border-teal-800'
                            : rev.status === 'rejected'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {rev.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {rev.status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(rev.id, 'approved')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-900/60 hover:bg-teal-800 text-teal-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            title="Approve for public view"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {rev.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(rev.id, 'rejected')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            title="Reject review"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(rev.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-white">
              Delete Patient Review?
            </h3>
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Are you sure you want to permanently delete this review record? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                Keep Review
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border text-xs font-semibold shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200 ${
            toast.type === 'success'
              ? 'bg-teal-950 border-teal-800 text-teal-200'
              : 'bg-rose-950 border-rose-800 text-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </AdminLayout>
  );
};
