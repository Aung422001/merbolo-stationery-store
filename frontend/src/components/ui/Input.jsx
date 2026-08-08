import React from 'react';

export const Input = ({
  label,
  error,
  type = 'text',
  className = '',
  id,
  required = false,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        required={required}
        className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
          error ? 'border-rose-400 focus:ring-rose-400' : 'border-brand-200 hover:border-brand-300'
        }`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
    </div>
  );
};
