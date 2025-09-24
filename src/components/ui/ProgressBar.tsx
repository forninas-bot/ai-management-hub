import React from 'react';

type ProgressVariant = 'default' | 'neural' | 'glass' | 'ai' | 'gradient';
type ProgressSize = 'sm' | 'md' | 'lg' | 'xl';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  glow?: boolean;
  className?: string;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  animated = false,
  striped = false,
  glow = false,
  className = '',
  color
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  };
  
  const variantClasses = {
    default: 'bg-neural-200',
    neural: 'bg-neural-100/50 border border-neural-200/50',
    glass: 'bg-white/10 backdrop-blur-sm border border-white/20',
    ai: 'bg-gradient-to-r from-neural-100/30 to-ai-cyan/10 border border-ai-cyan/20',
    gradient: 'bg-gradient-to-r from-neural-200/50 to-neural-300/50'
  };
  
  const fillVariantClasses = {
    default: 'bg-primary',
    neural: 'bg-gradient-to-r from-ai-cyan to-ai-purple',
    glass: 'bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm',
    ai: 'bg-gradient-to-r from-ai-cyan via-ai-purple to-ai-pink',
    gradient: 'bg-gradient-to-r from-ai-orange via-ai-pink to-ai-purple'
  };
  
  const baseClasses = 'w-full rounded-full overflow-hidden transition-all duration-300';
  const glowClass = glow ? 'shadow-lg shadow-ai-cyan/30' : '';
  const animatedClass = animated ? 'animate-pulse' : '';
  
  const stripedPattern = striped ? {
    backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)',
    backgroundSize: '1rem 1rem'
  } : {};
  
  const animatedStripes = animated && striped ? {
    animation: 'progress-stripes 1s linear infinite'
  } : {};
  
  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neural-700">
            {label || '進度'}
          </span>
          <span className="text-sm text-neural-600">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div 
        className={`
          ${baseClasses}
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${glowClass}
          ${className}
        `}
      >
        <div
          className={`
            h-full transition-all duration-500 ease-out rounded-full relative overflow-hidden
            ${fillVariantClasses[variant]}
            ${animatedClass}
          `}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            ...stripedPattern,
            ...animatedStripes
          }}
        >
          {/* AI 風格光效 */}
          {variant === 'ai' && (
            <div className="absolute inset-0 opacity-60">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-shimmer" />
            </div>
          )}
          
          {/* 神經形態光澤 */}
          {variant === 'neural' && (
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
          )}
        </div>
      </div>
      
      {/* 數據流動效果 */}
      {variant === 'ai' && animated && (
        <div className="mt-1 h-0.5 bg-gradient-to-r from-transparent via-ai-cyan to-transparent opacity-50 animate-pulse" />
      )}
    </div>
  );
};

export default ProgressBar;

// 添加到全局CSS中的動畫
/*
@keyframes progress-stripes {
  0% { background-position: 1rem 0; }
  100% { background-position: 0 0; }
}

@keyframes shimmer {
  0% { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(200%) skewX(-12deg); }
}
*/