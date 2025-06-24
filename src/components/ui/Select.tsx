import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  label?: string;
  error?: string;
  onChange?: (value: string) => void;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, label, error, onChange, leftAdornment, rightAdornment, id, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftAdornment && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftAdornment}
            </div>
          )}

          <select
            ref={ref}
            id={inputId}
            className={cn(
              'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm',
              leftAdornment && 'pl-10',
              rightAdornment && 'pr-10',
              error && 'border-error-300 focus:border-error-500 focus:ring-error-500',
              className
            )}
            onChange={handleChange}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {rightAdornment && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightAdornment}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-error-600 dark:text-error-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;