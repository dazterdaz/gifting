import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
  as?: 'input' | 'textarea';
  rows?: number;
}

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ className, label, error, leftAdornment, rightAdornment, id, as = 'input', rows = 3, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    
    const Component = as;
    
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
        
        <div className="relative rounded-md shadow-sm">
          {leftAdornment && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftAdornment}
            </div>
          )}
          
          <Component
            ref={ref as any}
            id={inputId}
            rows={as === 'textarea' ? rows : undefined}
            className={cn(
              'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm',
              error && 'border-error-300 focus:border-error-500 focus:ring-error-500',
              leftAdornment && 'pl-10',
              rightAdornment && 'pr-10',
              as === 'textarea' && 'resize-vertical',
              className
            )}
            {...props}
          />
          
          {rightAdornment && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
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

Input.displayName = 'Input';

export default Input;