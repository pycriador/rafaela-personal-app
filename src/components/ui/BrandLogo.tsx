import React from 'react';

export interface BrandLogoProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show the container squircle background or just the raw SVG mark */
  variant?: 'box' | 'plain';
  /** Optional custom class name for the wrapper */
  className?: string;
  /** Optional custom class name for the SVG itself */
  svgClassName?: string;
}

const sizeConfig = {
  sm: {
    box: 'w-8 h-8 rounded-xl',
    svg: 'w-[18px] h-[18px]',
  },
  md: {
    box: 'w-9 h-9 rounded-xl',
    svg: 'w-[22px] h-[22px]',
  },
  lg: {
    box: 'w-11 h-11 rounded-2xl',
    svg: 'w-6 h-6',
  },
  xl: {
    box: 'w-14 h-14 rounded-2xl',
    svg: 'w-8 h-8',
  },
};

/**
 * BrandLogo — Rafaela Personal Trainer
 * 
 * Custom bespoke vector mark for "Rafaela":
 * - Left vertical axis (Spine / Stability / Biomechanical alignment)
 * - Upper loop (Range of Motion / Precision movement arc)
 * - Diagonal blade leg (Kinetic energy / Athletic velocity & performance)
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'box',
  className = '',
  svgClassName = '',
}) => {
  const config = sizeConfig[size] || sizeConfig.md;

  const svgElement = (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${config.svg} ${svgClassName} shrink-0`}
      aria-label="Logo Rafaela Personal"
    >
      {/* 1. Biomechanical Column (Spine / Core Alignment) */}
      <rect
        x="5.5"
        y="4.5"
        width="4.5"
        height="23"
        rx="2.25"
        className="fill-emerald-500"
      />

      {/* 2. Kinetic Movement Arc (Upper ROM Loop with true negative space cutout) */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 4.5H18C22.1421 4.5 25.5 7.85786 25.5 12C25.5 16.1421 22.1421 19.5 18 19.5H10V4.5ZM14.5 9H17.5C19.1569 9 20.5 10.3431 20.5 12C20.5 13.6569 19.1569 15 17.5 15H14.5V9Z"
        className="fill-slate-100 dark:fill-white"
      />

      {/* 3. Velocity Blade Leg (Dynamic Athletic Forward Stride) */}
      <path
        d="M15.5 17L24.2 26.8C24.7 27.3 24.3 28 23.5 28H19.5C18.9 28 18.3 27.7 17.9 27.2L12 20.5L15.5 17Z"
        className="fill-emerald-500"
      />
    </svg>
  );

  if (variant === 'plain') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {svgElement}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center bg-slate-900 dark:bg-dark-cardElevated border border-slate-800/80 dark:border-white/[0.08] shadow-2xs transition-all ${config.box} ${className}`}
    >
      {svgElement}
    </div>
  );
};

export default BrandLogo;
