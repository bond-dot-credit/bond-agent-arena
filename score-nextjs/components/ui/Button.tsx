'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1172e1]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variant === 'primary' ? 'bg-[#1172e1] text-white hover:bg-[#1575e4]' : ''}
          ${variant === 'secondary' ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : ''}
          ${variant === 'outline' ? 'border-2 border-[#1172e1]/30 text-[#1172e1] hover:bg-[#1172e1]/5' : ''}
          ${variant === 'ghost' ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' : ''}
          ${size === 'sm' ? 'px-3 py-1.5 text-sm' : ''}
          ${size === 'md' ? 'px-4 py-2 text-sm' : ''}
          ${size === 'lg' ? 'px-6 py-3 text-base' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading && (
          <svg
            className="w-4 h-4 mr-2 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
