import React from 'react';
import { clinicInfo } from '../../data/clinicInfo';

interface SocialLinksProps {
  className?: string;
  variant?: 'footer' | 'contact' | 'compact';
}

export const SocialLinks: React.FC<SocialLinksProps> = ({
  className = '',
  variant = 'footer',
}) => {
  const { socialMedia } = clinicInfo;

  const socialItems = [
    {
      name: 'Facebook',
      url: socialMedia.facebook_url,
      label: 'Visit Lady Doctor Clinic on Facebook',
      bgColor: 'hover:bg-blue-600',
      textColor: 'text-blue-400 group-hover:text-white',
      borderColor: 'hover:border-blue-500',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      url: socialMedia.instagram_url,
      label: 'Follow Lady Doctor Clinic on Instagram',
      bgColor: 'hover:bg-gradient-to-tr hover:from-amber-600 hover:via-rose-600 hover:to-purple-600',
      textColor: 'text-rose-400 group-hover:text-white',
      borderColor: 'hover:border-rose-500',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: 'TikTok',
      url: socialMedia.tiktok_url,
      label: 'Watch Health Videos on TikTok',
      bgColor: 'hover:bg-slate-900',
      textColor: 'text-cyan-400 group-hover:text-white',
      borderColor: 'hover:border-cyan-400',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43 5.92 5.92 0 0 0 1.91-4.34V8.76a8.28 8.28 0 0 0 4.82 1.55v-3.62h-1z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      url: socialMedia.youtube_url,
      label: 'Watch Health Education on YouTube',
      bgColor: 'hover:bg-red-600',
      textColor: 'text-red-400 group-hover:text-white',
      borderColor: 'hover:border-red-500',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  // Only render active URLs that are not empty strings
  const activeSocials = socialItems.filter((item) => Boolean(item.url && item.url.trim() !== ''));

  if (activeSocials.length === 0) {
    return null;
  }

  if (variant === 'contact') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex flex-wrap items-center gap-2.5">
          {activeSocials.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
              className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs hover:shadow-sm transition-all duration-200 hover:text-white ${item.bgColor} ${item.borderColor}`}
            >
              <span className={`transition-colors ${item.textColor}`}>{item.icon}</span>
              <span>{item.name}</span>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {activeSocials.map((item) => (
        <a
          key={item.name}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.label}
          title={item.name}
          className={`group w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800 border border-slate-700 text-slate-300 transition-all duration-200 hover:scale-105 ${item.bgColor} ${item.borderColor}`}
        >
          <span className={`transition-colors ${item.textColor}`}>{item.icon}</span>
        </a>
      ))}
    </div>
  );
};
