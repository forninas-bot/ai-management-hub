import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MouseTrail {
  id: number;
  x: number;
  y: number;
  timestamp: number;
  velocity?: number;
  angle?: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface SimpleEnhancedMouseEffectProps {
  type?: 'fire-trail' | 'lightning' | 'butterfly' | 'crystal';
  color?: string;
  size?: number;
  opacity?: number;
  intensity?: number;
}

const SimpleEnhancedMouseEffect: React.FC<SimpleEnhancedMouseEffectProps> = ({ 
  type = 'fire-trail', 
  color = '#ff4500', 
  size = 12, 
  opacity = 0.8, 
  intensity = 1.5
}) => {
  const [trails, setTrails] = useState<MouseTrail[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [prevMousePosition, setPrevMousePosition] = useState({ x: 0, y: 0 });
  const trailIdRef = useRef(0);
  const particleIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 计算鼠标移动速度和角度
  const calculateVelocityAndAngle = useCallback((current: {x: number, y: number}, prev: {x: number, y: number}) => {
    const dx = current.x - prev.x;
    const dy = current.y - prev.y;
    const velocity = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    return { velocity, angle };
  }, []);

  // 鼠标移动处理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = { x: e.clientX, y: e.clientY };
      const { velocity, angle } = calculateVelocityAndAngle(newPosition, prevMousePosition);
      
      setMousePosition(newPosition);
      setPrevMousePosition(newPosition);

      if (velocity > 2) { // 只有当鼠标真正移动时才创建效果
        if (type === 'fire-trail' || type === 'lightning') {
          const newTrail: MouseTrail = {
            id: trailIdRef.current++,
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now(),
            velocity,
            angle
          };
          setTrails(prev => [...prev, newTrail]);
        }

        if (type === 'butterfly') {
          // 蝴蝶效应 - 创建对称的粒子
          const butterflyParticles: Particle[] = [];
          for (let i = 0; i < 6; i++) {
            const particleAngle = (i / 6) * Math.PI * 2;
            const radius = 20 + Math.sin(Date.now() * 0.01 + i) * 8;
            butterflyParticles.push({
              id: particleIdRef.current++,
              x: e.clientX + Math.cos(particleAngle) * radius,
              y: e.clientY + Math.sin(particleAngle) * radius,
              vx: Math.cos(particleAngle + Math.PI / 2) * 0.8,
              vy: Math.sin(particleAngle + Math.PI / 2) * 0.8,
              life: 0,
              maxLife: 40,
              size: size * 0.8,
              color: color
            });
          }
          setParticles(prev => [...prev, ...butterflyParticles]);
        }

        if (type === 'crystal') {
          // 水晶效果 - 创建几何粒子
          const crystalParticles: Particle[] = [];
          const particleCount = Math.min(Math.floor(velocity / 3) * intensity, 5);
          
          for (let i = 0; i < particleCount; i++) {
            crystalParticles.push({
              id: particleIdRef.current++,
              x: e.clientX + (Math.random() - 0.5) * 30,
              y: e.clientY + (Math.random() - 0.5) * 30,
              vx: (Math.random() - 0.5) * 2 * intensity,
              vy: (Math.random() - 0.5) * 2 * intensity,
              life: 0,
              maxLife: 80 + Math.random() * 40,
              size: size * (0.6 + Math.random() * 0.4),
              color: color
            });
          }
          setParticles(prev => [...prev, ...crystalParticles]);
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [type, intensity, calculateVelocityAndAngle, color, size]);

  // 粒子动画循环
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vx: particle.vx * 0.95, // 阻力
        vy: particle.vy * 0.95,
        life: particle.life + 1
      })).filter(particle => particle.life < particle.maxLife));

      // 清理旧的轨迹
      const now = Date.now();
      setTrails(prev => prev.filter(trail => now - trail.timestamp < 1000)); // 1秒后消失
    };

    if (type === 'butterfly' || type === 'crystal') {
      const interval = setInterval(animateParticles, 16); // ~60fps
      return () => clearInterval(interval);
    }
  }, [type]);

  // 火焰轨迹效果
  const renderFireTrail = () => (
    <AnimatePresence>
      {trails.map((trail, index) => {
        const age = Date.now() - trail.timestamp;
        const progress = age / 1000;
        const currentOpacity = opacity * (1 - progress);
        const currentSize = size * (1 + progress * 0.5);
        const hue = (Date.now() * 0.1 + index * 15) % 60; // 红色到黄色的渐变
        
        return (
          <motion.div
            key={trail.id}
            className="pointer-events-none fixed"
            style={{
              left: trail.x - currentSize / 2,
              top: trail.y - currentSize / 2,
              width: currentSize,
              height: currentSize,
              backgroundColor: `hsl(${hue + 10}, 100%, 50%)`,
              opacity: currentOpacity,
              zIndex: 9999,
              borderRadius: '50% 0 50% 50%', // 火焰形状
              transform: `rotate(${trail.angle || 0}rad)`,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        );
      })}
    </AnimatePresence>
  );

  // 闪电效果
  const renderLightning = () => (
    <svg className="fixed inset-0 pointer-events-none z-50" style={{ pointerEvents: 'none' }}>
      {trails.map((trail, index) => {
        const age = Date.now() - trail.timestamp;
        if (age > 150) return null; // 闪电持续时间更短
        
        const opacity = (150 - age) / 150;
        const branches = [];
        
        // 生成闪电分支
        for (let i = 0; i < 3; i++) {
          const x1 = trail.x + (Math.random() - 0.5) * 60;
          const y1 = trail.y + (Math.random() - 0.5) * 60;
          const x2 = trail.x + (Math.random() - 0.5) * 120;
          const y2 = trail.y + (Math.random() - 0.5) * 120;
          
          branches.push(
            <motion.path
              key={`${trail.id}-${i}`}
              d={`M ${trail.x} ${trail.y} L ${x1} ${y1} L ${x2} ${y2}`}
              stroke={color}
              strokeWidth="3"
              fill="none"
              opacity={opacity}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.1 }}
              style={{
                filter: `drop-shadow(0 0 15px ${color})`,
              }}
            />
          );
        }
        
        return <g key={trail.id}>{branches}</g>;
      })}
    </svg>
  );

  // 蝴蝶效果
  const renderButterfly = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle, index) => {
        const wingOffset = Math.sin(Date.now() * 0.015 + particle.id) * 0.4;
        const progress = particle.life / particle.maxLife;
        const currentOpacity = opacity * (1 - progress);
        
        return (
          <div key={particle.id} className="absolute" style={{ left: particle.x, top: particle.y, opacity: currentOpacity }}>
            {/* 左翅膀 */}
            <motion.div
              className="absolute w-4 h-5 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
              style={{
                left: -8 + wingOffset * 12,
                top: -2,
                transform: `rotate(${wingOffset * 25}deg)`,
              }}
              animate={{
                scaleX: [1, 0.7, 1],
              }}
              transition={{
                duration: 0.15,
                repeat: Infinity,
              }}
            />
            
            {/* 右翅膀 */}
            <motion.div
              className="absolute w-4 h-5 bg-gradient-to-l from-pink-400 to-purple-400 rounded-full"
              style={{
                left: 4 - wingOffset * 12,
                top: -2,
                transform: `rotate(${-wingOffset * 25}deg)`,
              }}
              animate={{
                scaleX: [1, 0.7, 1],
              }}
              transition={{
                duration: 0.15,
                repeat: Infinity,
                delay: 0.075,
              }}
            />
            
            {/* 身体 */}
            <div className="absolute w-1 h-4 bg-gray-800 rounded-full" style={{ left: -0.5, top: -2 }} />
            
            {/* 触角 */}
            <div className="absolute w-0.5 h-2 bg-gray-700 rounded-full" style={{ left: -1, top: -4, transform: 'rotate(-20deg)' }} />
            <div className="absolute w-0.5 h-2 bg-gray-700 rounded-full" style={{ left: 0, top: -4, transform: 'rotate(20deg)' }} />
          </div>
        );
      })}
    </div>
  );

  // 水晶效果
  const renderCrystal = () => (
    <svg className="fixed inset-0 pointer-events-none z-50" style={{ pointerEvents: 'none' }}>
      {particles.map((particle) => {
        const progress = particle.life / particle.maxLife;
        const size = particle.size * (1 + progress * 0.5);
        const rotation = (particle.id * 45 + particle.life * 2) % 360;
        const currentOpacity = opacity * (1 - progress);
        
        return (
          <g key={particle.id}>
            <motion.polygon
              points={`${particle.x},${particle.y - size} ${particle.x + size},${particle.y} ${particle.x},${particle.y + size} ${particle.x - size},${particle.y}`}
              fill={particle.color}
              opacity={currentOpacity}
              animate={{ rotate: rotation }}
              transition={{ duration: 0.1, ease: "linear" }}
              style={{
                filter: `drop-shadow(0 0 8px ${particle.color})`,
                transformOrigin: `${particle.x}px ${particle.y}px`,
              }}
            />
            
            {/* 水晶高光效果 */}
            <motion.polygon
              points={`${particle.x},${particle.y - size * 0.6} ${particle.x + size * 0.6},${particle.y} ${particle.x},${particle.y + size * 0.6} ${particle.x - size * 0.6},${particle.y}`}
              fill="white"
              opacity={currentOpacity * 0.3}
              animate={{ rotate: rotation }}
              transition={{ duration: 0.1, ease: "linear" }}
              style={{
                transformOrigin: `${particle.x}px ${particle.y}px`,
              }}
            />
          </g>
        );
      })}
    </svg>
  );

  const renderEffect = () => {
    switch (type) {
      case 'fire-trail':
        return renderFireTrail();
      case 'lightning':
        return renderLightning();
      case 'butterfly':
        return renderButterfly();
      case 'crystal':
        return renderCrystal();
      default:
        return renderFireTrail();
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none">
      {renderEffect()}
    </div>
  );
};

export default SimpleEnhancedMouseEffect;