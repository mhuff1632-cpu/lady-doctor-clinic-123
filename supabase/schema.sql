-- ==============================================================================
-- LADY DOCTOR CLINIC — SUPABASE DATABASE & AUTHENTICATION SCHEMA (PHASE 3)
-- ==============================================================================
-- Run this complete script in the Supabase SQL Editor.
-- Configures: Auth profiles, Role-Based Access Control (RBAC), Tables,
-- Indexes, Triggers, RLS Policies, and Initial Seed Data.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTION: AUTO-UPDATE UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 3. CORE TABLES
-- ==============================================================================

-- 3.1 PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')) DEFAULT 'staff',
  full_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 DOCTORS TABLE
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

-- 3.3 SERVICES TABLE
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

-- 3.4 APPOINTMENTS TABLE
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

-- 3.5 CONTACT INQUIRIES TABLE
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

-- ==============================================================================
-- 4. TRIGGERS FOR UPDATED_AT & AUTH USER CREATION
-- ==============================================================================

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

-- ==============================================================================
-- 5. ROLE SECURITY HELPER FUNCTIONS
-- ==============================================================================

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

-- ==============================================================================
-- 6. INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_doctors_is_active ON public.doctors(is_active);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON public.appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON public.contact_inquiries(status);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 7.1 PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- 7.2 DOCTORS POLICIES
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

-- 7.3 SERVICES POLICIES
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

-- 7.4 APPOINTMENTS POLICIES (Strict Patient Privacy)
DROP POLICY IF EXISTS "Public can submit appointments" ON public.appointments;
CREATE POLICY "Public can submit appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (status = 'pending');

-- Public SELECT is strictly disabled. Only authorized staff/admin can view.
DROP POLICY IF EXISTS "Staff and Admin can view appointments" ON public.appointments;
CREATE POLICY "Staff and Admin can view appointments"
  ON public.appointments FOR SELECT
  USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Staff and Admin can update appointment status" ON public.appointments;
CREATE POLICY "Staff and Admin can update appointment status"
  ON public.appointments FOR UPDATE
  USING (public.is_staff_or_admin());

-- 7.5 CONTACT INQUIRIES POLICIES (Strict Inquiry Privacy)
DROP POLICY IF EXISTS "Public can submit contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Public can submit contact inquiries"
  ON public.contact_inquiries FOR INSERT
  WITH CHECK (status = 'new');

-- Public SELECT is strictly disabled. Only authorized staff/admin can view.
DROP POLICY IF EXISTS "Staff and Admin can view contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Staff and Admin can view contact inquiries"
  ON public.contact_inquiries FOR SELECT
  USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Staff and Admin can update contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Staff and Admin can update contact inquiries"
  ON public.contact_inquiries FOR UPDATE
  USING (public.is_staff_or_admin());

-- ==============================================================================
-- 8. INITIAL CLINIC DATA SEED
-- ==============================================================================

-- Seed Doctors
INSERT INTO public.doctors (
  id, name, qualification, specialization, department, experience, bio,
  image_url, consultation_fee, availability, days_available, is_active
) VALUES
(
  'a1111111-1111-4111-8111-111111111111',
  'Dr. Sarah Khan',
  'MBBS, FCPS (Obs & Gynae), MRCOG (UK)',
  'Senior Obstetrician & Gynecologist',
  'Obstetrics',
  '14+ Years Clinical Experience',
  'Specializing in high-risk pregnancies, maternal-fetal medicine, and minimally invasive gynecological care. Renowned for calm, empathetic bedside guidance.',
  '/src/assets/images/doctor_dr_sarah_khan_1791390148660.jpg',
  '$120',
  'Mon, Wed, Fri (9:00 AM – 3:00 PM)',
  ARRAY['Monday', 'Wednesday', 'Friday'],
  true
),
(
  'a2222222-2222-4222-8222-222222222222',
  'Dr. Amina Rehman',
  'MBBS, MD (Pediatrics), DCH',
  'Consultant Pediatrician & Adolescent Health',
  'Pediatrics',
  '11+ Years Clinical Experience',
  'Dedicated to newborn care, developmental assessments, childhood immunization, and adolescent health.',
  '/src/assets/images/doctor_dr_amina_rehman_1791390165189.jpg',
  '$100',
  'Tue, Thu, Sat (10:00 AM – 4:00 PM)',
  ARRAY['Tuesday', 'Thursday', 'Saturday'],
  true
),
(
  'a3333333-3333-4333-8333-333333333333',
  'Dr. Fatima Al-Zahra',
  'MBBS, MS (Gynecology), Fellowship Reproductive Endocrinology',
  'Reproductive Endocrinology & Fertility Specialist',
  'Gynecology',
  '12+ Years Clinical Experience',
  'Expert in fertility counseling, hormonal balance, PCOS/PCOD management, and pre-conception care.',
  '/src/assets/images/doctor_dr_sarah_khan_1791390148660.jpg',
  '$135',
  'Mon, Tue, Thu (1:00 PM – 6:00 PM)',
  ARRAY['Monday', 'Tuesday', 'Thursday'],
  true
),
(
  'a4444444-4444-4444-8444-444444444444',
  'Dr. Zainab Malik',
  'MBBS, MRCGP, Dip. Women’s Preventative Health',
  'Family Medicine & Women’s Preventive Wellness',
  'Women Wellness',
  '9+ Years Clinical Experience',
  'Focused on comprehensive annual screenings, breast health awareness, menopause management, and preventive care.',
  '/src/assets/images/doctor_dr_amina_rehman_1791390165189.jpg',
  '$95',
  'Wed, Fri, Sat (8:30 AM – 2:30 PM)',
  ARRAY['Wednesday', 'Friday', 'Saturday'],
  true
)
ON CONFLICT (id) DO NOTHING;

