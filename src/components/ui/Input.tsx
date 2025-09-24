import React, { useState } from 'react';

type InputVariant = 'default' | 'neural' | 'glass' | 'ai';
type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  className?: string;
  variant?: InputVariant;
  size?: InputSize;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  loading?: boolean;
  glow?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  className = '',
  variant = 'default',
  size = 'md',
  icon,
  suffix,
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
  
  const baseClasses = 'w-full transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const glowClass = glow ? 'animate-glow' : '';
  const focusClass = isFocused && variant === 'ai' ? 'shadow-lg shadow-ai-cyan/20' : '';
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neural-700 mb-2 transition-colors duration-300">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neural-400">
            {icon}
          </div>
        )}
        
        <input
          className={`
            ${baseClasses}
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${glowClass}
            ${focusClass}
            ${icon ? 'pl-10' : ''}
            ${suffix ? 'pr-10' : ''}
            ${className}
          `}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled || loading}
          {...props}
        />
        
        {(suffix || loading) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-ai-cyan border-t-transparent" />
            ) : (
              suffix
            )}
          </div>
        )}
        
        {/* AI風格裝飾線 */}
        {variant === 'ai' && isFocused && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ai-cyan to-ai-purple animate-pulse" />
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;