import React, { useState, useEffect } from 'react';

type StatusType = 'idle' | 'processing' | 'success' | 'error' | 'warning' | 'loading';
type IndicatorSize = 'sm' | 'md' | 'lg';
type IndicatorVariant = 'pulse' | 'glow' | 'neural' | 'circuit';

interface StatusIndicatorProps {
  status: StatusType;
  size?: IndicatorSize;
  variant?: IndicatorVariant;
  label?: string;
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  variant = 'pulse',
  label,
  showLabel = true,
  animated = true,
  className = ''
}) => {
  const [pulseCount, setPulseCount] = useState(0);
  
  // 狀態顏色映射
  const statusColors = {
    idle: {
      primary: '#6B7280',
      secondary: '#9CA3AF',
      glow: '#6B728040'
    },
    processing: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      glow: '#3B82F640'
    },
    success: {
      primary: '#10B981',
      secondary: '#34D399',
      glow: '#10B98140'
    },
    error: {
      primary: '#EF4444',
      secondary: '#F87171',
      glow: '#EF444440'
    },
    warning: {
      primary: '#F59E0B',
      secondary: '#FBBF24',
      glow: '#F59E0B40'
    },
    loading: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      glow: '#8B5CF640'
    }
  };
  
  // 尺寸映射
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };
  
  // 標籤文字映射
  const statusLabels = {
    idle: '待機',
    processing: '處理中',
    success: '成功',
    error: '錯誤',
    warning: '警告',
    loading: '載入中'
  };
  
  // 脈衝動畫效果
  useEffect(() => {
    if (!animated) return;
    
    const interval = setInterval(() => {
      setPulseCount(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [animated]);
  
  const colors = statusColors[status];
  const displayLabel = label || statusLabels[status];
  
  // 渲染脈衝變體
  const renderPulseVariant = () => (
    <div className="relative flex items-center space-x-2">
      <div className="relative">
        <div 
          className={`${sizeClasses[size]} rounded-full transition-all duration-300`}
          style={{
            backgroundColor: colors.primary,
            boxShadow: animated ? `0 0 ${size === 'lg' ? '12px' : size === 'md' ? '8px' : '6px'} ${colors.glow}` : 'none'
          }}
        />
        {animated && (
          <div 
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full animate-ping`}
            style={{
              backgroundColor: colors.secondary,
              opacity: 0.4
            }}
          />
        )}
      </div>
      {showLabel && (
        <span 
          className="text-sm font-medium transition-colors duration-300"
          style={{ color: colors.primary }}
        >
          {displayLabel}
        </span>
      )}
    </div>
  );
  
  // 渲染發光變體
  const renderGlowVariant = () => (
    <div className="relative flex items-center space-x-2">
      <div className="relative">
        <div 
          className={`${sizeClasses[size]} rounded-full transition-all duration-500`}
          style={{
            backgroundColor: colors.primary,
            boxShadow: animated ? 
              `0 0 ${size === 'lg' ? '16px' : size === 'md' ? '12px' : '8px'} ${colors.primary}80, 
               0 0 ${size === 'lg' ? '32px' : size === 'md' ? '24px' : '16px'} ${colors.primary}40` : 
              'none'
          }}
        />
        {animated && (
          <div 
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full animate-pulse`}
            style={{
              backgroundColor: colors.secondary,
              opacity: 0.6
            }}
          />
        )}
      </div>
      {showLabel && (
        <span 
          className="text-sm font-medium transition-all duration-500"
          style={{ 
            color: colors.primary,
            textShadow: animated ? `0 0 8px ${colors.primary}60` : 'none'
          }}
        >
          {displayLabel}
        </span>
      )}
    </div>
  );
  
  // 渲染神經形態變體
  const renderNeuralVariant = () => (
    <div className="relative flex items-center space-x-3">
      <div className="relative">
        {/* 外圈 */}
        <div 
          className={`${size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4'} rounded-full border-2 transition-all duration-300`}
          style={{
            borderColor: colors.primary,
            backgroundColor: 'transparent'
          }}
        >
          {/* 內核 */}
          <div 
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${sizeClasses[size]} rounded-full transition-all duration-300`}
            style={{
              backgroundColor: colors.primary,
              boxShadow: animated ? `0 0 ${size === 'lg' ? '8px' : size === 'md' ? '6px' : '4px'} ${colors.glow}` : 'none'
            }}
          />
        </div>
        
        {/* 脈衝環 */}
        {animated && (
          <div 
            className={`absolute inset-0 ${size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4'} rounded-full border animate-ping`}
            style={{
              borderColor: colors.secondary,
              borderWidth: '1px'
            }}
          />
        )}
      </div>
      
      {showLabel && (
        <div className="flex flex-col">
          <span 
            className="text-sm font-medium transition-colors duration-300"
            style={{ color: colors.primary }}
          >
            {displayLabel}
          </span>
          {animated && (
            <div className="flex space-x-1 mt-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full animate-pulse"
                  style={{
                    backgroundColor: colors.secondary,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
  
  // 渲染電路變體
  const renderCircuitVariant = () => (
    <div className="relative flex items-center space-x-3">
      <div className="relative">
        {/* 主體 */}
        <div 
          className={`${size === 'lg' ? 'w-8 h-6' : size === 'md' ? 'w-6 h-4' : 'w-4 h-3'} rounded transition-all duration-300`}
          style={{
            backgroundColor: colors.primary + '20',
            border: `1px solid ${colors.primary}`
          }}
        >
          {/* 內部電路線 */}
          <div className="absolute inset-1 flex items-center justify-center">
            <div 
              className={`${size === 'lg' ? 'w-4 h-0.5' : size === 'md' ? 'w-3 h-0.5' : 'w-2 h-0.5'} transition-all duration-300`}
              style={{
                backgroundColor: colors.primary,
                boxShadow: animated ? `0 0 4px ${colors.primary}` : 'none'
              }}
            />
          </div>
          
          {/* 數據流動點 */}
          {animated && (
            <div 
              className={`absolute top-1/2 transform -translate-y-1/2 ${sizeClasses.sm} rounded-full animate-pulse`}
              style={{
                backgroundColor: colors.secondary,
                left: '10%',
                animationDuration: '1.5s'
              }}
            />
          )}
        </div>
        
        {/* 連接點 */}
        <div 
          className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full"
          style={{
            backgroundColor: colors.primary,
            boxShadow: animated ? `0 0 6px ${colors.glow}` : 'none'
          }}
        />
        <div 
          className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full"
          style={{
            backgroundColor: colors.primary,
            boxShadow: animated ? `0 0 6px ${colors.glow}` : 'none'
          }}
        />
      </div>
      
      {showLabel && (
        <span 
          className="text-sm font-mono font-medium transition-colors duration-300"
          style={{ color: colors.primary }}
        >
          {displayLabel}
        </span>
      )}
    </div>
  );
  
  const renderIndicator = () => {
    switch (variant) {
      case 'glow':
        return renderGlowVariant();
      case 'neural':
        return renderNeuralVariant();
      case 'circuit':
        return renderCircuitVariant();
      case 'pulse':
      default:
        return renderPulseVariant();
    }
  };
  
  return (
    <div className={`inline-flex items-center ${className}`}>
      {renderIndicator()}
    </div>
  );
};

export default StatusIndicator;