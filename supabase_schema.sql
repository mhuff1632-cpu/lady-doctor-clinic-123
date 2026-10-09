-- ==============================================================================
-- LADY DOCTOR CLINIC — SUPABASE DATABASE & AUTHENTICATION SETUP (PHASE 3)
-- Copy and paste this directly into the Supabase SQL Editor.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')) DEFAULT 'staff',
  full_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  qualification TEXT NOT NULL,
  specialization TEXT NOT NULL,
  department TEXT NOT NULL,
  experience TEXT NOT NULL,
  bio TEXT NOT NULL,
  image_url TEXT,
  consultation_fee TEXT NOT NULL,
  availability TEXT NOT NULL,
  days_available TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Stethoscope',
  image_url TEXT,
  duration TEXT NOT NULL DEFAULT '30 mins',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. CONTACT INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. TRIGGERS
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_doctors_updated_at ON public.doctors;
CREATE TRIGGER tr_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_services_updated_at ON public.services;
CREATE TRIGGER tr_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_appointments_updated_at ON public.appointments;
CREATE TRIGGER tr_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_contact_inquiries_updated_at ON public.contact_inquiries;
CREATE TRIGGER tr_contact_inquiries_updated_at
  BEFORE UPDATE ON public.contact_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-provision Profile on Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Clinic Staff')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'staff') AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_doctors_is_active ON public.doctors(is_active);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON public.appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON public.contact_inquiries(status);

