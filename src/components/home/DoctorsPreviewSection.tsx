import React, { useState, useEffect } from 'react';
import { useRouter } from '../../context/RouterContext';
import { demoDoctors } from '../../data/doctors';
import { SectionHeader } from '../ui/SectionHeader';
import { ClinicImage } from '../ui/ClinicImage';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Doctor } from '../../types/doctor';
import { fetchActiveDoctors } from '../../lib/supabase/doctors';

interface DoctorsPreviewProps {
  doctors?: Doctor[];
}

export const DoctorsPreviewSection: React.FC<DoctorsPreviewProps> = ({ doctors: initialDoctors }) => {
  const { navigate } = useRouter();
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(initialDoctors || demoDoctors.slice(0, 3));

  useEffect(() => {
    if (!initialDoctors) {
      let isMounted = true;
      fetchActiveDoctors().then((res) => {
        if (isMounted && res.data && res.data.length > 0) {
          setDoctorsList(res.data.slice(0, 3));
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [initialDoctors]);

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          kicker="Specialist Directory"
          title="Meet Our Board-Certified Lady Doctors"
          description="Experienced female practitioners dedicated to attentive listening, clinical excellence, and respectful personalized consultations."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctorsList.map((doctor) => {
            const displayImg =
              doctor.image ||
              doctor.image_url ||
              '/src/assets/images/doctor_dr_sarah_khan_1791390148660.jpg';

            return (
              <div
                key={doctor.id}
                className="bg-[#FAFAFB] rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  {/* Doctor Photo */}
                  <div className="relative overflow-hidden aspect-[4/3] bg-slate-100">
                    <ClinicImage
                      src={displayImg}
                      alt={`Portrait of ${doctor.name}`}
                      aspectRatio="4/3"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      spec={{
                        page: 'Home/Doctors',
                        section: 'Doctors Directory',
                        purpose: `Profile photo for ${doctor.name}`,
                        recommendedDimensions: '800x600',
                        aspectRatio: '4:3',
                        imageStyle: 'Warm professional physician portrait, white lab coat, clean clinic office',
                        transparent: false,
                        mobileSuitability: 'Scales cleanly across mobile and desktop',
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 border border-slate-200/60 shadow-2xs">
                      {doctor.department}
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                      {doctor.name}
                    </h3>
                    <p className="text-xs text-rose-700 font-medium mt-1">
                      {doctor.specialization}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {doctor.qualification}
                    </p>

                    {/* Unboxed metadata: experience & fee */}
                    <div className="mt-3 py-2 border-y border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                      <span>{doctor.experience}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-semibold text-slate-900">Fee: {doctor.consultation_fee}</span>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                      {doctor.bio}
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doctor.availability}</span>
                    </div>
                  </div>
                </div>

                {/* Appointment Action */}
                <div className="p-6 pt-0 mt-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/appointment?doctor=${doctor.id}`)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book with {doctor.name.split(' ')[1] || doctor.name}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View all doctors footer */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => navigate('/doctors')}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <span>View All Doctors & Schedule Profiles</span>
            <ArrowRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </section>
  );
};
