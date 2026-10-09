import React from 'react';

interface ClinicLogoProps {
  variant?: 'default' | 'light' | 'icon-only' | 'admin';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const ClinicLogo: React.FC<ClinicLogoProps> = ({
  variant = 'default',
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const iconSizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  }[size];

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  }[size];

  const isLight = variant === 'light';
  const isAdmin = variant === 'admin';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Emblem */}
      <div className={`relative ${iconSizeClasses} shrink-0`}>
        <img
          src="/images/logo.svg"
          alt="Lady Doctor Clinic Emblem"
          className="w-full h-full object-contain filter drop-shadow-xs"
          width="44"
          height="44"
          loading="eager"
        />
      </div>

      {variant !== 'icon-only' && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-bold tracking-tight transition-colors ${textSizeClasses} ${
              isLight || isAdmin
                ? 'text-white'
                : 'text-slate-900 group-hover:text-rose-700'
            }`}
          >
            <span>Lady Doctor</span>{' '}
            <span
              className={
                isLight
                  ? 'text-rose-300 font-extrabold'
                  : isAdmin
                  ? 'text-rose-400 font-extrabold'
                  : 'text-rose-700 font-extrabold'
              }
            >
              Clinic
            </span>
          </span>

          {showSubtitle && (
            <span
              className={`text-[9.5px] uppercase tracking-wider font-semibold mt-0.5 ${
                isLight
                  ? 'text-rose-200/80'
                  : isAdmin
                  ? 'text-rose-400 font-mono tracking-widest'
                  : 'text-slate-500'
              }`}
            >
              {isAdmin ? 'Management Portal' : 'Women & Children Healthcare'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
