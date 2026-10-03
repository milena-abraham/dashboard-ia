import React from 'react';
import { cn } from '@/lib/utils';
import { playMioDevSound } from '@/lib/sound';

export interface BubbleArrowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'dark' | 'light' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
  href?: string;
  className?: string;
  onClick?: () => void;
}

export const BubbleArrowButton: React.FC<BubbleArrowButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  asLink = false,
  href,
  className,
  onClick,
  disabled,
  ...props
}) => {
  // Neo-Brutalist Swiss styling strictly adhering to BRANDING.md & rounded-none
  const variantStyles = {
    primary: {
      btn: 'bg-[#bdf559] text-zinc-950 border-zinc-950 dark:border-white shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_#bdf559]',
      content: 'bg-[#bdf559] text-zinc-950',
      arrow: 'bg-zinc-950 text-[#bdf559] group-hover:bg-zinc-900 group-hover:text-white',
    },
    dark: {
      btn: 'bg-zinc-950 text-white border-white/20 shadow-[4px_4px_0_#bdf559]',
      content: 'bg-zinc-950 text-white',
      arrow: 'bg-white/10 text-white border-l-2 border-white/20 group-hover:bg-white group-hover:text-black',
    },
    light: {
      btn: 'bg-white text-zinc-950 border-zinc-950 shadow-[4px_4px_0_#000]',
      content: 'bg-white text-zinc-950',
      arrow: 'bg-zinc-100 text-zinc-950 border-l-2 border-zinc-950 group-hover:bg-zinc-200',
    },
    outline: {
      btn: 'bg-transparent text-current border-current shadow-[4px_4px_0_#000]',
      content: 'bg-transparent text-current',
      arrow: 'bg-transparent text-current border-l-2 border-current',
    },
  };

  const sizeStyles = {
    sm: {
      height: 'h-10',
      fontSize: 'text-xs',
      px: 'px-4',
      arrowSize: 'w-10 h-full',
    },
    md: {
      height: 'h-12',
      fontSize: 'text-xs sm:text-sm',
      px: 'px-5',
      arrowSize: 'w-11 sm:w-12 h-full',
    },
    lg: {
      height: 'h-13 sm:h-14',
      fontSize: 'text-xs sm:text-sm',
      px: 'px-6',
      arrowSize: 'w-12 sm:w-14 h-full',
    },
  };

  const v = variantStyles[variant];
  const s = sizeStyles[size];

  const arrowSvg = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
    >
      <polyline points="7 17 17 7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );

  const inner = (
    <span
      className={cn(
        'group relative inline-flex items-center overflow-hidden rounded-none border-2 font-mono font-bold tracking-wider select-none cursor-pointer transition-all duration-100 ease-out active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
        s.height,
        v.btn,
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      {/* Button Content */}
      <span
        className={cn(
          'flex items-center justify-center h-full whitespace-nowrap uppercase',
          s.px,
          s.fontSize,
          v.content
        )}
      >
        <span>{children}</span>
      </span>

      {/* Trailing Square Arrow Block */}
      <span
        className={cn(
          'flex items-center justify-center shrink-0 border-l-2 border-inherit transition-colors duration-200',
          s.arrowSize,
          v.arrow
        )}
        aria-hidden="true"
      >
        {arrowSvg}
      </span>
    </span>
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playMioDevSound('select');
    if (onClick) onClick(e as unknown as any);
  };

  if (asLink && href) {
    return (
      <a
        href={href}
        data-target-lock="true"
        onClick={() => playMioDevSound('select')}
        className="inline-block no-underline btn-mechanical"
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      data-target-lock="true"
      onClick={handleClick}
      disabled={disabled}
      {...props}
      className="bg-transparent border-0 p-0 m-0 btn-mechanical"
    >
      {inner}
    </button>
  );
};

export default BubbleArrowButton;
