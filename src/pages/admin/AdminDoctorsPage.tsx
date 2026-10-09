import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  fetchAllAdminDoctors,
  createDoctor,
  updateDoctor,
  toggleDoctorStatus,
} from '../../lib/supabase/admin';
import { Doctor } from '../../types/doctor';
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  X,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  DollarSign,
  Clock,
  Award,
} from 'lucide-react';

export const AdminDoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingToggleDoctor, setPendingToggleDoctor] = useState<Doctor | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form values
  const [formData, setFormData] = useState({
    name: '',
    qualification: '',
    specialization: '',
    department: 'Obstetrics',
    experience: '',
    bio: '',
    image_url: '',
    consultation_fee: '$100',
    availability: 'Mon, Wed, Fri (9:00 AM – 3:00 PM)',
    is_active: true,
  });

  const loadDoctors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllAdminDoctors();
      setDoctors(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load doctors.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const openAddModal = () => {
    setEditingDoctor(null);
    setFormData({
      name: '',
      qualification: '',
      specialization: '',
      department: 'Obstetrics',
      experience: '',
      bio: '',
      image_url: '',
      consultation_fee: '$100',
      availability: 'Mon, Wed, Fri (9:00 AM – 3:00 PM)',
      is_active: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (doc: Doctor) => {
    setEditingDoctor(doc);
    setFormData({
      name: doc.name,
      qualification: doc.qualification,
      specialization: doc.specialization,
      department: doc.department || 'Obstetrics',
      experience: doc.experience,
      bio: doc.bio,
      image_url: doc.image_url || doc.image || '',
      consultation_fee: doc.consultation_fee,
      availability: doc.availability,
      is_active: doc.is_active !== false,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const executeToggleStatus = async (doc: Doctor) => {
    const newStatus = !doc.is_active;
    try {
      const res = await toggleDoctorStatus(doc.id, newStatus);
      if (res.success) {
        setDoctors((prev) =>
          prev.map((d) => (d.id === doc.id ? { ...d, is_active: newStatus } : d))
        );
        setToastMessage({
          text: `${doc.name} status updated to ${newStatus ? 'Active' : 'Inactive'}.`,
          type: 'success',
        });
      } else {
        setToastMessage({
          text: res.error || 'Failed to update doctor status.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setToastMessage({
        text: err?.message || 'Error occurred while updating doctor status.',
        type: 'error',
      });
    } finally {
      setPendingToggleDoctor(null);
    }
  };

  const handleToggleStatus = (doc: Doctor) => {
    setPendingToggleDoctor(doc);
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Doctor full name is required.');
      return;
    }
    if (!formData.qualification.trim()) {
      setFormError('Qualifications are required (e.g. MBBS, FCPS).');
      return;
    }
    if (!formData.specialization.trim()) {
      setFormError('Specialization is required.');
      return;
    }
    if (!formData.bio.trim()) {
      setFormError('Clinical bio is required.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingDoctor) {
        // Update
        const res = await updateDoctor(editingDoctor.id, {
          name: formData.name,
          qualification: formData.qualification,
          specialization: formData.specialization,
          department: formData.department,
          experience: formData.experience,
          bio: formData.bio,
          image_url: formData.image_url,
          image: formData.image_url,
          consultation_fee: formData.consultation_fee,
          availability: formData.availability,
          is_active: formData.is_active,
        });

        if (res.success) {
          setIsModalOpen(false);
          loadDoctors();
        } else {
          setFormError(res.error || 'Failed to update doctor.');
        }
      } else {
        // Create
        const res = await createDoctor({
          name: formData.name,
          qualification: formData.qualification,
          specialization: formData.specialization,
          department: formData.department,
          experience: formData.experience || '5+ Years Clinical Experience',
          bio: formData.bio,
          image_url: formData.image_url || '/src/assets/images/doctor_dr_sarah_khan_1791390148660.jpg',
          image: formData.image_url || '/src/assets/images/doctor_dr_sarah_khan_1791390148660.jpg',
          consultation_fee: formData.consultation_fee,
          availability: formData.availability,
          is_active: formData.is_active,
        });

        if (res.success) {
          setIsModalOpen(false);
          loadDoctors();
        } else {
          setFormError(res.error || 'Failed to create doctor.');
        }
      }
    } catch (err: any) {
      setFormError(err?.message || 'Network error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        searchQuery === '' ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.qualification.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = deptFilter === 'All' || doc.department === deptFilter;

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && doc.is_active !== false) ||
        (statusFilter === 'Inactive' && doc.is_active === false);

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [doctors, searchQuery, deptFilter, statusFilter]);

  const departments = ['All', 'Obstetrics', 'Gynecology', 'Pediatrics', 'Women Wellness'];

  return (
    <AdminLayout
      title="Lady Doctors Management"
      subtitle="View, create, edit, and toggle active status for clinic specialists."
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
              placeholder="Search doctors..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                Dept: {d}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="Active">Status: Active</option>
            <option value="Inactive">Status: Inactive</option>
          </select>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-600 rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 text-rose-500 animate-spin" />
          <span className="text-xs">Loading Specialist Directory...</span>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs mb-6 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={loadDoctors} className="underline text-xs">
            Retry
          </button>
        </div>
      )}

      {/* Doctors Table */}
      {!isLoading && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
          {filteredDoctors.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No doctors found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Specialist</th>
                    <th className="py-3.5 px-4 font-semibold">Department</th>
                    <th className="py-3.5 px-4 font-semibold">Experience & Fee</th>
                    <th className="py-3.5 px-4 font-semibold">Availability</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {filteredDoctors.map((doc) => {
                    const isActive = doc.is_active !== false;
                    return (
                      <tr key={doc.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={doc.image || doc.image_url || '/src/assets/images/doctor_dr_sarah_khan_1791390148660.jpg'}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover border border-slate-800 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white text-xs">{doc.name}</div>
                              <div className="text-[11px] text-rose-400">{doc.specialization}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{doc.qualification}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] bg-slate-900 border border-slate-800 text-slate-300">
                            {doc.department}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div>{doc.experience}</div>
                          <div className="font-semibold text-teal-400 text-[11px]">{doc.consultation_fee}</div>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {doc.availability}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              isActive
                                ? 'bg-teal-950 text-teal-300 border border-teal-800'
                                : 'bg-slate-900 text-slate-500 border border-slate-800'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-teal-400" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-slate-500" />
                                <span>Inactive</span>
                              </>
                            )}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(doc)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                              title="Edit Doctor Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(doc)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isActive
                                  ? 'bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border-slate-800 hover:border-rose-800'
                                  : 'bg-teal-950/40 text-teal-300 border-teal-800 hover:bg-teal-900/60'
                              }`}
                              title={isActive ? 'Deactivate Doctor' : 'Activate Doctor'}
                            >
                              {isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
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

      {/* Add / Edit Doctor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {editingDoctor ? 'Edit Doctor Record' : 'Add New Lady Doctor'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Update specialist credentials and clinical availability.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveDoctor} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name & Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Ayesha Siddiqa"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Obstetrics">Obstetrics</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Women Wellness">Women Wellness</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Consultation Fee *</label>
                  <input
                    type="text"
                    required
                    value={formData.consultation_fee}
                    onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                    placeholder="e.g. $120 or Rs. 2,000"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Specialization Subtitle *</label>
                <input
                  type="text"
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g. Maternal-Fetal Medicine & High-Risk Pregnancy"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Qualifications / Degrees *</label>
                <input
                  type="text"
                  required
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g. MBBS, FCPS (Obs & Gynae), MRCOG"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Clinical Experience</label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="e.g. 12+ Years Clinical Experience"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Weekly Availability</label>
                  <input
                    type="text"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    placeholder="e.g. Mon, Wed, Fri (9:00 AM – 3:00 PM)"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Photo Image URL</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Leave blank for clinic default portrait"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Clinical Biography *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Summarize the doctor's clinical focus, patient care approach, and expertise..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="doctorActiveCheck"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-800 text-rose-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="doctorActiveCheck" className="text-slate-300 font-medium cursor-pointer">
                  Publish doctor as active in the public clinic directory
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-rose-700 hover:bg-rose-600 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingDoctor ? 'Save Changes' : 'Create Doctor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Doctor Status Confirmation Modal */}
      {pendingToggleDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-white">
              {pendingToggleDoctor.is_active ? 'Deactivate Doctor Listing?' : 'Re-activate Doctor Listing?'}
            </h3>
            <p className="text-xs text-slate-400 text-center mt-2 leading-relaxed">
              {pendingToggleDoctor.is_active
                ? `Deactivate ${pendingToggleDoctor.name}? The doctor will be hidden from the public directory while preserving patient booking records.`
                : `Make ${pendingToggleDoctor.name} visible in the public doctor directory and open for bookings?`}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPendingToggleDoctor(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeToggleStatus(pendingToggleDoctor)}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs ${
                  pendingToggleDoctor.is_active
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-teal-600 hover:bg-teal-500'
                }`}
              >
                {pendingToggleDoctor.is_active ? 'Confirm Deactivation' : 'Confirm Activation'}
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
