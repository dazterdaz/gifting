import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const variantStyles: Record<BadgeVariant, string> = {
      primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300',
      secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300',
      success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300',
      error: 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-300',
      warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      outline: 'bg-transparent border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;