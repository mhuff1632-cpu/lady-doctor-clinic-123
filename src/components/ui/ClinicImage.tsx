import React, { useState } from 'react';
import { ImageOff, Sparkles } from 'lucide-react';

export interface ImageSpecification {
  page: string;
  section: string;
  purpose: string;
  recommendedDimensions: string;
  aspectRatio: string;
  imageStyle: string;
  transparent: boolean;
  mobileSuitability: string;
}

interface ClinicImageProps {
  src?: string;
  alt: string;
  className?: string;
  aspectRatio?: '16/9' | '4/3' | '1/1' | '3/4' | 'auto';
  spec?: ImageSpecification;
  priority?: boolean;
}

export const ClinicImage: React.FC<ClinicImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'auto',
  spec,
  priority = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Normalize image URL: resolve Vite dev-only /src/assets/ paths to production public /images/ paths
  const resolvedSrc = React.useMemo(() => {
    if (!src) return '';
    if (src.startsWith('/src/assets/images/')) {
      return src.replace('/src/assets/images/', '/images/');
    }
    return src;
  }, [src]);

  const aspectClass =
    aspectRatio === '16/9'
      ? 'aspect-[16/9]'
      : aspectRatio === '4/3'
      ? 'aspect-[4/3]'
      : aspectRatio === '1/1'
      ? 'aspect-square'
      : aspectRatio === '3/4'
      ? 'aspect-[3/4]'
      : '';

  // Fallback visual container complying with Zero-Broken-Image Policy
  if (!resolvedSrc || hasError) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-50 via-slate-50 to-teal-50/40 border border-slate-200/80 flex flex-col items-center justify-center p-6 text-center text-slate-500 ${aspectClass} ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-rose-100 flex items-center justify-center text-rose-500 mb-2">
          <ImageOff className="w-5 h-5" />
        </div>
        <p className="text-xs font-medium text-slate-700 max-w-[200px] leading-snug">{alt}</p>
        {spec && (
          <span className="mt-2 text-[10px] text-slate-400 font-mono tracking-tight">
            Target: {spec.recommendedDimensions} · {spec.aspectRatio}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-100 ${aspectClass} ${className}`}
      data-clinic-page={spec?.page}
      data-clinic-section={spec?.section}
      data-recommended-dims={spec?.recommendedDimensions}
    >
      <img
        src={resolvedSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-rose-300 animate-spin" />
        </div>
      )}
    </div>
  );
};
