import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MouseTrail {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

interface MouseEffectProps {
  type?: 'trail' | 'particles' | 'ripple' | 'glow';
  color?: string;
  size?: number;
  opacity?: number;
  duration?: number;
}

const MouseEffect: React.FC<MouseEffectProps> = ({ 
  type = 'trail', 
  color = '#3b82f6', 
  size = 8, 
  opacity = 0.6, 
  duration = 1000 
}) => {
  const [trails, setTrails] = useState<MouseTrail[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const trailIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      if (type === 'trail') {
        const newTrail: MouseTrail = {
          id: trailIdRef.current++,
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now()
        };
        
        setTrails(prev => [...prev, newTrail]);
        
        // 清理旧的轨迹
        setTimeout(() => {
          setTrails(prev => prev.filter(trail => 
            Date.now() - trail.timestamp < duration
          ));
        }, duration);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [type, duration]);

  const renderTrail = () => (
    <AnimatePresence>
      {trails.map((trail, index) => {
        const age = Date.now() - trail.timestamp;
        const progress = age / duration;
        const currentOpacity = opacity * (1 - progress);
        const currentSize = size * (1 - progress * 0.5);
        
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

  const renderParticles = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      <motion.div
        className="absolute rounded-full"
        style={{
          left: mousePosition.x - size / 2,
          top: mousePosition.y - size / 2,
          width: size * 2,
          height: size * 2,
          backgroundColor: color,
          opacity: opacity * 0.3,
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [opacity * 0.3, 0],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          repeatDelay: 0.2,
        }}
      />
    </div>
  );

  const renderRipple = () => (
    <AnimatePresence>
      {trails.map((trail, index) => {
        const age = Date.now() - trail.timestamp;
        if (age > duration) return null;
        
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

  const renderGlow = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      <motion.div
        className="absolute rounded-full blur-xl"
        style={{
          left: mousePosition.x - size * 2,
          top: mousePosition.y - size * 2,
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
    </div>
  );

  const renderEffect = () => {
    switch (type) {
      case 'trail':
        return renderTrail();
      case 'particles':
        return renderParticles();
      case 'ripple':
        return renderRipple();
      case 'glow':
        return renderGlow();
      default:
        return renderTrail();
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none">
      {renderEffect()}
    </div>
  );
};

export default MouseEffect;