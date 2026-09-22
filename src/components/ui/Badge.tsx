import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantStyles = {
    brand: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    info: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
    neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
