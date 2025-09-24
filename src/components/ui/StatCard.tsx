import React from 'react';

type StatVariant = 'default' | 'neural' | 'glass' | 'ai' | 'gradient';
type StatSize = 'sm' | 'md' | 'lg';
type TrendDirection = 'up' | 'down' | 'neutral';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: TrendDirection;
    value: string | number;
    label?: string;
  };
  icon?: React.ReactNode;
  variant?: StatVariant;
  size?: StatSize;
  animated?: boolean;
  glow?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'default',
  size = 'md',
  animated = true,
  glow = false,
  loading = false,
  className = '',
  onClick
}) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    neural: 'bg-neural-50 border border-neural-200/50 shadow-neural',
    glass: 'bg-white/10 backdrop-blur-sm border border-white/20 shadow-glass',
    ai: 'bg-gradient-to-br from-neural-50 to-ai-cyan/5 border border-ai-cyan/20 shadow-ai',
    gradient: 'bg-gradient-to-br from-ai-purple/10 via-ai-cyan/10 to-ai-pink/10 border border-ai-cyan/30'
  };
  
  const titleSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  const valueSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };
  
  const baseClasses = 'rounded-xl transition-all duration-300 hover:shadow-lg';
  const clickableClass = onClick ? 'cursor-pointer hover:scale-105' : '';
  const glowClass = glow ? 'shadow-lg shadow-ai-cyan/20' : '';
  const animatedClass = animated ? 'animate-fade-in' : '';
  
  const getTrendColor = (direction: TrendDirection) => {
    switch (direction) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      case 'neutral':
      default:
        return 'text-neural-500';
    }
  };
  
  const getTrendIcon = (direction: TrendDirection) => {
    switch (direction) {
      case 'up':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7m0 0H7" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10m0 0h10" />
          </svg>
        );
      case 'neutral':
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
    }
  };
  
  if (loading) {
    return (
      <div className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-neural-200 rounded w-1/2"></div>
            {icon && <div className="h-6 w-6 bg-neural-200 rounded"></div>}
          </div>
          <div className="h-8 bg-neural-200 rounded w-3/4 mb-2"></div>
          {subtitle && <div className="h-3 bg-neural-200 rounded w-1/2"></div>}
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${clickableClass}
        ${glowClass}
        ${animatedClass}
        ${className}
      `}
      onClick={onClick}
    >
      {/* 標題和圖標 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-medium text-neural-600 ${titleSizeClasses[size]}`}>
          {title}
        </h3>
        {icon && (
          <div className={`text-neural-400 ${variant === 'ai' ? 'text-ai-cyan' : ''}`}>
            {icon}
          </div>
        )}
      </div>
      
      {/* 主要數值 */}
      <div className="mb-2">
        <span className={`font-bold text-neural-800 ${valueSizeClasses[size]}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      </div>
      
      {/* 副標題和趨勢 */}
      <div className="flex items-center justify-between">
        {subtitle && (
          <p className="text-sm text-neural-500">
            {subtitle}
          </p>
        )}
        
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${getTrendColor(trend.direction)}`}>
            {getTrendIcon(trend.direction)}
            <span className="font-medium">
              {typeof trend.value === 'number' && trend.direction !== 'neutral' 
                ? `${trend.direction === 'up' ? '+' : ''}${trend.value}%` 
                : trend.value}
            </span>
            {trend.label && (
              <span className="text-xs text-neural-400 ml-1">
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* AI 風格裝飾效果 */}
      {variant === 'ai' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          {/* 邊角光效 */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-ai-cyan/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-ai-purple/20 to-transparent" />
          
          {/* 數據流動線 */}
          {animated && (
            <>
              <div className="absolute top-2 left-2 w-8 h-0.5 bg-gradient-to-r from-ai-cyan to-transparent opacity-60 animate-pulse" />
              <div className="absolute bottom-2 right-2 w-0.5 h-8 bg-gradient-to-t from-ai-purple to-transparent opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </>
          )}
        </div>
      )}
      
      {/* 神經形態光澤效果 */}
      {variant === 'neural' && (
        <div className="absolute inset-0 pointer-events-none rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        </div>
      )}
      
      {/* 漸變裝飾 */}
      {variant === 'gradient' && animated && (
        <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-ai-cyan/30 rounded-full animate-ping" />
          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-ai-purple/30 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        </div>
      )}
    </div>
  );
};

export default StatCard;

// 添加到全局CSS中的動畫
/*
@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
*/