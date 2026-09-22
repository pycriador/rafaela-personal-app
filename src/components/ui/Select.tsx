import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full bg-slate-50 dark:bg-dark-cardElevated/80 border ${
            error ? 'border-rose-500' : 'border-slate-200 dark:border-dark-border focus:border-emerald-500'
          } text-slate-900 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all py-2.5 px-3.5 ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-dark-card text-slate-900 dark:text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
        {helperText && !error && <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