-- Seed Services
INSERT INTO public.services (
  id, name, category, description, icon, image_url, duration, features, is_active
) VALUES
(
  'b1111111-1111-4111-8111-111111111111',
  'Obstetrics & Antenatal Care',
  'Maternity',
  'Comprehensive pregnancy monitoring from early conception through delivery planning and postpartum support.',
  'HeartHandshake',
  '/src/assets/images/hero_clinic_care_1791390127095.jpg',
  '45 mins',
  '["Early pregnancy viability checks & dating scans", "Routine trimesters monitoring & fetal Doppler checkups", "Gestational diabetes & pre-eclampsia screenings", "Postpartum physical & mental wellbeing reviews"]'::jsonb,
  true
),
(
  'b2222222-2222-4222-8222-222222222222',
  'General Gynecology & Screening',
  'Gynecology',
  'Confidential consultations for menstrual irregularities, pelvic comfort, routine Pap smears, and gentle breast examinations.',
  'Stethoscope',
  '/src/assets/images/clinic_interior_consultation_1791390183063.jpg',
  '30 mins',
  '["Pap smear and HPV diagnostic screening", "Pelvic discomfort & ultrasound evaluation", "Menstrual cycle regularity & fibroid management", "Safe contraceptive counseling & family planning"]'::jsonb,
  true
),
(
  'b3333333-3333-4333-8333-333333333333',
  'Fertility & Hormone Clinic (PCOS/PCOD)',
  'Endocrinology',
  'Evidence-based hormonal balance strategies combining endocrine lab diagnostics, lifestyle guidance, and cycle monitoring.',
  'Activity',
  '/src/assets/images/clinic_interior_consultation_1791390183063.jpg',
  '45 mins',
  '["Comprehensive endocrine & thyroid panels", "Polycystic ovary syndrome (PCOS/PCOD) management", "Ovulation induction monitoring & fertility advice", "Nutritional guidance for hormone balance"]'::jsonb,
  true
),
(
  'b4444444-4444-4444-8444-444444444444',
  'Pediatrics & Newborn Care',
  'Child Health',
  'Thorough newborn wellness visits, growth milestone evaluations, immunization administration, and childhood illness diagnostics.',
  'Baby',
  '/src/assets/images/doctor_dr_amina_rehman_1791390165189.jpg',
  '30 mins',
  '["Newborn physical checks & jaundice monitoring", "Childhood immunization schedule tracking", "Growth & neuro-developmental assessments", "Common pediatric infections & asthma management"]'::jsonb,
  true
),
(
  'b5555555-5555-4555-8555-555555555555',
  'Menopause & Healthy Aging',
  'Women Wellness',
  'Specialized support navigating physiological changes, bone density preservation, and cardiovascular wellness during mature life.',
  'Sparkles',
  '/src/assets/images/hero_clinic_care_1791390127095.jpg',
  '40 mins',
  '["Perimenopause symptom mapping & relief plans", "Osteoporosis & DEXA bone density review", "Cardiometabolic health checks for mature women", "Sleep, mood & lifestyle optimization"]'::jsonb,
  true
),
(
  'b6666666-6666-4666-8666-666666666666',
  'On-Site Diagnostic Sonography',
  'Diagnostics',
  'Modern non-invasive ultrasound imaging operated with maximum patient comfort and immediate physician review.',
  'ShieldCheck',
  '/src/assets/images/clinic_interior_consultation_1791390183063.jpg',
  '30 mins',
  '["Obstetric 2D & 3D fetal wellbeing scans", "Transvaginal and transabdominal pelvic scans", "Follicular tracking for fertility treatments", "Immediate physician review & digital reporting"]'::jsonb,
  true
)
ON CONFLICT (id) DO NOTHING;
