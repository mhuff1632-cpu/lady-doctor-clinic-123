import React, { useState } from 'react';
import { useRouter, Link } from '../../context/RouterContext';
import { Menu, X, Calendar, Phone, Heart } from 'lucide-react';
import { clinicInfo } from '../../data/clinicInfo';

export const Header: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Doctors', path: '/doctors' },
    { label: 'Services', path: '/services' },
    { label: 'Posters', path: '/posters' },
    { label: 'Virtual Tour', path: '/tour' },
    { label: 'Appointment', path: '/appointment' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top subtle emergency / contact announcement strip */}
      <div className="bg-rose-50/70 border-b border-rose-100/60 px-4 py-1.5 text-xs text-rose-950 font-normal">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-500/20 shrink-0" />
            <span className="truncate">Women & Children’s Practice · Near Inspire Business Academy, Sadiqabad</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-600">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-rose-600" />
              <span>Direct: {clinicInfo.phone}</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Mon–Fri: 8:30 AM – 6:30 PM</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <Link to="/lookup" className="text-slate-700 hover:text-rose-700 font-medium transition-colors">
              Track Appointment
            </Link>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <Link to="/admin/login" className="text-rose-700 hover:text-rose-900 font-medium">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar — strict 3-zone contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark (Single clean element) */}
        <Link
          to="/"
          className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 hover:text-rose-700 transition-colors flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
          <span>Lady Doctor Clinic</span>
        </Link>

        {/* Zone 2: Navigation Links (Text with subtle hover underline) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {navLinks.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative py-1 transition-colors ${
                  isActive
                    ? 'text-rose-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/appointment')}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs hover:shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-rose-700 whitespace-nowrap cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-rose-600 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-rose-50 text-rose-800 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/appointment');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
            <Link
              to="/lookup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
            >
              <span>Track Appointment Status</span>
            </Link>
            <a
              href={`tel:${clinicInfo.phoneFormatted}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>Call Clinic ({clinicInfo.phone})</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
