import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand' | 'outline';
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
    sm: 'px-1.5 py-0.5 text-[10px] rounded-md tracking-tight font-medium',
    md: 'px-2 py-0.5 text-xs rounded-md tracking-tight font-medium',
  };

  const variantStyles = {
    brand: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20',
    info: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20',
    neutral: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08]',
    outline: 'bg-transparent text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-white/[0.12]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 select-none whitespace-nowrap ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
