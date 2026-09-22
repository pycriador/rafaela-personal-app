import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  subLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'emerald' | 'cyan' | 'amber' | 'rose';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  subLabel,
  size = 'md',
  variant = 'emerald',
  className = '',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    emerald: 'bg-emerald-500',
    cyan: 'bg-cyan-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || subLabel) && (
        <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
          {label && <span className="text-slate-700 dark:text-slate-300">{label}</span>}
          {subLabel && <span className="text-slate-500 dark:text-dark-muted font-mono">{subLabel}</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClasses[variant]}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
