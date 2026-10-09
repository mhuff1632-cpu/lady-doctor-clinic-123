import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  fetchAllAdminServices,
  createService,
  updateService,
  toggleServiceStatus,
} from '../../lib/supabase/admin';
import { Service } from '../../types/service';
import {
  Stethoscope,
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
  Clock,
  Layers,
} from 'lucide-react';

export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingToggleService, setPendingToggleService] = useState<Service | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form values
  const [formData, setFormData] = useState({
    name: '',
    category: 'Gynecology',
    description: '',
    duration: '30 mins',
    icon: 'Stethoscope',
    image_url: '',
    featuresText: '',
    is_active: true,
  });

  const loadServices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllAdminServices();
      setServices(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load services.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: 'Gynecology',
      description: '',
      duration: '30 mins',
      icon: 'Stethoscope',
      image_url: '',
      featuresText: 'Routine diagnostic review\nConfidential consultation\nFollow-up recommendation',
      is_active: true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (srv: Service) => {
    setEditingService(srv);
    setFormData({
      name: srv.name,
      category: srv.category,
      description: srv.description,
      duration: srv.duration,
      icon: srv.icon || 'Stethoscope',
      image_url: srv.image_url || srv.image || '',
      featuresText: (srv.features || []).join('\n'),
      is_active: srv.is_active !== false,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const executeToggleStatus = async (srv: Service) => {
    const newStatus = !srv.is_active;
    try {
      const res = await toggleServiceStatus(srv.id, newStatus);
      if (res.success) {
        setServices((prev) =>
          prev.map((s) => (s.id === srv.id ? { ...s, is_active: newStatus } : s))
        );
        setToastMessage({
          text: `${srv.name} status updated to ${newStatus ? 'Active' : 'Inactive'}.`,
          type: 'success',
        });
      } else {
        setToastMessage({
          text: res.error || 'Failed to update service status.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setToastMessage({
        text: err?.message || 'Error occurred while updating service status.',
        type: 'error',
      });
    } finally {
      setPendingToggleService(null);
    }
  };

  const handleToggleStatus = (srv: Service) => {
    setPendingToggleService(srv);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Service name is required.');
      return;
    }
    if (!formData.description.trim()) {
      setFormError('Service description is required.');
      return;
    }

    const parsedFeatures = formData.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      if (editingService) {
        // Update
        const res = await updateService(editingService.id, {
          name: formData.name,
          category: formData.category,
          description: formData.description,
          duration: formData.duration,
          icon: formData.icon,
          image_url: formData.image_url,
          image: formData.image_url,
          features: parsedFeatures,
          is_active: formData.is_active,
        });

        if (res.success) {
          setIsModalOpen(false);
          loadServices();
        } else {
          setFormError(res.error || 'Failed to update service.');
        }
      } else {
        // Create
        const res = await createService({
          name: formData.name,
          category: formData.category,
          description: formData.description,
          duration: formData.duration,
          icon: formData.icon,
          image_url: formData.image_url || '/images/clinic_interior_consultation_1791390183063.jpg',
          image: formData.image_url || '/images/clinic_interior_consultation_1791390183063.jpg',
          features: parsedFeatures,
          is_active: formData.is_active,
        });

        if (res.success) {
          setIsModalOpen(false);
          loadServices();
        } else {
          setFormError(res.error || 'Failed to create service.');
        }
      }
    } catch (err: any) {
      setFormError(err?.message || 'Network error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchesSearch =
        searchQuery === '' ||
        srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = catFilter === 'All' || srv.category === catFilter;

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && srv.is_active !== false) ||
        (statusFilter === 'Inactive' && srv.is_active === false);

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [services, searchQuery, catFilter, statusFilter]);

  const categories = ['All', 'Maternity', 'Gynecology', 'Endocrinology', 'Child Health', 'Women Wellness', 'Diagnostics'];

  return (
    <AdminLayout
      title="Clinical Services Management"
      subtitle="Configure clinical specialties, consultation durations, feature scopes, and active offerings."
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
              placeholder="Search services..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
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
          <span>Add Clinical Service</span>
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-8 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 text-rose-500 animate-spin" />
          <span className="text-xs">Loading Services Catalog...</span>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs mb-6 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={loadServices} className="underline text-xs">
            Retry
          </button>
        </div>
      )}

      {/* Services Table */}
      {!isLoading && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
          {filteredServices.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No clinical services found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Service Name</th>
                    <th className="py-3.5 px-4 font-semibold">Category</th>
                    <th className="py-3.5 px-4 font-semibold">Duration</th>
                    <th className="py-3.5 px-4 font-semibold">Inclusions Scope</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {filteredServices.map((srv) => {
                    const isActive = srv.is_active !== false;
                    return (
                      <tr key={srv.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white text-xs">{srv.name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 max-w-sm mt-0.5">
                            {srv.description}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] bg-slate-900 border border-slate-800 text-rose-300">
                            {srv.category}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{srv.duration}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-[11px] text-slate-400">
                          <span className="text-slate-300">{srv.features?.length || 0} features</span>
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
                              onClick={() => openEditModal(srv)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                              title="Edit Service"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(srv)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isActive
                                  ? 'bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border-slate-800 hover:border-rose-800'
                                  : 'bg-teal-950/40 text-teal-300 border-teal-800 hover:bg-teal-900/60'
                              }`}
                              title={isActive ? 'Deactivate Service' : 'Activate Service'}
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

      {/* Add / Edit Service Modal */}
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
              {editingService ? 'Edit Clinical Service' : 'Add New Clinical Service'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Configure treatment descriptions and included patient care steps.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Obstetrics & Antenatal Care"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  >
                    <option value="Maternity">Maternity</option>
                    <option value="Gynecology">Gynecology</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="Child Health">Child Health</option>
                    <option value="Women Wellness">Women Wellness</option>
                    <option value="Diagnostics">Diagnostics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Consultation Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 30 mins or 45 mins"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive description of the service and clinical procedure..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Features / Inclusions (One item per line)
                </label>
                <textarea
                  rows={4}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  placeholder="Early pregnancy viability scans&#10;Fetal Doppler checkup&#10;Gestational diabetes screening"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Leave blank for clinic default consultation photo"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="serviceActiveCheck"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-800 text-rose-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="serviceActiveCheck" className="text-slate-300 font-medium cursor-pointer">
                  Publish service as active in public offerings catalog
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
                  <span>{editingService ? 'Save Changes' : 'Create Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Service Status Confirmation Modal */}
      {pendingToggleService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-white">
              {pendingToggleService.is_active ? 'Deactivate Clinical Service?' : 'Re-activate Clinical Service?'}
            </h3>
            <p className="text-xs text-slate-400 text-center mt-2 leading-relaxed">
              {pendingToggleService.is_active
                ? `Deactivate ${pendingToggleService.name}? The service will be hidden from the public offerings catalog while preserving existing booking records.`
                : `Make ${pendingToggleService.name} visible in the public clinical services catalog and open for bookings?`}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPendingToggleService(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeToggleStatus(pendingToggleService)}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs ${
                  pendingToggleService.is_active
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-teal-600 hover:bg-teal-500'
                }`}
              >
                {pendingToggleService.is_active ? 'Confirm Deactivation' : 'Confirm Activation'}
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
