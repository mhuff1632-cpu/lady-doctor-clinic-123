import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ClinicPoster, CreatePosterInput } from '../../types/poster';
import {
  fetchPosters,
  createPoster,
  updatePoster,
  deletePoster,
} from '../../lib/supabase/posters';
import {
  Plus,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const AdminPostersPage: React.FC = () => {
  const [posters, setPosters] = useState<ClinicPoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoster, setEditingPoster] = useState<ClinicPoster | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formTheme, setFormTheme] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formHighlights, setFormHighlights] = useState<string>('');
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadPosters = async () => {
    setLoading(true);
    try {
      const data = await fetchPosters(false);
      setPosters(data);
    } catch {
      showToast('Failed to load posters', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosters();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreateModal = () => {
    setEditingPoster(null);
    setFormTitle('');
    setFormTheme("Gynecology & Women's Health");
    setFormDescription('');
    setFormDisplayOrder(posters.length + 1);
    setFormIsActive(true);
    setFormImageUrl('');
    setFormHighlights('');
    setFileError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (poster: ClinicPoster) => {
    setEditingPoster(poster);
    setFormTitle(poster.title);
    setFormTheme(poster.theme || "Gynecology & Women's Health");
    setFormDescription(poster.description);
    setFormDisplayOrder(poster.display_order);
    setFormIsActive(poster.is_active);
    setFormImageUrl(poster.image_url || '');
    setFormHighlights((poster.highlights || []).join('\n'));
    setFileError(null);
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) return;

    // Validate type: JPG, JPEG, PNG, WebP
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid format. Please upload JPG, PNG, or WebP images only.');
      return;
    }

    // Validate size: Maximum 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File exceeds 5MB limit. Please upload an optimized file.');
      return;
    }

    // Read and preview file
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormImageUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormImageUrl('');
    setFileError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Poster title is required.', 'error');
      return;
    }

    setSubmitting(true);
    const parsedHighlights = formHighlights
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editingPoster) {
        // Update
        const res = await updatePoster(editingPoster.id, {
          title: formTitle.trim(),
          theme: formTheme.trim(),
          description: formDescription.trim(),
          display_order: Number(formDisplayOrder) || 1,
          is_active: formIsActive,
          image_url: formImageUrl,
          highlights: parsedHighlights,
        });

        if (res.success) {
          showToast('Poster updated successfully.', 'success');
          setIsModalOpen(false);
          await loadPosters();
        } else {
          showToast(res.error || 'Failed to update poster.', 'error');
        }
      } else {
        // Create
        const res = await createPoster({
          title: formTitle.trim(),
          theme: formTheme.trim(),
          description: formDescription.trim(),
          display_order: Number(formDisplayOrder) || 1,
          is_active: formIsActive,
          image_url: formImageUrl,
          highlights: parsedHighlights,
        });

        if (res.success) {
          showToast('New poster created successfully.', 'success');
          setIsModalOpen(false);
          await loadPosters();
        } else {
          showToast(res.error || 'Failed to create poster.', 'error');
        }
      }
    } catch {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (poster: ClinicPoster) => {
    const newStatus = !poster.is_active;
    const res = await updatePoster(poster.id, { is_active: newStatus });
    if (res.success) {
      setPosters((prev) =>
        prev.map((p) => (p.id === poster.id ? { ...p, is_active: newStatus } : p))
      );
      showToast(
        `Poster marked ${newStatus ? 'Active' : 'Inactive'} on public website.`,
        'success'
      );
    } else {
      showToast('Failed to change status.', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await deletePoster(deleteTargetId);
      if (res.success) {
        showToast('Poster deleted successfully.', 'success');
        await loadPosters();
      } else {
        showToast(res.error || 'Failed to delete poster.', 'error');
      }
    } catch {
      showToast('Error deleting poster.', 'error');
    } finally {
      setDeleteTargetId(null);
    }
  };

  // Filter & Search
  const filteredPosters = posters.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.theme.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'active') return p.is_active;
    if (statusFilter === 'inactive') return !p.is_active;
    return true;
  });

  return (
    <AdminLayout
      title="Clinic Posters Management"
      subtitle="Manage promotional, informational, and educational clinical posters displayed across public website and reception."
    >
      {/* Controls Bar */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posters by title, theme, or description..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-rose-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({posters.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-rose-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Active ({posters.filter((p) => p.is_active).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('inactive')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'inactive'
                    ? 'bg-rose-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Inactive ({posters.filter((p) => !p.is_active).length})
              </button>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Poster</span>
            </button>
          </div>
        </div>
      </div>

      {/* Posters Table / List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
          <span className="text-xs">Loading Clinic Posters...</span>
        </div>
      ) : filteredPosters.length === 0 ? (
        <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No posters found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No posters match your current search query.'
              : 'No posters created yet. Click "+ Add Poster" to get started.'}
          </p>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order</th>
                  <th className="py-3 px-4 font-semibold">Visual Preview</th>
                  <th className="py-3 px-4 font-semibold">Poster Title & Theme</th>
                  <th className="py-3 px-4 font-semibold">Description</th>
                  <th className="py-3 px-4 font-semibold">Public Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {filteredPosters.map((poster) => (
                  <tr key={poster.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                      #{poster.display_order}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="w-16 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center text-slate-600">
                        {poster.image_url ? (
                          <img
                            src={poster.image_url}
                            alt={poster.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-700" />
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-white text-xs">{poster.title}</div>
                      <span className="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-semibold bg-rose-950/60 text-rose-300 border border-rose-900/40">
                        {poster.theme}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-md">
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {poster.description}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={poster.is_active}
                        onClick={() => handleToggleActive(poster)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer transition-colors ${
                          poster.is_active
                            ? 'bg-teal-950/80 text-teal-300 border-teal-800 hover:bg-teal-900'
                            : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-850'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            poster.is_active ? 'bg-teal-400' : 'bg-slate-500'
                          }`}
                        />
                        <span>{poster.is_active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(poster)}
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit Poster"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(poster.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-200 bg-slate-900 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Poster"
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

      {/* Add / Edit Poster Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative text-xs text-slate-300 space-y-5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-rose-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">
                {editingPoster ? 'Edit Clinical Poster' : '+ Add New Clinical Poster'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Poster Title */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Poster Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Complete Women's Healthcare"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Theme & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Theme / Specialty Category
                  </label>
                  <select
                    value={formTheme}
                    onChange={(e) => setFormTheme(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Gynecology & Women's Health">Gynecology & Women's Health</option>
                    <option value="Pregnancy & Antenatal Care">Pregnancy & Antenatal Care</option>
                    <option value="Ultrasound & Women's Diagnostics">Ultrasound & Diagnostics</option>
                    <option value="Family Planning & Reproductive Health">Family Planning & Fertility</option>
                    <option value="Overview of Verified Clinic Services">Overview of Clinic Services</option>
                    <option value="Pediatrics & Child Wellness">Pediatrics & Child Wellness</option>
                    <option value="24/7 Maternity Emergency">24/7 Maternity Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Display Order (Sorting)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Short Description & Clinical Guidance
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Provide clinical details, advisory notes, and instructions for patients..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Highlights (One per line) */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Bullet Points / Key Features (One per line)
                </label>
                <textarea
                  rows={3}
                  value={formHighlights}
                  onChange={(e) => setFormHighlights(e.target.value)}
                  placeholder="Routine Antenatal Vitals&#10;Fetal Heart Rate Scans&#10;Consultation with Lady Specialist"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                />
              </div>

              {/* Image Upload & Preview */}
              <div className="space-y-2 pt-2 border-t border-slate-900">
                <label className="block text-slate-400 font-semibold">
                  Poster Image (JPG, PNG, WebP · Max 5MB)
                </label>

                {formImageUrl ? (
                  <div className="relative aspect-16/9 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden group">
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs cursor-pointer"
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-900/50">
                    <Upload className="w-8 h-8 text-slate-500 mb-2" />
                    <span className="text-xs font-semibold text-white">
                      Click to upload poster image
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1">
                      Supports JPG, PNG, WebP up to 5MB
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                )}

                {fileError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fileError}</span>
                  </p>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="posterActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <label htmlFor="posterActive" className="text-xs font-semibold text-white cursor-pointer">
                  Publish to Live Website immediately (Active)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-900 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingPoster ? 'Update Poster' : 'Save Poster'}
                </button>
              </div>
            </form>
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
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-white">
              Are you sure you want to delete this poster?
            </h3>
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              This action cannot be undone. The poster will be permanently removed from the website and management catalog.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                Keep Poster
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
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
