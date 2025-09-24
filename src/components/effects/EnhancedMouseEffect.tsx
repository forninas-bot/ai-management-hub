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

interface EnhancedMouseEffectProps {
  type?: 'neon-trail' | 'magnetic-field' | 'fire-trail' | 'star-field' | 'lightning' | 'butterfly' | 'galaxy' | 'crystal';
  color?: string;
  size?: number;
  opacity?: number;
  duration?: number;
  intensity?: number;
  interactive?: boolean;
}

const EnhancedMouseEffect: React.FC<EnhancedMouseEffectProps> = ({ 
  type = 'neon-trail', 
  color = '#00ffff', 
  size = 10, 
  opacity = 0.8, 
  duration = 1500, 
  intensity = 1,
  interactive = true
}) => {
  const [trails, setTrails] = useState<MouseTrail[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [prevMousePosition, setPrevMousePosition] = useState({ x: 0, y: 0 });
  const trailIdRef = useRef(0);
  const particleIdRef = useRef(0);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // 计算鼠标移动速度和角度
  const calculateVelocityAndAngle = useCallback((current: {x: number, y: number}, prev: {x: number, y: number}) => {
    const dx = current.x - prev.x;
    const dy = current.y - prev.y;
    const velocity = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    return { velocity, angle };
  }, []);

  // 生成随机颜色
  const getRandomColor = useCallback(() => {
    const colors = ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff', '#ff4080', '#40ff80', '#8040ff'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  // 鼠标移动处理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = { x: e.clientX, y: e.clientY };
      const { velocity, angle } = calculateVelocityAndAngle(newPosition, prevMousePosition);
      
      setMousePosition(newPosition);
      setPrevMousePosition(newPosition);

      if (velocity > 1) { // 只有当鼠标真正移动时才创建效果
        if (type === 'neon-trail' || type === 'fire-trail' || type === 'lightning') {
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

        if (type === 'star-field' || type === 'galaxy' || type === 'crystal') {
          // 生成粒子
          const particleCount = Math.min(Math.floor(velocity / 5) * intensity, 10);
          const newParticles: Particle[] = [];
          
          for (let i = 0; i < particleCount; i++) {
            newParticles.push({
              id: particleIdRef.current++,
              x: e.clientX + (Math.random() - 0.5) * 20,
              y: e.clientY + (Math.random() - 0.5) * 20,
              vx: (Math.random() - 0.5) * 4 * intensity,
              vy: (Math.random() - 0.5) * 4 * intensity,
              life: 0,
              maxLife: 60 + Math.random() * 40,
              size: size * (0.5 + Math.random() * 0.5),
              color: type === 'galaxy' ? getRandomColor() : color
            });
          }
          setParticles(prev => [...prev, ...newParticles]);
        }

        if (type === 'butterfly') {
          // 蝴蝶效应 - 创建对称的粒子
          const butterflyParticles: Particle[] = [];
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const radius = 15 + Math.sin(Date.now() * 0.01 + i) * 5;
            butterflyParticles.push({
              id: particleIdRef.current++,
              x: e.clientX + Math.cos(angle) * radius,
              y: e.clientY + Math.sin(angle) * radius,
              vx: Math.cos(angle + Math.PI / 2) * 0.5,
              vy: Math.sin(angle + Math.PI / 2) * 0.5,
              life: 0,
              maxLife: 30,
              size: size * 0.8,
              color: color
            });
          }
          setParticles(prev => [...prev, ...butterflyParticles]);
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [type, intensity, calculateVelocityAndAngle, getRandomColor, color, size]);

  // 粒子动画循环
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vx: particle.vx * 0.98, // 阻力
        vy: particle.vy * 0.98,
        life: particle.life + 1
      })).filter(particle => particle.life < particle.maxLife));

      // 清理旧的轨迹
      const now = Date.now();
      setTrails(prev => prev.filter(trail => now - trail.timestamp < duration));
    };

    if (type === 'star-field' || type === 'galaxy' || type === 'crystal' || type === 'butterfly') {
      const interval = setInterval(animateParticles, 16); // ~60fps
      return () => clearInterval(interval);
    }
  }, [type, duration]);

  // 霓虹轨迹效果
  const renderNeonTrail = () => (
    <AnimatePresence>
      {trails.map((trail, index) => {
        const age = Date.now() - trail.timestamp;
        const progress = age / duration;
        const currentOpacity = opacity * (1 - progress);
        const currentSize = size * (1 - progress * 0.3) * (1 + (trail.velocity || 0) / 20);
        
        return (
          <motion.div
            key={trail.id}
            className="pointer-events-none fixed rounded-full blur-sm"
            style={{
              left: trail.x - currentSize / 2,
              top: trail.y - currentSize / 2,
              width: currentSize,
              height: currentSize,
              backgroundColor: color,
              opacity: currentOpacity,
              zIndex: 9999,
              boxShadow: `0 0 ${currentSize * 2}px ${color}, 0 0 ${currentSize * 4}px ${color}`,
            }}
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        );
      })}
    </AnimatePresence>
  );

  // 火焰轨迹效果
  const renderFireTrail = () => (
    <AnimatePresence>
      {trails.map((trail, index) => {
        const age = Date.now() - trail.timestamp;
        const progress = age / duration;
        const currentOpacity = opacity * (1 - progress);
        const currentSize = size * (1 + progress * 0.5);
        const hue = (Date.now() * 0.1 + index * 10) % 60; // 红色到黄色的渐变
        
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

  // 磁场效果
  const renderMagneticField = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      <svg className="w-full h-full">
        <defs>
          <radialGradient id="magneticGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        {[...Array(5)].map((_, i) => (
          <motion.circle
            key={i}
            cx={mousePosition.x}
            cy={mousePosition.y}
            r={size * (i + 1) * 2}
            fill="none"
            stroke={color}
            strokeWidth="2"
            opacity={opacity * (1 - i * 0.2)}
            animate={{
              r: size * (i + 1) * 2 + Math.sin(Date.now() * 0.01 + i) * 10,
            }}
            transition={{
              duration: 0.1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );

  // 闪电效果
  const renderLightning = () => (
    <svg className="fixed inset-0 pointer-events-none z-50" style={{ pointerEvents: 'none' }}>
      {trails.map((trail, index) => {
        const age = Date.now() - trail.timestamp;
        if (age > 100) return null;
        
        const opacity = (100 - age) / 100;
        const branches = [];
        
        // 生成闪电分支
        for (let i = 0; i < 3; i++) {
          const x1 = trail.x + (Math.random() - 0.5) * 50;
          const y1 = trail.y + (Math.random() - 0.5) * 50;
          const x2 = trail.x + (Math.random() - 0.5) * 100;
          const y2 = trail.y + (Math.random() - 0.5) * 100;
          
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
                filter: `drop-shadow(0 0 10px ${color})`,
              }}
            />
          );
        }
        
        return <g key={trail.id}>{branches}</g>;
      })}
    </svg>
  );

  // 星域效果
  const renderStarField = () => (
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

  // 星系效果
  const renderGalaxy = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle, index) => {
        const progress = particle.life / particle.maxLife;
        const angle = (particle.id * 137.5) * (Math.PI / 180); // 黄金角度
        const radius = progress * 50;
        const spiralX = particle.x + Math.cos(angle + progress * 10) * radius;
        const spiralY = particle.y + Math.sin(angle + progress * 10) * radius;
        
        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: spiralX - particle.size / 2,
              top: spiralY - particle.size / 2,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: opacity * (1 - progress),
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        );
      })}
    </div>
  );

  // 水晶效果
  const renderCrystal = () => (
    <svg className="fixed inset-0 pointer-events-none z-50" style={{ pointerEvents: 'none' }}>
      {particles.map((particle) => {
        const progress = particle.life / particle.maxLife;
        const size = particle.size * (1 + progress);
        
        return (
          <g key={particle.id}>
            <motion.polygon
              points={`${particle.x},${particle.y - size} ${particle.x + size},${particle.y} ${particle.x},${particle.y + size} ${particle.x - size},${particle.y}`}
              fill={particle.color}
              opacity={opacity * (1 - progress)}
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{
                filter: `drop-shadow(0 0 10px ${particle.color})`,
              }}
            />
          </g>
        );
      })}
    </svg>
  );

  // 蝴蝶效果
  const renderButterfly = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle, index) => {
        const wingOffset = Math.sin(Date.now() * 0.01 + particle.id) * 0.3;
        
        return (
          <div key={particle.id} className="absolute" style={{ left: particle.x, top: particle.y }}>
            <motion.div
              className="absolute w-3 h-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
              style={{
                left: -6 + wingOffset * 10,
                top: -2,
                transform: `rotate(${wingOffset * 20}deg)`,
              }}
              animate={{
                scaleX: [1, 0.8, 1],
              }}
              transition={{
                duration: 0.2,
                repeat: Infinity,
              }}
            />
            <motion.div
              className="absolute w-3 h-4 bg-gradient-to-l from-pink-400 to-purple-400 rounded-full"
              style={{
                left: 3 - wingOffset * 10,
                top: -2,
                transform: `rotate(${-wingOffset * 20}deg)`,
              }}
              animate={{
                scaleX: [1, 0.8, 1],
              }}
              transition={{
                duration: 0.2,
                repeat: Infinity,
                delay: 0.1,
              }}
            />
            <div className="absolute w-1 h-3 bg-gray-800 rounded-full" style={{ left: -0.5, top: -1 }} />
          </div>
        );
      })}
    </div>
  );

  const renderEffect = () => {
    switch (type) {
      case 'neon-trail':
        return renderNeonTrail();
      case 'fire-trail':
        return renderFireTrail();
      case 'magnetic-field':
        return renderMagneticField();
      case 'lightning':
        return renderLightning();
      case 'star-field':
        return renderStarField();
      case 'galaxy':
        return renderGalaxy();
      case 'crystal':
        return renderCrystal();
      case 'butterfly':
        return renderButterfly();
      default:
        return renderNeonTrail();
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none">
      {renderEffect()}
    </div>
  );
};

export default EnhancedMouseEffect;