export type SalaryContractType = 'monthly' | 'weekly' | 'per_consultation' | 'other';

export interface DoctorSalaryRecord {
  id: string;
  doctor_id: string;
  doctor_name: string;
  amount: number;
  contract_type: SalaryContractType;
  effective_date: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateSalaryInput {
  doctor_id: string;
  doctor_name: string;
  amount: number;
  contract_type: SalaryContractType;
  effective_date: string;
  notes?: string;
}
