import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from '../context/RouterContext';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ClinicImage } from '../components/ui/ClinicImage';
import {
  Calendar,
  Clock,
  DollarSign,
  Award,
  CheckCircle,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Star,
  ShieldCheck,
  Heart,
  Database,
} from 'lucide-react';
import { Doctor } from '../types/doctor';
import { fetchActiveDoctors } from '../lib/supabase/doctors';
import { fetchApprovedReviews } from '../lib/supabase/reviews';
import { PatientReview } from '../types/review';
import { PatientReviewModal } from '../components/ui/PatientReviewModal';

export const DoctorsPage: React.FC = () => {
  const { navigate } = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [reviews, setReviews] = useState<PatientReview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [reviewModalTarget, setReviewModalTarget] = useState<Doctor | null>(null);

  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadDoctors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [res, revs] = await Promise.all([
        fetchActiveDoctors(),
        fetchApprovedReviews(),
      ]);
      setDoctors(res.data);
      setReviews(revs);
      setIsLive(res.isLive);
      if (res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load doctors.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const departments = ['All', 'Obstetrics', 'Gynecology', 'Pediatrics', 'Women Wellness'];

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesDept = selectedDept === 'All' || doc.department === selectedDept;
      const matchesQuery =
        searchQuery === '' ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.bio.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesQuery;
    });
  }, [doctors, selectedDept, searchQuery]);

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Medical Specialists"
          title="Board-Certified Lady Doctors"
          description="Experienced female consultants providing specialized, unhurried consultations across maternity, gynecology, pediatric health, and holistic preventive medicine."
        />

        {/* Database Status Pill / Banner */}
        <div className="mb-6 flex items-center justify-between text-xs text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <Database className={`w-3.5 h-3.5 ${isLive ? 'text-teal-600' : 'text-slate-400'}`} />
            <span>
              Data Source:{' '}
              <strong className="text-slate-800">
                {isLive ? 'Supabase Live Database (public.doctors)' : 'Initial Clinic Catalog'}
              </strong>
            </span>
          </div>
          <button
            type="button"
            onClick={loadDoctors}
            disabled={isLoading}
            className="flex items-center gap-1 text-slate-600 hover:text-rose-700 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="mb-10 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Department segmented filter buttons */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Specialty:</span>
            </span>
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-rose-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctor or specialty..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Loading Skeleton State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row gap-6 animate-pulse"
              >
                <div className="sm:w-2/5 aspect-[4/3] bg-slate-200 rounded-xl"></div>
                <div className="sm:w-3/5 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-12 bg-slate-100 rounded w-full"></div>
                  <div className="h-8 bg-slate-200 rounded w-full mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State with Graceful Retry */}
        {!isLoading && error && (
          <div className="p-6 mb-8 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold">Database Connection Notice</h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Could not refresh live doctor directory from Supabase. Displaying verified initial clinic profiles.
                </p>
                <p className="text-[11px] font-mono text-amber-700 mt-1">Detail: {error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadDoctors}
              className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-amber-300 rounded-lg text-amber-900 hover:bg-amber-100/50 cursor-pointer shrink-0"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredDoctors.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <p className="text-sm font-semibold text-slate-700">No active doctors match the selected filter.</p>
            <p className="text-xs text-slate-500 mt-1">Please try choosing another department or clearing search query.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedDept('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Doctors Grid */}
        {!isLoading && filteredDoctors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredDoctors.map((doctor: Doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-sm transition-all flex flex-col sm:flex-row group"
              >
                {/* Doctor Photo Column */}
                <div className="sm:w-2/5 relative aspect-[4/3] sm:aspect-auto bg-slate-100 shrink-0">
                  <ClinicImage
                    src={doctor.image || doctor.image_url || '/src/assets/images/doctor_dr_sarah_khan_1791390148660.jpg'}
                    alt={`Doctor photo of ${doctor.name}`}
                    className="w-full h-full object-cover"
                    spec={{
                      page: 'Doctors',
                      section: 'Doctor Directory Grid',
                      purpose: `Full profile card portrait for ${doctor.name}`,
                      recommendedDimensions: '800x800',
                      aspectRatio: '1:1 or 4:3',
                      imageStyle: 'Warm natural light, professional medical portrait in clinical setting',
                      transparent: false,
                      mobileSuitability: 'Renders full width on mobile, 40% column on tablet/desktop',
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-800 border border-slate-200/80 shadow-2xs">
                    {doctor.department}
                  </div>
                </div>

                {/* Doctor Details Column */}
                <div className="p-6 sm:w-3/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                          {doctor.name}
                        </h3>
                        <p className="text-xs font-semibold text-rose-700 mt-0.5">
                          {doctor.specialization}
                        </p>
                      </div>

                      {/* Doctor Rating & Review Trigger */}
                      {(() => {
                        const doctorReviews = reviews.filter((r) => r.doctor_id === doctor.id);
                        const docAvg =
                          doctorReviews.length > 0
                            ? (
                                doctorReviews.reduce((sum, r) => sum + r.rating, 0) /
                                doctorReviews.length
                              ).toFixed(1)
                            : '5.0';
                        return (
                          <div className="flex flex-col items-end shrink-0">
                            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{docAvg}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setReviewModalTarget(doctor)}
                              className="text-[10px] text-slate-500 hover:text-rose-700 underline mt-0.5 cursor-pointer"
                            >
                              {doctorReviews.length > 0 ? `${doctorReviews.length} reviews · Add` : 'Leave review'}
                            </button>
                          </div>
                        );
                      })()}
                    </div>

                    <p className="text-xs text-slate-500 font-mono mt-1">
                      {doctor.qualification}
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                      <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{doctor.experience}</span>
                    </div>

                    <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                      {doctor.bio}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doctor.availability}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="font-semibold text-slate-800">
                          Standard Consultation: {doctor.consultation_fee}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/appointment?doctor=${doctor.id}`)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Schedule With {doctor.name.split(' ')[1] || doctor.name}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Clinical Privacy & Patient Reassurance Notice */}
        <div className="mt-12 p-5 rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-2.5 text-slate-800 font-semibold">
            <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
            <span>100% Female Clinical Staff · Respectful, Unhurried Consultation Environment</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/appointment')}
            className="text-xs font-bold text-rose-700 hover:text-rose-800 cursor-pointer"
          >
            Book Next Available Slot &rarr;
          </button>
        </div>

        {/* Review Submission Modal */}
        {reviewModalTarget && (
          <PatientReviewModal
            isOpen={Boolean(reviewModalTarget)}
            onClose={() => setReviewModalTarget(null)}
            defaultDoctorId={reviewModalTarget.id}
            defaultDoctorName={reviewModalTarget.name}
            onSuccess={() => {
              loadDoctors();
            }}
          />
        )}
      </div>
    </div>
  );
};
