import React from 'react';

interface SectionHeaderProps {
  kicker?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  kicker,
  title,
  description,
  align = 'center',
  className = '',
}) => {
  const isCentered = align === 'center';

  return (
    <div
      className={`max-w-3xl mb-12 ${
        isCentered ? 'mx-auto text-center' : 'text-left'
      } ${className}`}
    >
      {kicker && (
        <p className="text-xs font-semibold tracking-wider uppercase text-rose-700 mb-2">
          {kicker}
        </p>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 balance leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};
