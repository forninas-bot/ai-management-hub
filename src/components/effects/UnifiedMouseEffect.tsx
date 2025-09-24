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

export type MouseEffectType = 
  | 'trail' 
  | 'particles' 
  | 'ripple' 
  | 'glow'
  | 'fire-trail'
  | 'lightning'
  | 'butterfly'
  | 'crystal';

interface UnifiedMouseEffectProps {
  type?: MouseEffectType;
  color?: string;
  size?: number;
  opacity?: number;
  duration?: number;
  intensity?: number;
}

const UnifiedMouseEffect: React.FC<UnifiedMouseEffectProps> = ({ 
  type = 'trail', 
  color = '#3b82f6', 
  size = 8, 
  opacity = 0.6, 
  duration = 1000, 
  intensity = 1
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
        // 基础效果（轨迹类）
        if (['trail', 'ripple', 'glow', 'fire-trail', 'lightning'].includes(type)) {
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

        // 粒子效果
        if (['particles', 'butterfly', 'crystal'].includes(type)) {
          let particleCount = 3;
          if (type === 'butterfly') particleCount = 6;
          if (type === 'crystal') particleCount = Math.min(Math.floor(velocity / 3) * intensity, 5);
          
          const newParticles: Particle[] = [];
          
          for (let i = 0; i < particleCount; i++) {
            let x = e.clientX;
            let y = e.clientY;
            let vx = (Math.random() - 0.5) * 3 * intensity;
            let vy = (Math.random() - 0.5) * 3 * intensity;
            let maxLife = 60;
            let particleSize = size;
            let particleColor = color;

            if (type === 'butterfly') {
              const particleAngle = (i / 6) * Math.PI * 2;
              const radius = 20 + Math.sin(Date.now() * 0.01 + i) * 8;
              x = e.clientX + Math.cos(particleAngle) * radius;
              y = e.clientY + Math.sin(particleAngle) * radius;
              vx = Math.cos(particleAngle + Math.PI / 2) * 0.8;
              vy = Math.sin(particleAngle + Math.PI / 2) * 0.8;
              maxLife = 40;
              particleSize = size * 0.8;
            }

            if (type === 'crystal') {
              x = e.clientX + (Math.random() - 0.5) * 30;
              y = e.clientY + (Math.random() - 0.5) * 30;
              maxLife = 80 + Math.random() * 40;
              particleSize = size * (0.6 + Math.random() * 0.4);
            }

            newParticles.push({
              id: particleIdRef.current++,
              x,
              y,
              vx,
              vy,
              life: 0,
              maxLife,
              size: particleSize,
              color: particleColor
            });
          }
          setParticles(prev => [...prev, ...newParticles]);
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
        vx: particle.vx * 0.95,
        vy: particle.vy * 0.95,
        life: particle.life + 1
      })).filter(particle => particle.life < particle.maxLife));

      // 清理旧的轨迹
      const now = Date.now();
      const trailDuration = type === 'lightning' ? 150 : 1000;
      setTrails(prev => prev.filter(trail => now - trail.timestamp < trailDuration));
    };

    if (['particles', 'butterfly', 'crystal'].includes(type)) {
      const interval = setInterval(animateParticles, 16);
      return () => clearInterval(interval);
    }
  }, [type]);

  // 基础轨迹效果
  const renderBasicTrail = () => (
    <AnimatePresence>
      {trails.map((trail, index) => {
        const age = Date.now() - trail.timestamp;
        const progress = age / duration;
        const currentOpacity = opacity * (1 - progress);
        const currentSize = size * (1 - progress * 0.3);
        
        return (
          <motion.div
            key={trail.id}
            className="pointer-events-none fixed rounded-full"
            style={{
              left: trail.x - currentSize / 2,
              top: trail.y - currentSize / 2,
              width: currentSize,
              height: currentSize,
              backgroundColor: color,
              opacity: currentOpacity,
              zIndex: 9999,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
          />
        );
      })}
    </AnimatePresence>
  );

  // 涟漪效果
  const renderRipple = () => (
    <AnimatePresence>
      {trails.map((trail, index) => {
        const age = Date.now() - trail.timestamp;
        const progress = age / duration;
        const currentOpacity = opacity * (1 - progress);
        const currentSize = size * (1 + progress * 3);
        
        return (
          <motion.div
            key={trail.id}
            className="pointer-events-none fixed rounded-full border-2"
            style={{
              left: trail.x - currentSize / 2,
              top: trail.y - currentSize / 2,
              width: currentSize,
              height: currentSize,
              borderColor: color,
              opacity: currentOpacity,
              zIndex: 9999,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        );
      })}
    </AnimatePresence>
  );

  // 光晕效果
  const renderGlow = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {trails.map((trail) => (
        <motion.div
          key={trail.id}
          className="absolute rounded-full blur-xl"
          style={{
            left: trail.x - size * 2,
            top: trail.y - size * 2,
            width: size * 4,
            height: size * 4,
            backgroundColor: color,
            opacity: opacity * 0.2,
            filter: 'blur(20px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  // 火焰轨迹效果
  const renderFireTrail = () => (
    <AnimatePresence>
      {trails.map((trail, index) => {
        const age = Date.now() - trail.timestamp;
        const progress = age / 1000;
        const currentOpacity = opacity * (1 - progress);
        const currentSize = size * (1 + progress * 0.5);
        const hue = (Date.now() * 0.1 + index * 15) % 60;
        
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
              borderRadius: '50% 0 50% 50%',
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
        if (age > 150) return null;
        
        const opacity = (150 - age) / 150;
        const branches = [];
        
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

  // 粒子脉动效果
  const renderParticles = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => {
        const progress = particle.life / particle.maxLife;
        const currentOpacity = opacity * (1 - progress);
        
        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: particle.x - particle.size / 2,
              top: particle.y - particle.size / 2,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: currentOpacity,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
            animate={{
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
            }}
          />
        );
      })}
    </div>
  );

  const renderEffect = () => {
    switch (type) {
      case 'trail':
        return renderBasicTrail();
      case 'particles':
        return renderParticles();
      case 'ripple':
        return renderRipple();
      case 'glow':
        return renderGlow();
      case 'fire-trail':
        return renderFireTrail();
      case 'lightning':
        return renderLightning();
      case 'butterfly':
        return renderButterfly();
      case 'crystal':
        return renderCrystal();
      default:
        return renderBasicTrail();
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none">
      {renderEffect()}
    </div>
  );
};

export default UnifiedMouseEffect;