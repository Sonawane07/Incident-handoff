import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-on-surface mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:outline-none transition-colors rounded ${error ? 'border-error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error">{error}</p>
      )}
    </div>
  );
};
