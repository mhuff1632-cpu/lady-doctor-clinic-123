import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { DoctorSalaryRecord, SalaryContractType } from '../../types/salary';
import {
  fetchDoctorSalaries,
  createDoctorSalary,
  updateDoctorSalary,
  deleteDoctorSalary,
} from '../../lib/supabase/salaries';
import { fetchActiveDoctors } from '../../lib/supabase/doctors';
import { Doctor } from '../../types/doctor';
import {
  Lock,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  Calendar,
  Building,
} from 'lucide-react';

export const AdminSalariesPage: React.FC = () => {
  const { role } = useAuth();
  const [salaries, setSalaries] = useState<DoctorSalaryRecord[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DoctorSalaryRecord | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [amount, setAmount] = useState<number>(150000);
  const [contractType, setContractType] = useState<SalaryContractType>('monthly');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sals, docsRes] = await Promise.all([
        fetchDoctorSalaries(),
        fetchActiveDoctors(),
      ]);
      setSalaries(sals);
      if (docsRes.data) {
        setDoctors(docsRes.data);
      }
    } catch {
      showToast('Error loading compensation data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Staff guard: strictly admin-only
  if (role !== 'admin') {
    return (
      <AdminLayout
        title="Doctor Compensation Desk"
        subtitle="Confidential clinical payroll records."
      >
        <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800 max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Administrator Clearance Required</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Doctor salary records are strictly confidential and restricted to executive clinic administrators. Staff accounts do not have clearance to view payroll data.
          </p>
        </div>
      </AdminLayout>
    );
  }

  const openCreateModal = () => {
    setEditingRecord(null);
    setSelectedDoctorId(doctors[0]?.id || '');
    setAmount(150000);
    setContractType('monthly');
    setEffectiveDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (rec: DoctorSalaryRecord) => {
    setEditingRecord(rec);
    setSelectedDoctorId(rec.doctor_id);
    setAmount(rec.amount);
    setContractType(rec.contract_type);
    setEffectiveDate(rec.effective_date);
    setNotes(rec.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find((d) => d.id === selectedDoctorId);
    const doctorName = doc ? doc.name : 'Attending Lady Specialist';

    setSubmitting(true);
    try {
      if (editingRecord) {
        const res = await updateDoctorSalary(editingRecord.id, {
          doctor_id: selectedDoctorId,
          doctor_name: doctorName,
          amount: Number(amount),
          contract_type: contractType,
          effective_date: effectiveDate,
          notes: notes.trim(),
        });

        if (res.success) {
          showToast('Salary record updated successfully.', 'success');
          setIsModalOpen(false);
          await loadData();
        } else {
          showToast(res.error || 'Failed to update salary.', 'error');
        }
      } else {
        const res = await createDoctorSalary({
          doctor_id: selectedDoctorId,
          doctor_name: doctorName,
          amount: Number(amount),
          contract_type: contractType,
          effective_date: effectiveDate,
          notes: notes.trim(),
        });

        if (res.success) {
          showToast('New salary record saved.', 'success');
          setIsModalOpen(false);
          await loadData();
        } else {
          showToast(res.error || 'Failed to save salary.', 'error');
        }
      }
    } catch {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await deleteDoctorSalary(deleteTargetId);
      if (res.success) {
        showToast('Salary record removed.', 'success');
        await loadData();
      } else {
        showToast(res.error || 'Failed to delete record.', 'error');
      }
    } catch {
      showToast('Error removing record.', 'error');
    } finally {
      setDeleteTargetId(null);
    }
  };

  const totalMonthlyPayroll = salaries.reduce((sum, s) => {
    if (s.contract_type === 'monthly') return sum + s.amount;
    if (s.contract_type === 'weekly') return sum + s.amount * 4;
    return sum + s.amount;
  }, 0);

  const filteredSalaries = salaries.filter(
    (s) =>
      s.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout
      title="Doctor Compensation & Payroll"
      subtitle="Strictly confidential compensation structures and contracts for attending lady doctors."
    >
      {/* Confidentiality Warning Strip */}
      <div className="p-3.5 mb-6 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
        <div className="flex-1">
          <strong className="block text-amber-100 font-semibold">Strictly Confidential Clinical Records</strong>
          <span className="text-[11px] text-amber-300/80">
            Compensation records are stored on isolated, encrypted tables. This information is never included in public API endpoints or patient chatbot responses.
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs uppercase font-semibold text-slate-500">Estimated Monthly Payroll</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            PKR {totalMonthlyPayroll.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">Total recurring monthly compensation</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs uppercase font-semibold text-slate-500">Compensated Specialists</span>
          <div className="text-2xl font-bold font-mono text-white">
            {salaries.length} Doctors
          </div>
          <span className="text-[11px] text-slate-400">Active roster agreements</span>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs uppercase font-semibold text-slate-500">Average Monthly Retainer</span>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            PKR {salaries.length ? Math.round(totalMonthlyPayroll / salaries.length).toLocaleString() : '0'}
          </div>
          <span className="text-[11px] text-slate-400">Per attending specialist</span>
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
            placeholder="Search compensation by doctor name or notes..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Salary Agreement</span>
        </button>
      </div>

      {/* Salary Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
          <span className="text-xs">Loading payroll records...</span>
        </div>
      ) : filteredSalaries.length === 0 ? (
        <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800">
          <DollarSign className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No salary agreements recorded</h3>
          <p className="text-xs text-slate-400 mt-1">
            Click "+ Add Salary Agreement" to set up compensation for an attending doctor.
          </p>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Doctor Specialist</th>
                  <th className="py-3 px-4 font-semibold">Compensation (PKR)</th>
                  <th className="py-3 px-4 font-semibold">Contract Type</th>
                  <th className="py-3 px-4 font-semibold">Effective Date</th>
                  <th className="py-3 px-4 font-semibold">Confidential Notes</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {filteredSalaries.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {rec.doctor_name}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                      PKR {rec.amount.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-800">
                        {rec.contract_type.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {rec.effective_date}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-slate-400 text-xs italic truncate">
                      {rec.notes || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(rec)}
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit Agreement"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(rec.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-200 bg-slate-900 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Record"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-xs text-slate-300 space-y-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-rose-400">
              <DollarSign className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">
                {editingRecord ? 'Edit Compensation Agreement' : 'Add Doctor Salary Agreement'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Select Lady Doctor <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Amount (PKR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Contract Basis
                  </label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as SalaryContractType)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="monthly">Monthly Retainer</option>
                    <option value="weekly">Weekly</option>
                    <option value="per_consultation">Per Consultation</option>
                    <option value="other">Custom Agreement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Effective Start Date
                </label>
                <input
                  type="date"
                  required
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Confidential Administrative Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes regarding on-call allowances, bonus targets, or OPD days..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

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
                  {submitting ? 'Saving...' : editingRecord ? 'Update Record' : 'Save Agreement'}
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
              Delete Compensation Record?
            </h3>
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Are you sure you want to delete this confidential compensation record? This will remove the agreement from the executive payroll calculations.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer"
              >
                Keep Record
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
