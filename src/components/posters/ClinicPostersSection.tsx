import React, { useState, useEffect } from 'react';
import { ClinicPoster } from '../../types/poster';
import { fetchPosters } from '../../lib/supabase/posters';
import { useRouter, Link } from '../../context/RouterContext';
import { clinicInfo } from '../../data/clinicInfo';
import {
  Sparkles,
  Printer,
  Calendar,
  Phone,
  Eye,
  X,
  CheckCircle2,
  Image as ImageIcon,
  ChevronRight,
  ShieldCheck,
  Share2,
  Clock,
  ArrowRight,
  Heart,
} from 'lucide-react';

interface ClinicPostersSectionProps {
  title?: string;
  subtitle?: string;
  showAllButton?: boolean;
  limit?: number;
}

export const ClinicPostersSection: React.FC<ClinicPostersSectionProps> = ({
  title = 'Clinic Updates & Awareness Posters',
  subtitle = "Official patient guides and specialized healthcare announcements designed by Lady Doctor Clinic's clinical team.",
  showAllButton = true,
  limit,
}) => {
  const { navigate } = useRouter();
  const [posters, setPosters] = useState<ClinicPoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoster, setSelectedPoster] = useState<ClinicPoster | null>(null);
  const [printSuccessToast, setPrintSuccessToast] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchPosters(true).then((data) => {
      if (mounted) {
        setPosters(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const displayPosters = limit ? posters.slice(0, limit) : posters;

  const handlePrintPoster = (poster: ClinicPoster) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${poster.title} – Lady Doctor Clinic</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #e11d48; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .badge { background: #ffe4e6; color: #9f1239; padding: 6px 12px; border-radius: 9999px; font-size: 13px; font-weight: bold; text-transform: uppercase; }
            h1 { font-size: 28px; margin: 15px 0 5px 0; color: #0f172a; }
            .tagline { color: #64748b; font-size: 14px; margin-bottom: 25px; }
            .desc { font-size: 16px; line-height: 1.7; color: #334155; margin-bottom: 30px; }
            .highlights { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 30px; }
            .highlights h3 { margin-top: 0; font-size: 16px; color: #0f172a; }
            .highlights ul { padding-left: 20px; margin-bottom: 0; }
            .highlights li { margin-bottom: 8px; font-size: 14px; }
            .footer { margin-top: 50px; border-top: 1px solid #cbd5e1; padding-top: 20px; font-size: 13px; color: #64748b; display: flex; justify-content: space-between; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <strong style="color: #e11d48; font-size: 20px;">Lady Doctor Clinic</strong>
              <div style="font-size: 13px; color: #64748b;">Near Inspire Business Academy, Sadiqabad</div>
            </div>
            <div class="badge">${poster.theme}</div>
          </div>
          <h1>${poster.title}</h1>
          <div class="tagline">Official Clinical Guidance Poster · Display Priority #${poster.display_order}</div>
          <p class="desc">${poster.description}</p>
          ${
            poster.highlights && poster.highlights.length > 0
              ? `
              <div class="highlights">
                <h3>Key Clinical Services & Inclusions</h3>
                <ul>
                  ${poster.highlights.map((h) => `<li>${h}</li>`).join('')}
                </ul>
              </div>
            `
              : ''
          }
          <div class="footer">
            <div><strong>Appointments & Helpline:</strong> ${clinicInfo.phone} · WhatsApp: ${clinicInfo.whatsapp}</div>
            <div>Strictly Verified Information</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setPrintSuccessToast(true);
    setTimeout(() => setPrintSuccessToast(false), 3000);
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-slate-50/60 border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100/80 text-rose-800 border border-rose-200 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>Official Clinic Posters & Updates</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {showAllButton && (
            <Link
              to="/posters"
              className="inline-flex items-center gap-2 text-xs font-bold text-rose-700 hover:text-rose-800 transition-colors self-start md:self-end"
            >
              <span>Explore All 5 Posters</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Posters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayPosters.map((poster, idx) => (
            <div
              key={poster.id}
              className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden hover:border-rose-300"
            >
              {/* Poster Visual Header */}
              <div className="relative aspect-4/3 bg-linear-to-br from-rose-950 via-slate-900 to-slate-950 overflow-hidden flex items-center justify-center p-6 text-white text-center cursor-pointer"
                onClick={() => setSelectedPoster(poster)}
              >
                {poster.image_url ? (
                  <img
                    src={poster.image_url}
                    alt={poster.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="space-y-3 z-10 max-w-xs">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mx-auto flex items-center justify-center text-rose-300 shadow-inner group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-200 border border-rose-500/30">
                      Poster #{poster.display_order} · {poster.theme}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white line-clamp-2">
                      {poster.title}
                    </h3>
                    <div className="text-[11px] text-slate-300/80 bg-slate-900/60 px-3 py-1 rounded-lg border border-white/10">
                      Awaiting official clinic photo upload
                    </div>
                  </div>
                )}

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-xs font-semibold text-white backdrop-blur-2xs">
                  <Eye className="w-4 h-4" />
                  <span>Click to Expand Poster</span>
                </div>
              </div>

              {/* Poster Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                      {poster.theme}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      Order #{poster.display_order}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                    {poster.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {poster.description}
                  </p>
                </div>

                {/* Highlights List */}
                {poster.highlights && poster.highlights.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-1.5">
                    {poster.highlights.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions Bar */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPoster(poster)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Poster</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePrintPoster(poster)}
                      title="Print or Save this poster"
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/appointment')}
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors cursor-pointer"
                    >
                      <span>Book Visit</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPoster && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedPoster(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative text-slate-900 border border-slate-200 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedPoster(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close poster view"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Poster Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 mb-2">
                <span>{selectedPoster.theme}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {selectedPoster.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Official Clinical Notice · Priority Order #{selectedPoster.display_order}
              </p>
            </div>

            {/* Visual Header / Placeholder */}
            <div className="relative aspect-16/9 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center p-6 text-center text-white border border-slate-800 shadow-inner">
              {selectedPoster.image_url ? (
                <img
                  src={selectedPoster.image_url}
                  alt={selectedPoster.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="space-y-3 max-w-md">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 mx-auto flex items-center justify-center text-rose-400 border border-white/20">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-bold text-white">{selectedPoster.title}</h4>
                  <p className="text-xs text-slate-300">
                    High-resolution official printed poster on display in our clinical reception.
                  </p>
                </div>
              )}
            </div>

            {/* Detailed Description */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Clinical Overview & Instructions
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {selectedPoster.description}
              </p>
            </div>

            {/* Inclusions / Highlights */}
            {selectedPoster.highlights && selectedPoster.highlights.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Key Department Standards & Offerings
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedPoster.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-teal-50/60 border border-teal-100 flex items-start gap-2 text-xs text-teal-950 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clinic Contact & Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-900">Direct Helpline:</span>{' '}
                <a href={`tel:${clinicInfo.phoneFormatted}`} className="text-rose-700 font-bold hover:underline">
                  {clinicInfo.phone}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintPoster(selectedPoster)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Poster</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPoster(null);
                    navigate('/appointment');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Success Toast */}
      {printSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>Poster print dialogue opened.</span>
        </div>
      )}
    </section>
  );
};
