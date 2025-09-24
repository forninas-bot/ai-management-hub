import React, { useState } from 'react';

type SelectVariant = 'default' | 'neural' | 'glass' | 'ai';
type SelectSize = 'sm' | 'md' | 'lg';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  className?: string;
  variant?: SelectVariant;
  size?: SelectSize;
  options: SelectOption[];
  placeholder?: string;
  loading?: boolean;
  glow?: boolean;
}

const Select: React.FC<SelectProps> = ({ 
  label, 
  error, 
  className = '',
  variant = 'default',
  size = 'md',
  options,
  placeholder = '請選擇...',
  loading = false,
  glow = false,
  disabled,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base'
  };
  
  const variantClasses = {
    default: 'border border-border rounded-lg bg-white text-dark focus:ring-primary/50 focus:border-transparent',
    neural: 'neural-card bg-neural-50/80 text-neural-700 border border-neural-200/50 hover:border-neural-300/50 focus:border-ai-cyan/50 focus:ring-ai-cyan/30',
    glass: 'glass-card text-neural-700 backdrop-blur-xl border border-white/20 hover:border-white/30 focus:border-ai-cyan/50 focus:ring-ai-cyan/30',
    ai: 'bg-gradient-to-r from-neural-50/50 to-ai-cyan/5 border border-ai-cyan/30 text-neural-700 focus:border-ai-cyan focus:ring-ai-cyan/30 hover:border-ai-cyan/50'
  };
  
  const baseClasses = 'w-full transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer';
  const glowClass = glow ? 'animate-glow' : '';
  const focusClass = isFocused && variant === 'ai' ? 'shadow-lg shadow-ai-cyan/20' : '';
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neural-700 mb-2 transition-colors duration-300">
          {label}
          {props.required && <span className="text-ai-pink ml-1">*</span>}
        </label>
      )}
      
      <div className="relative group">
        <select
          className={`
            ${baseClasses} 
            ${sizeClasses[size]} 
            ${variantClasses[variant]} 
            ${glowClass} 
            ${focusClass}
            ${error ? 'border-ai-pink focus:border-ai-pink focus:ring-ai-pink/30' : ''} 
            ${className}
            pr-10
          `}
          disabled={disabled || loading}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* 下拉箭頭 */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {loading ? (
            <div className="w-4 h-4 border-2 border-ai-cyan border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg 
              className={`w-4 h-4 transition-colors duration-300 ${
                isFocused ? 'text-ai-cyan' : 'text-neural-500'
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
        
        {/* AI 風格光效 */}
        {variant === 'ai' && isFocused && (
          <div className="absolute inset-0 rounded-lg opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-ai-cyan/20 via-transparent to-ai-purple/20 animate-pulse" />
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 flex items-center space-x-1">
          <svg className="w-4 h-4 text-ai-pink" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-ai-pink animate-fade-in">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Select;