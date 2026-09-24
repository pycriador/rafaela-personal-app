import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  children?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, children, error, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`w-full bg-white dark:bg-dark-card border ${
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/15'
              : 'border-slate-200/90 dark:border-dark-border focus:border-emerald-600 dark:focus:border-emerald-400 focus:ring-emerald-500/15'
          } text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all py-2 px-3 shadow-2xs cursor-pointer ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-white dark:bg-dark-card text-slate-900 dark:text-slate-100"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
        {helperText && !error && <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
