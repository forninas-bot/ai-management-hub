import React from 'react';

type LoadingVariant = 'default' | 'neural' | 'ai' | 'pulse' | 'dots' | 'wave';
type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSpinnerProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  className?: string;
  text?: string;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  text,
  color = 'ai-cyan'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'neural':
        return (
          <div className={`relative ${sizeClasses[size]}`}>
            <div className={`absolute inset-0 rounded-full border-2 border-${color}/20`} />
            <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-${color} animate-spin`} />
            <div className={`absolute inset-1 rounded-full border border-${color}/40 animate-pulse`} />
          </div>
        );

      case 'ai':
        return (
          <div className={`relative ${sizeClasses[size]}`}>
            {/* 外圈 */}
            <div className={`absolute inset-0 rounded-full border-2 border-gradient-to-r from-${color} to-ai-purple animate-spin`} 
                 style={{
                   background: `conic-gradient(from 0deg, var(--color-${color}), var(--color-ai-purple), var(--color-${color}))`
                 }} />
            {/* 內圈光效 */}
            <div className={`absolute inset-2 rounded-full bg-gradient-to-r from-${color}/20 to-ai-purple/20 animate-pulse`} />
            {/* 中心點 */}
            <div className={`absolute top-1/2 left-1/2 w-1 h-1 bg-${color} rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping`} />
          </div>
        );

      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className={`absolute inset-0 bg-${color} rounded-full animate-ping opacity-75`} />
            <div className={`absolute inset-0 bg-${color} rounded-full animate-pulse`} />
          </div>
        );

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 bg-${color} rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );

      case 'wave':
        return (
          <div className="flex items-end space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-1 bg-${color} rounded-full animate-pulse`}
                style={{
                  height: `${12 + (i % 2) * 8}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
        );

      default:
        return (
          <div className={`${sizeClasses[size]} border-2 border-${color}/20 border-t-${color} rounded-full animate-spin`} />
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      {renderSpinner()}
      {text && (
        <p className={`${textSizeClasses[size]} text-neural-600 animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;