-- 8. ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view active doctors" ON public.doctors;
CREATE POLICY "Public can view active doctors"
  ON public.doctors FOR SELECT
  USING (is_active = true OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "Admins can insert doctors" ON public.doctors;
CREATE POLICY "Admins can insert doctors"
  ON public.doctors FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update doctors" ON public.doctors;
CREATE POLICY "Admins can update doctors"
  ON public.doctors FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services"
  ON public.services FOR SELECT
  USING (is_active = true OR public.is_staff_or_admin());

DROP POLICY IF EXISTS "Admins can insert services" ON public.services;
CREATE POLICY "Admins can insert services"
  ON public.services FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update services" ON public.services;
CREATE POLICY "Admins can update services"
  ON public.services FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Public can submit appointments" ON public.appointments;
CREATE POLICY "Public can submit appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (status = 'pending');

DROP POLICY IF EXISTS "Staff and Admin can view appointments" ON public.appointments;
CREATE POLICY "Staff and Admin can view appointments"
  ON public.appointments FOR SELECT
  USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Staff and Admin can update appointment status" ON public.appointments;
CREATE POLICY "Staff and Admin can update appointment status"
  ON public.appointments FOR UPDATE
  USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Public can submit contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Public can submit contact inquiries"
  ON public.contact_inquiries FOR INSERT
  WITH CHECK (status = 'new');

DROP POLICY IF EXISTS "Staff and Admin can view contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Staff and Admin can view contact inquiries"
  ON public.contact_inquiries FOR SELECT
  USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Staff and Admin can update contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Staff and Admin can update contact inquiries"
  ON public.contact_inquiries FOR UPDATE
  USING (public.is_staff_or_admin());

-- ==============================================================================
-- 9. PHASE 5 — CONFLICT-FREE APPOINTMENT BOOKING & ATOMIC VALIDATION
-- ==============================================================================

-- Unique partial index protecting against concurrent race conditions for active bookings
-- Only one active (pending or confirmed) booking can exist for the exact same doctor, date, and time.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_doctor_slot
  ON public.appointments (doctor_id, appointment_date, appointment_time)
  WHERE (status IN ('pending', 'confirmed'));

-- Helper function to generate human-readable appointment reference code (e.g. LDC-2026-004812)
CREATE OR REPLACE FUNCTION public.generate_appointment_reference(apt_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_year TEXT := to_char(now(), 'YYYY');
  v_suffix TEXT := upper(substring(replace(apt_id::text, '-', '') from 27 for 6));
BEGIN
  RETURN 'LDC-' || v_year || '-' || v_suffix;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Public-safe query function: Returns booked appointment times for a doctor & date
-- Only returns the time string and status to check slot availability.
-- DOES NOT expose patient names, emails, phones, or notes (100% Privacy-Preserving).
CREATE OR REPLACE FUNCTION public.get_booked_slots(
  p_doctor_id UUID,
  p_date DATE
)
RETURNS TABLE (appointment_time TEXT, status TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT a.appointment_time, a.status
  FROM public.appointments a
  WHERE a.doctor_id = p_doctor_id
    AND a.appointment_date = p_date
    AND a.status IN ('pending', 'confirmed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic Booking RPC: Validates active doctor, date not in past, and locks against race conditions
CREATE OR REPLACE FUNCTION public.book_appointment_atomic(
  p_patient_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_doctor_id UUID,
  p_service_id UUID,
  p_appointment_date DATE,
  p_appointment_time TEXT,
  p_message TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_appointment_id UUID;
  v_reference TEXT;
  v_doctor_active BOOLEAN;
  v_service_active BOOLEAN;
  v_conflict_count INT;
BEGIN
  -- 1. Patient info validation
  IF trim(p_patient_name) IS NULL OR length(trim(p_patient_name)) < 2 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Patient name is required and must be at least 2 characters.');
  END IF;

  IF trim(p_phone) IS NULL OR length(trim(p_phone)) < 7 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Valid phone number is required.');
  END IF;

  IF trim(p_email) IS NULL OR p_email NOT LIKE '%@%.%' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Valid email address is required.');
  END IF;

  -- 2. Past date validation
  IF p_appointment_date < CURRENT_DATE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Appointment date cannot be in the past.');
  END IF;

  -- 3. Doctor validation (if doctor_id provided)
  IF p_doctor_id IS NOT NULL THEN
    SELECT is_active INTO v_doctor_active FROM public.doctors WHERE id = p_doctor_id;
    IF v_doctor_active IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'Selected specialist does not exist.');
    ELSIF v_doctor_active = false THEN
      RETURN jsonb_build_object('success', false, 'error', 'Selected specialist is currently not available for bookings.');
    END IF;
  END IF;

  -- 4. Service validation (if service_id provided)
  IF p_service_id IS NOT NULL THEN
    SELECT is_active INTO v_service_active FROM public.services WHERE id = p_service_id;
    IF v_service_active IS NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'Selected clinical service does not exist.');
    ELSIF v_service_active = false THEN
      RETURN jsonb_build_object('success', false, 'error', 'Selected clinical service is currently inactive.');
    END IF;
  END IF;

  -- 5. Race condition & conflict check
  IF p_doctor_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_conflict_count
    FROM public.appointments
    WHERE doctor_id = p_doctor_id
      AND appointment_date = p_appointment_date
      AND appointment_time = p_appointment_time
      AND status IN ('pending', 'confirmed');

    IF v_conflict_count > 0 THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'This appointment slot is no longer available. Please select another time.',
        'conflict', true
      );
    END IF;
  END IF;

  -- 6. Insert new pending appointment
  INSERT INTO public.appointments (
    patient_name,
    phone,
    email,
    doctor_id,
    service_id,
    appointment_date,
    appointment_time,
    message,
    status
  ) VALUES (
    trim(p_patient_name),
    trim(p_phone),
    lower(trim(p_email)),
    p_doctor_id,
    p_service_id,
    p_appointment_date,
    p_appointment_time,
    p_message,
    'pending'
  )
  RETURNING id INTO v_appointment_id;

  v_reference := public.generate_appointment_reference(v_appointment_id);

  RETURN jsonb_build_object(
    'success', true,
    'appointment_id', v_appointment_id,
    'reference', v_reference,
    'status', 'pending',
    'message', 'Appointment request submitted successfully. The clinic will confirm your appointment.'
  );

EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'This appointment slot was just booked by another patient. Please select another time.',
      'conflict', true
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. POSTERS TABLE & RLS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.posters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  highlights TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.posters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active posters"
  ON public.posters FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated staff can manage posters"
  ON public.posters FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 11. DOCTOR SALARIES TABLE (Strictly Confidential - Admin Only)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.doctor_salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  contract_type TEXT NOT NULL DEFAULT 'monthly',
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.doctor_salaries ENABLE ROW LEVEL SECURITY;

-- Deny all public access; only authenticated admin role can view/edit
CREATE POLICY "Admin clearance required for doctor salaries"
  ON public.doctor_salaries FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 12. PATIENT REVIEWS & RATINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.patient_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
  appointment_ref TEXT DEFAULT '',
  admin_note TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.patient_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved reviews"
  ON public.patient_reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Public can submit pending reviews"
  ON public.patient_reviews FOR INSERT
  WITH CHECK (status = 'pending');

CREATE POLICY "Staff can moderate reviews"
  ON public.patient_reviews FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

