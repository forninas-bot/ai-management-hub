import React, { useState, useRef, useEffect } from 'react';

type TextAreaVariant = 'default' | 'neural' | 'glass' | 'ai';
type TextAreaSize = 'sm' | 'md' | 'lg';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  className?: string;
  variant?: TextAreaVariant;
  size?: TextAreaSize;
  autoResize?: boolean;
  maxRows?: number;
  minRows?: number;
  showCount?: boolean;
  maxLength?: number;
  glow?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({ 
  label, 
  error, 
  className = '',
  variant = 'default',
  size = 'md',
  autoResize = false,
  maxRows = 10,
  minRows = 3,
  showCount = false,
  maxLength,
  glow = false,
  disabled,
  value,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-3 py-3 text-sm',
    lg: 'px-4 py-4 text-base'
  };
  
  const variantClasses = {
    default: 'border border-border rounded-lg bg-white text-dark focus:ring-primary/50 focus:border-transparent',
    neural: 'neural-card bg-neural-50/80 text-neural-700 border border-neural-200/50 hover:border-neural-300/50 focus:border-ai-cyan/50 focus:ring-ai-cyan/30',
    glass: 'glass-card text-neural-700 backdrop-blur-xl border border-white/20 hover:border-white/30 focus:border-ai-cyan/50 focus:ring-ai-cyan/30',
    ai: 'bg-gradient-to-br from-neural-50/50 to-ai-cyan/5 border border-ai-cyan/30 text-neural-700 focus:border-ai-cyan focus:ring-ai-cyan/30 hover:border-ai-cyan/50'
  };
  
  const baseClasses = 'w-full transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none';
  const glowClass = glow ? 'animate-glow' : '';
  const focusClass = isFocused && variant === 'ai' ? 'shadow-lg shadow-ai-cyan/20' : '';
  
  // 自動調整高度
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const minHeight = lineHeight * minRows;
      const maxHeight = lineHeight * maxRows;
      
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      
      textarea.style.height = `${newHeight}px`;
    }
  }, [value, autoResize, minRows, maxRows]);
  
  const currentLength = typeof value === 'string' ? value.length : 0;
  const isOverLimit = maxLength ? currentLength > maxLength : false;
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neural-700 mb-2 transition-colors duration-300">
          {label}
          {props.required && <span className="text-ai-pink ml-1">*</span>}
        </label>
      )}
      
      <div className="relative group">
        <textarea
          ref={textareaRef}
          className={`
            ${baseClasses} 
            ${sizeClasses[size]} 
            ${variantClasses[variant]} 
            ${glowClass} 
            ${focusClass}
            ${error || isOverLimit ? 'border-ai-pink focus:border-ai-pink focus:ring-ai-pink/30' : ''} 
            ${className}
          `}
          disabled={disabled}
          value={value}
          maxLength={maxLength}
          rows={autoResize ? minRows : props.rows || minRows}
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
        
        {/* AI 風格光效 */}
        {variant === 'ai' && isFocused && (
          <div className="absolute inset-0 rounded-lg opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-ai-cyan/20 via-transparent to-ai-purple/20 animate-pulse" />
          </div>
        )}
      </div>
      
      {/* 字數統計和錯誤信息 */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {error && (
            <>
              <svg className="w-4 h-4 text-ai-pink" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-ai-pink animate-fade-in">{error}</p>
            </>
          )}
        </div>
        
        {(showCount || maxLength) && (
          <div className={`text-xs transition-colors duration-300 ${
            isOverLimit ? 'text-ai-pink' : 'text-neural-500'
          }`}>
            {maxLength ? (
              <span>
                {currentLength}/{maxLength}
                {isOverLimit && (
                  <span className="ml-1 text-ai-pink">超出限制</span>
                )}
              </span>
            ) : (
              <span>{currentLength} 字符</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextArea;