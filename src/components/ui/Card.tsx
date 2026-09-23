import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        'bg-white dark:bg-dark-card border border-slate-200/70 dark:border-dark-border rounded-2xl p-5 sm:p-6 shadow-xs transition-all duration-150',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={twMerge('flex flex-col space-y-1 pb-4 sm:pb-5', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <h3 className={twMerge('text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight leading-snug', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <p className={twMerge('text-xs sm:text-sm text-slate-500 dark:text-dark-muted leading-relaxed', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => <div className={className} {...props}>{children}</div>;
