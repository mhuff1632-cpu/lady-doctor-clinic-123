import React, { useEffect } from 'react';
import { RouterProvider, useRouter } from './context/RouterContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/admin/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { ServicesPage } from './pages/ServicesPage';
import { AppointmentPage } from './pages/AppointmentPage';
import { AppointmentLookupPage } from './pages/AppointmentLookupPage';
import { ContactPage } from './pages/ContactPage';
import { PostersPage } from './pages/PostersPage';
import { HospitalTourPage } from './pages/HospitalTourPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminDoctorsPage } from './pages/admin/AdminDoctorsPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { AdminInquiriesPage } from './pages/admin/AdminInquiriesPage';
import { AdminPostersPage } from './pages/admin/AdminPostersPage';
import { AdminSalariesPage } from './pages/admin/AdminSalariesPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';

const AppContent: React.FC = () => {
  const { currentPath } = useRouter();

  // Dynamic Title Management for SEO, Accessibility & Clinical Portal
  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Lady Doctor Clinic – Women-Focused Healthcare & Consultations',
      '/about': 'About Us – Lady Doctor Clinic | Mission & Clinical Philosophy',
      '/doctors': 'Our Lady Doctors – Board-Certified Specialists Directory',
      '/services': 'Medical Services & Diagnostics – Lady Doctor Clinic',
      '/appointment': 'Book an Appointment – Lady Doctor Clinic',
      '/lookup': 'Track Appointment Status – Lady Doctor Clinic',
      '/status': 'Track Appointment Status – Lady Doctor Clinic',
      '/appointment-lookup': 'Track Appointment Status – Lady Doctor Clinic',
      '/appointment/lookup': 'Track Appointment Status – Lady Doctor Clinic',
      '/posters': 'Official Healthcare Posters & Updates – Lady Doctor Clinic',
      '/tour': 'Virtual Hospital Video Tour – Lady Doctor Clinic Walkthrough',
      '/contact': 'Contact & Location – Lady Doctor Clinic',
      '/admin/login': 'Staff Login – Lady Doctor Clinic Portal',
      '/admin': 'Clinical Dashboard – Lady Doctor Clinic Management',
      '/admin/doctors': 'Manage Doctors – Lady Doctor Clinic Portal',
      '/admin/services': 'Manage Services – Lady Doctor Clinic Portal',
      '/admin/appointments': 'Manage Appointments – Lady Doctor Clinic Portal',
      '/admin/inquiries': 'Patient Inquiries – Lady Doctor Clinic Portal',
      '/admin/posters': 'Manage Posters – Lady Doctor Clinic Portal',
      '/admin/salaries': 'Doctor Compensation – Lady Doctor Clinic Portal',
      '/admin/reviews': 'Patient Reviews Moderation – Lady Doctor Clinic Portal',
    };

    document.title = titles[currentPath] || 'Lady Doctor Clinic';
  }, [currentPath]);

  // Admin routes handle their own layout and protection
  if (currentPath === '/admin/login') {
    return <AdminLoginPage />;
  }

  if (currentPath === '/admin') {
    return (
      <ProtectedRoute>
        <AdminDashboardPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/admin/doctors') {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDoctorsPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/admin/services') {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminServicesPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/admin/appointments') {
    return (
      <ProtectedRoute>
        <AdminAppointmentsPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/admin/inquiries') {
    return (
      <ProtectedRoute>
        <AdminInquiriesPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/admin/posters') {
    return (
      <ProtectedRoute>
        <AdminPostersPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/admin/salaries') {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminSalariesPage />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/admin/reviews') {
    return (
      <ProtectedRoute>
        <AdminReviewsPage />
      </ProtectedRoute>
    );
  }

  // Public clinic pages wrapped in standard public layout
  const renderPublicPage = () => {
    switch (currentPath) {
      case '/':
        return <HomePage />;
      case '/about':
        return <AboutPage />;
      case '/doctors':
        return <DoctorsPage />;
      case '/services':
        return <ServicesPage />;
      case '/appointment':
        return <AppointmentPage />;
      case '/lookup':
      case '/status':
      case '/appointment-lookup':
      case '/appointment/lookup':
        return <AppointmentLookupPage />;
      case '/posters':
        return <PostersPage />;
      case '/tour':
        return <HospitalTourPage />;
      case '/contact':
        return <ContactPage />;
      default:
        return <HomePage />;
    }
  };

  return <Layout>{renderPublicPage()}</Layout>;
};

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </RouterProvider>
  );
}
