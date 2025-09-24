import React, { useState } from 'react';

type CheckboxVariant = 'default' | 'neural' | 'glass' | 'ai';
type CheckboxSize = 'sm' | 'md' | 'lg';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  className?: string;
  variant?: CheckboxVariant;
  size?: CheckboxSize;
  indeterminate?: boolean;
  glow?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ 
  label, 
  error, 
  className = '',
  variant = 'default',
  size = 'md',
  indeterminate = false,
  glow = false,
  checked,
  disabled,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const labelSizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  const variantClasses = {
    default: 'border-2 border-border rounded bg-white text-primary focus:ring-primary/50',
    neural: 'border-2 border-neural-300/50 rounded-lg bg-neural-50/80 text-ai-cyan focus:ring-ai-cyan/30 hover:border-neural-400/50',
    glass: 'border-2 border-white/30 rounded-lg bg-white/10 backdrop-blur-sm text-ai-cyan focus:ring-ai-cyan/30 hover:border-white/50',
    ai: 'border-2 border-ai-cyan/30 rounded-lg bg-gradient-to-br from-neural-50/50 to-ai-cyan/5 text-ai-cyan focus:ring-ai-cyan/30 hover:border-ai-cyan/50'
  };
  
  const baseClasses = 'transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  const glowClass = glow ? 'animate-glow' : '';
  const focusClass = isFocused && variant === 'ai' ? 'shadow-lg shadow-ai-cyan/20' : '';
  
  return (
    <div className="flex items-start space-x-3">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          className={`
            ${baseClasses} 
            ${sizeClasses[size]} 
            ${variantClasses[variant]} 
            ${glowClass} 
            ${focusClass}
            ${error ? 'border-ai-pink focus:ring-ai-pink/30' : ''} 
            ${className}
          `}
          checked={checked}
          disabled={disabled}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        
        {/* 自定義勾選標記 */}
        {(checked || indeterminate) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {indeterminate ? (
              <svg className="w-3 h-3 text-current" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        )}
        
        {/* AI 風格光效 */}
        {variant === 'ai' && (checked || isFocused) && (
          <div className="absolute inset-0 rounded-lg opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-ai-cyan/20 to-ai-purple/20 animate-pulse" />
          </div>
        )}
      </div>
      
      {label && (
        <div className="flex-1">
          <label 
            className={`
              block font-medium text-neural-700 cursor-pointer transition-colors duration-300
              ${labelSizeClasses[size]}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-neural-900'}
            `}
            onClick={(e) => {
              if (!disabled) {
                const checkbox = e.currentTarget.parentElement?.querySelector('input[type="checkbox"]') as HTMLInputElement;
                checkbox?.click();
              }
            }}
          >
            {label}
            {props.required && <span className="text-ai-pink ml-1">*</span>}
          </label>
          
          {error && (
            <div className="mt-1 flex items-center space-x-1">
              <svg className="w-4 h-4 text-ai-pink" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-ai-pink animate-fade-in">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Checkbox;