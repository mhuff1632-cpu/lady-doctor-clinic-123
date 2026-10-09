import { DoctorSalaryRecord, CreateSalaryInput } from '../../types/salary';
import { getSupabaseClient, isSupabaseConfigured } from './client';

const SALARIES_STORAGE_KEY = 'ldc_doctor_salaries_v1';

const initialSalaries: DoctorSalaryRecord[] = [
  {
    id: 'sal-1',
    doctor_id: 'a1111111-1111-4111-8111-111111111111',
    doctor_name: 'Dr. Ayesha Malik',
    amount: 180000,
    contract_type: 'monthly',
    effective_date: '2026-01-01',
    notes: 'Senior Consultant Gynecologist & Head of Antenatal Care. Includes on-call emergency coverage.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sal-2',
    doctor_id: 'a2222222-2222-4222-8222-222222222222',
    doctor_name: 'Dr. Fatima Noor',
    amount: 150000,
    contract_type: 'monthly',
    effective_date: '2026-02-01',
    notes: 'PCOS & Reproductive Health Specialist. Full clinic visiting hours MWF.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sal-3',
    doctor_id: 'a3333333-3333-4333-8333-333333333333',
    doctor_name: 'Dr. Zainab Rehman',
    amount: 140000,
    contract_type: 'monthly',
    effective_date: '2026-01-15',
    notes: 'Pediatrics, Neonatal Care & EPI Vaccination Clinic Supervisor.',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sal-4',
    doctor_id: 'a4444444-4444-4444-8444-444444444444',
    doctor_name: 'Dr. Maryam Tariq',
    amount: 130000,
    contract_type: 'monthly',
    effective_date: '2026-03-01',
    notes: 'Women Preventive Wellness & Diagnostic Ultrasound consultations.',
    created_at: new Date().toISOString(),
  },
];

function getStoredSalaries(): DoctorSalaryRecord[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(SALARIES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch {}
  return [...initialSalaries];
}

function saveStoredSalaries(records: DoctorSalaryRecord[]) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SALARIES_STORAGE_KEY, JSON.stringify(records));
    }
  } catch {}
}

export async function fetchDoctorSalaries(): Promise<DoctorSalaryRecord[]> {
  const client = getSupabaseClient();
  if (!isSupabaseConfigured || !client) {
    return getStoredSalaries();
  }

  try {
    const { data, error } = await client
      .from('doctor_salaries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      return data as DoctorSalaryRecord[];
    }
    return getStoredSalaries();
  } catch (err) {
    console.warn('Using local salaries fallback:', err);
    return getStoredSalaries();
  }
}

export async function createDoctorSalary(
  input: CreateSalaryInput
): Promise<{ success: boolean; data?: DoctorSalaryRecord; error?: string }> {
  const newSalary: DoctorSalaryRecord = {
    id: `sal-${Date.now().toString(36)}`,
    doctor_id: input.doctor_id,
    doctor_name: input.doctor_name,
    amount: Number(input.amount),
    contract_type: input.contract_type,
    effective_date: input.effective_date,
    notes: input.notes?.trim() || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const stored = getStoredSalaries();
  stored.unshift(newSalary);
  saveStoredSalaries(stored);

  const client = getSupabaseClient();
  if (isSupabaseConfigured && client) {
    try {
      await client.from('doctor_salaries').insert([newSalary]);
    } catch {}
  }

  return { success: true, data: newSalary };
}

export async function updateDoctorSalary(
  id: string,
  updates: Partial<DoctorSalaryRecord>
): Promise<{ success: boolean; error?: string }> {
  const stored = getStoredSalaries();
  const idx = stored.findIndex((s) => s.id === id);
  if (idx !== -1) {
    stored[idx] = {
      ...stored[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveStoredSalaries(stored);
  }

  const client = getSupabaseClient();
  if (isSupabaseConfigured && client) {
    try {
      await client.from('doctor_salaries').update(updates).eq('id', id);
    } catch {}
  }

  return { success: true };
}

export async function deleteDoctorSalary(id: string): Promise<{ success: boolean; error?: string }> {
  const stored = getStoredSalaries();
  const filtered = stored.filter((s) => s.id !== id);
  saveStoredSalaries(filtered);

  const client = getSupabaseClient();
  if (isSupabaseConfigured && client) {
    try {
      await client.from('doctor_salaries').delete().eq('id', id);
    } catch {}
  }

  return { success: true };
}
