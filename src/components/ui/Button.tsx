import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    type = 'button',
    ...props 
  }, ref) => {
    const variantStyles = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
      secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white shadow-sm',
      success: 'bg-success-600 hover:bg-success-700 text-white shadow-sm',
      danger: 'bg-error-600 hover:bg-error-700 text-white shadow-sm',
      warning: 'bg-warning-600 hover:bg-warning-700 text-white shadow-sm',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800'
    };
    
    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1.5 rounded',
      md: 'text-sm px-4 py-2 rounded-md',
      lg: 'text-base px-6 py-3 rounded-lg'
    };
    
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none dark:focus-visible:ring-offset-gray-900',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {children}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;