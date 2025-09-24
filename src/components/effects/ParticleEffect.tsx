import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

interface ParticleEffectProps {
  width?: number;
  height?: number;
  particleCount?: number;
  colors?: string[];
  speed?: number;
  size?: { min: number; max: number };
  opacity?: { min: number; max: number };
  interactive?: boolean;
  className?: string;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({
  width = 800,
  height = 600,
  particleCount = 50,
  colors = ['#00D4FF', '#7C3AED', '#F472B6', '#FB923C', '#34D399'],
  speed = 1,
  size = { min: 1, max: 3 },
  opacity = { min: 0.1, max: 0.8 },
  interactive = true,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  
  // 創建粒子
  const createParticle = (w: number = width, h: number = height): Particle => {
    const maxLife = 200 + Math.random() * 300;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: size.min + Math.random() * (size.max - size.min),
      opacity: opacity.min + Math.random() * (opacity.max - opacity.min),
      color: colors[Math.floor(Math.random() * colors.length)],
      life: maxLife,
      maxLife
    };
  };
  
  // 初始化粒子
  const initParticles = () => {
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(createParticle());
    }
  };
  
  // 更新粒子
  const updateParticles = () => {
    const particles = particlesRef.current;
    const mouse = mouseRef.current;
    
    particles.forEach((particle, index) => {
      // 更新位置
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // 鼠標交互
      if (interactive) {
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          particle.vx += (dx / distance) * force * 0.01;
          particle.vy += (dy / distance) * force * 0.01;
        }
      }
      
      // 邊界檢測
      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;
      
      // 保持在邊界內
      particle.x = Math.max(0, Math.min(width, particle.x));
      particle.y = Math.max(0, Math.min(height, particle.y));
      
      // 更新生命週期
      particle.life--;
      particle.opacity = (particle.life / particle.maxLife) * (opacity.min + Math.random() * (opacity.max - opacity.min));
      
      // 重生粒子
      if (particle.life <= 0) {
        particles[index] = createParticle();
      }
    });
  };
  
  // 繪製粒子
  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, width, height);
    
    const particles = particlesRef.current;
    
    // 繪製連接線
    particles.forEach((particle, i) => {
      particles.slice(i + 1).forEach(otherParticle => {
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 80) {
          const opacity = (80 - distance) / 80 * 0.2;
          ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(otherParticle.x, otherParticle.y);
          ctx.stroke();
        }
      });
    });
    
    // 繪製粒子
    particles.forEach(particle => {
      ctx.save();
      
      // 創建漸變
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      );
      
      // 解析顏色 - 確保顏色格式正確
      const color = particle.color;
      const baseColor = color.length === 7 ? color : color.substring(0, 7); // 確保只取前7位 (#RRGGBB)
      const alphaHex = Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
      gradient.addColorStop(0, `${baseColor}${alphaHex}`);
      gradient.addColorStop(1, `${baseColor}00`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      // 添加光暈效果
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = particle.size * 2;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
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
    
    updateParticles();
    drawParticles(ctx);
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  // 鼠標移動處理
  const handleMouseMove = (event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 設置畫布大小
    canvas.width = width;
    canvas.height = height;
    
    // 初始化
    initParticles();
    animate();
    
    // 添加事件監聽
    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (interactive && canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [width, height, particleCount, speed]);
  
  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-${interactive ? 'auto' : 'none'} ${className}`}
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

export default ParticleEffect;