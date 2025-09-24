import React from 'react';

type ChartType = 'line' | 'bar' | 'pie' | 'donut' | 'area';
type ChartVariant = 'default' | 'neural' | 'glass' | 'ai';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface ChartProps {
  data: DataPoint[];
  type?: ChartType;
  variant?: ChartVariant;
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
  animated?: boolean;
  glow?: boolean;
  className?: string;
  title?: string;
}

const Chart: React.FC<ChartProps> = ({
  data,
  type = 'bar',
  variant = 'default',
  width = 400,
  height = 300,
  showGrid = true,
  showLabels = true,
  showValues = false,
  animated = true,
  glow = false,
  className = '',
  title
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    neural: 'bg-neural-50 border border-neural-200/50 shadow-neural',
    glass: 'bg-white/10 backdrop-blur-sm border border-white/20',
    ai: 'bg-gradient-to-br from-neural-50 to-ai-cyan/5 border border-ai-cyan/20'
  };
  
  const glowClass = glow ? 'shadow-lg shadow-ai-cyan/20' : '';
  
  const getBarColor = (index: number, customColor?: string) => {
    if (customColor) return customColor;
    
    const colors = {
      default: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      neural: ['#00D4FF', '#7C3AED', '#F472B6', '#FB923C', '#34D399'],
      glass: ['rgba(255,255,255,0.8)', 'rgba(59,130,246,0.8)', 'rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)', 'rgba(239,68,68,0.8)'],
      ai: ['#00D4FF', '#7C3AED', '#F472B6', '#FB923C', '#34D399']
    };
    
    return colors[variant][index % colors[variant].length];
  };
  
  const renderBarChart = () => {
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;
    
    return (
      <svg width={width} height={height} className="overflow-visible">
        {/* 網格線 */}
        {showGrid && (
          <g className="opacity-30">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={i}
                x1={padding}
                y1={padding + chartHeight * ratio}
                x2={width - padding}
                y2={padding + chartHeight * ratio}
                stroke="currentColor"
                strokeWidth="1"
                className="text-neural-300"
              />
            ))}
          </g>
        )}
        
        {/* 柱狀圖 */}
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
          const y = height - padding - barHeight;
          
          return (
            <g key={index}>
              {/* 柱子 */}
              <rect
                x={x}
                y={animated ? height - padding : y}
                width={barWidth}
                height={animated ? 0 : barHeight}
                fill={getBarColor(index, item.color)}
                className={`transition-all duration-1000 ease-out ${variant === 'ai' ? 'filter drop-shadow-sm' : ''}`}
                style={{
                  animationDelay: animated ? `${index * 100}ms` : '0ms'
                }}
              >
                {animated && (
                  <animate
                    attributeName="height"
                    from="0"
                    to={barHeight}
                    dur="1s"
                    begin={`${index * 0.1}s`}
                    fill="freeze"
                  />
                )}
                {animated && (
                  <animate
                    attributeName="y"
                    from={height - padding}
                    to={y}
                    dur="1s"
                    begin={`${index * 0.1}s`}
                    fill="freeze"
                  />
                )}
              </rect>
              
              {/* AI 風格光效 */}
              {variant === 'ai' && (
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#aiGradient)"
                  className="opacity-30"
                />
              )}
              
              {/* 標籤 */}
              {showLabels && (
                <text
                  x={x + barWidth / 2}
                  y={height - padding + 20}
                  textAnchor="middle"
                  className="text-xs fill-neural-600"
                >
                  {item.label}
                </text>
              )}
              
              {/* 數值 */}
              {showValues && (
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs fill-neural-700 font-medium"
                >
                  {item.value}
                </text>
              )}
            </g>
          );
        })}
        
        {/* AI 風格漸變定義 */}
        {variant === 'ai' && (
          <defs>
            <linearGradient id="aiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#F472B6" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        )}
      </svg>
    );
  };
  
  const renderDonutChart = () => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(chartWidth, chartHeight) / 2 - 20;
    const innerRadius = radius * 0.6;
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -90; // 從頂部開始
    
    const createArcPath = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
      const start = polarToCartesian(centerX, centerY, outerR, endAngle);
      const end = polarToCartesian(centerX, centerY, outerR, startAngle);
      const innerStart = polarToCartesian(centerX, centerY, innerR, endAngle);
      const innerEnd = polarToCartesian(centerX, centerY, innerR, startAngle);
      
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      
      return [
        "M", start.x, start.y,
        "A", outerR, outerR, 0, largeArcFlag, 0, end.x, end.y,
        "L", innerEnd.x, innerEnd.y,
        "A", innerR, innerR, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
        "Z"
      ].join(" ");
    };
    
    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
      const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      };
    };
    
    return (
      <svg width={width} height={height} className="overflow-visible">
        {data.map((item, index) => {
          const angle = (item.value / total) * 360;
          const endAngle = currentAngle + angle;
          const pathData = createArcPath(currentAngle, endAngle, radius, innerRadius);
          
          const result = (
            <g key={index}>
              <path
                d={pathData}
                fill={getBarColor(index, item.color)}
                className={`transition-all duration-1000 hover:opacity-80 ${variant === 'ai' ? 'filter drop-shadow-sm' : ''}`}
                style={{
                  transformOrigin: `${centerX}px ${centerY}px`,
                  animationDelay: animated ? `${index * 200}ms` : '0ms'
                }}
              >
                {animated && (
                  <animateTransform
                    attributeName="transform"
                    type="scale"
                    from="0"
                    to="1"
                    dur="0.8s"
                    begin={`${index * 0.2}s`}
                    fill="freeze"
                  />
                )}
              </path>
              
              {/* 標籤 */}
              {showLabels && (
                <text
                  x={polarToCartesian(centerX, centerY, radius + 15, currentAngle + angle / 2).x}
                  y={polarToCartesian(centerX, centerY, radius + 15, currentAngle + angle / 2).y}
                  textAnchor="middle"
                  className="text-xs fill-neural-600"
                >
                  {item.label}
                </text>
              )}
            </g>
          );
          
          currentAngle = endAngle;
          return result;
        })}
        
        {/* 中心文字 */}
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          className="text-lg font-bold fill-neural-700"
        >
          總計
        </text>
        <text
          x={centerX}
          y={centerY + 20}
          textAnchor="middle"
          className="text-sm fill-neural-600"
        >
          {total}
        </text>
      </svg>
    );
  };
  
  return (
    <div className={`rounded-lg p-4 ${variantClasses[variant]} ${glowClass} ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-neural-800 mb-4">{title}</h3>
      )}
      
      <div className="relative">
        {type === 'donut' || type === 'pie' ? renderDonutChart() : renderBarChart()}
        
        {/* AI 風格數據流動效果 */}
        {variant === 'ai' && animated && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-ai-cyan to-transparent opacity-50 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-0.5 h-full bg-gradient-to-t from-transparent via-ai-purple to-transparent opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chart;