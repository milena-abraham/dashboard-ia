import React from 'react';

export interface SectionPlateProps {
  index: string;
  label: string;
  tag?: string;
  className?: string;
}

/**
 * SectionPlate:
 * Neo-brutalist square instrument-panel section index tag (01/06 ... 06/06).
 * Replaces generic rounded pills with mechanical, high-contrast metrology plates.
 */
export const SectionPlate: React.FC<SectionPlateProps> = ({
  index,
  label,
  tag,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-stretch border border-black dark:border-white/20 bg-white dark:bg-[#0e0c19] text-black dark:text-white shadow-[2px_2px_0_#111111] dark:shadow-[2px_2px_0_#7647eb] select-none text-[11px] font-mono tracking-wider uppercase ${className}`}
    >
      <span className="px-2.5 py-1 bg-[#111111] text-[#bdf559] dark:bg-[#7647eb] dark:text-white font-bold flex items-center justify-center border-r border-black dark:border-white/20 shrink-0">
        {index}
      </span>
      <span className="px-3 py-1 flex items-center font-medium tracking-wide shrink-0">
        {label}
      </span>
      {tag && (
        <span className="hidden sm:flex px-2.5 py-1 items-center border-l border-black/15 dark:border-white/10 text-zinc-500 dark:text-zinc-400 text-[10px] tracking-normal font-normal shrink-0">
          {tag}
        </span>
      )}
    </div>
  );
};

export default SectionPlate;
