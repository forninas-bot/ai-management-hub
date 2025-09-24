import React, { useEffect, useRef } from 'react';

interface DataPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  trail: { x: number; y: number; opacity: number }[];
}

interface DataFlowProps {
  width?: number;
  height?: number;
  flowCount?: number;
  direction?: 'horizontal' | 'vertical' | 'diagonal' | 'random';
  speed?: number;
  colors?: string[];
  trailLength?: number;
  className?: string;
}

const DataFlow: React.FC<DataFlowProps> = ({
  width = 400,
  height = 200,
  flowCount = 20,
  direction = 'horizontal',
  speed = 2,
  colors = ['#00D4FF', '#7C3AED', '#F472B6', '#34D399'],
  trailLength = 10,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataPointsRef = useRef<DataPoint[]>([]);
  const animationRef = useRef<number | null>(null);
  
  // 創建數據點
  const createDataPoint = (w: number = width, h: number = height): DataPoint => {
    let x, y, vx, vy;
    
    switch (direction) {
      case 'horizontal':
        x = -10;
        y = Math.random() * h;
        vx = speed + Math.random() * speed;
        vy = (Math.random() - 0.5) * 0.5;
        break;
      case 'vertical':
        x = Math.random() * w;
        y = -10;
        vx = (Math.random() - 0.5) * 0.5;
        vy = speed + Math.random() * speed;
        break;
      case 'diagonal':
        x = -10;
        y = h + 10;
        vx = speed + Math.random() * speed;
        vy = -(speed + Math.random() * speed);
        break;
      case 'random':
      default:
        const angle = Math.random() * Math.PI * 2;
        const velocity = speed + Math.random() * speed;
        x = Math.random() * w;
        y = Math.random() * h;
        vx = Math.cos(angle) * velocity;
        vy = Math.sin(angle) * velocity;
        break;
    }
    
    return {
      x,
      y,
      vx,
      vy,
      size: 1 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.7,
      color: colors[Math.floor(Math.random() * colors.length)],
      trail: []
    };
  };
  
  // 初始化數據點
  const initDataPoints = () => {
    dataPointsRef.current = [];
    for (let i = 0; i < flowCount; i++) {
      dataPointsRef.current.push(createDataPoint());
    }
  };
  
  // 更新數據點
  const updateDataPoints = () => {
    const dataPoints = dataPointsRef.current;
    
    dataPoints.forEach((point, index) => {
      // 添加到軌跡
      point.trail.push({ x: point.x, y: point.y, opacity: point.opacity });
      
      // 限制軌跡長度
      if (point.trail.length > trailLength) {
        point.trail.shift();
      }
      
      // 更新軌跡透明度
      point.trail.forEach((trailPoint, trailIndex) => {
        trailPoint.opacity = (trailIndex / point.trail.length) * point.opacity * 0.5;
      });
      
      // 更新位置
      point.x += point.vx;
      point.y += point.vy;
      
      // 檢查是否需要重置
      let shouldReset = false;
      
      switch (direction) {
        case 'horizontal':
          shouldReset = point.x > width + 10;
          break;
        case 'vertical':
          shouldReset = point.y > height + 10;
          break;
        case 'diagonal':
          shouldReset = point.x > width + 10 || point.y < -10;
          break;
        case 'random':
        default:
          shouldReset = point.x < -10 || point.x > width + 10 || point.y < -10 || point.y > height + 10;
          break;
      }
      
      if (shouldReset) {
        dataPoints[index] = createDataPoint();
      }
    });
  };
  
  // 繪製數據流
  const drawDataFlow = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, width, height);
    
    const dataPoints = dataPointsRef.current;
    
    dataPoints.forEach(point => {
      // 繪製軌跡
      if (point.trail.length > 1) {
        ctx.strokeStyle = point.color;
        ctx.lineWidth = point.size * 0.5;
        
        for (let i = 1; i < point.trail.length; i++) {
          const current = point.trail[i];
          const previous = point.trail[i - 1];
          
          ctx.globalAlpha = current.opacity;
          ctx.beginPath();
          ctx.moveTo(previous.x, previous.y);
          ctx.lineTo(current.x, current.y);
          ctx.stroke();
        }
      }
      
      // 繪製主要數據點
      ctx.save();
      ctx.globalAlpha = point.opacity;
      
      // 創建漸變
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, point.size * 3
      );
      
      // 確保顏色格式正確
      const baseColor = point.color.length === 7 ? point.color : point.color.substring(0, 7);
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, baseColor + '00');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.size * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // 核心亮點
      ctx.fillStyle = point.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
  };
  
  // 動畫循環
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    updateDataPoints();
    drawDataFlow(ctx);
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 設置畫布大小
    canvas.width = width;
    canvas.height = height;
    
    // 初始化
    initDataPoints();
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, flowCount, direction, speed]);
  
  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none ${className}`}
      style={{
        background: 'transparent',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -1
      }}
    />
  );
};

export default DataFlow;