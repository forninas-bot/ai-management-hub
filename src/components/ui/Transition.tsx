import React, { useState, useEffect, useRef } from 'react';

type TransitionType = 'fade' | 'slide' | 'scale' | 'flip' | 'neural' | 'glitch';
type Direction = 'up' | 'down' | 'left' | 'right';

interface TransitionProps {
  children: React.ReactNode;
  show: boolean;
  type?: TransitionType;
  direction?: Direction;
  duration?: number;
  delay?: number;
  className?: string;
  onEnter?: () => void;
  onExit?: () => void;
}

const Transition: React.FC<TransitionProps> = ({
  children,
  show,
  type = 'fade',
  direction = 'up',
  duration = 300,
  delay = 0,
  className = '',
  onEnter,
  onExit
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
      onEnter?.();
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, duration + delay);
      
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(true);
      onExit?.();
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, delay, onEnter, onExit]);

  const getTransitionClasses = () => {
    const baseClasses = 'transition-all ease-out';
    const durationClass = `duration-${duration}`;
    const delayClass = delay > 0 ? `delay-${delay}` : '';

    switch (type) {
      case 'fade':
        return `${baseClasses} ${durationClass} ${delayClass} ${
          show ? 'opacity-100' : 'opacity-0'
        }`;

      case 'slide':
        const slideTransforms = {
          up: show ? 'translate-y-0' : 'translate-y-4',
          down: show ? 'translate-y-0' : '-translate-y-4',
          left: show ? 'translate-x-0' : 'translate-x-4',
          right: show ? 'translate-x-0' : '-translate-x-4'
        };
        return `${baseClasses} ${durationClass} ${delayClass} transform ${
          show ? 'opacity-100' : 'opacity-0'
        } ${slideTransforms[direction]}`;

      case 'scale':
        return `${baseClasses} ${durationClass} ${delayClass} transform ${
          show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`;

      case 'flip':
        return `${baseClasses} ${durationClass} ${delayClass} transform perspective-1000 ${
          show ? 'opacity-100 rotateX-0' : 'opacity-0 rotateX-90'
        }`;

      case 'neural':
        return `${baseClasses} ${durationClass} ${delayClass} transform ${
          show 
            ? 'opacity-100 scale-100 blur-0' 
            : 'opacity-0 scale-110 blur-sm'
        } neural-glow`;

      case 'glitch':
        return `${baseClasses} ${durationClass} ${delayClass} ${
          show ? 'opacity-100' : 'opacity-0'
        } ${isAnimating ? 'animate-glitch' : ''}`;

      default:
        return `${baseClasses} ${durationClass} ${delayClass} ${
          show ? 'opacity-100' : 'opacity-0'
        }`;
    }
  };

  if (!isVisible && !show) {
    return null;
  }

  return (
    <div
      ref={elementRef}
      className={`${getTransitionClasses()} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

// 頁面過渡組件
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <Transition
      show={isLoaded}
      type="neural"
      duration={600}
      className={className}
    >
      {children}
    </Transition>
  );
};

// 列表項動畫組件
interface ListItemTransitionProps {
  children: React.ReactNode;
  index: number;
  className?: string;
}

export const ListItemTransition: React.FC<ListItemTransitionProps> = ({ 
  children, 
  index, 
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100); // 錯開動畫時間

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Transition
      show={isVisible}
      type="slide"
      direction="up"
      duration={400}
      delay={index * 50}
      className={className}
    >
      {children}
    </Transition>
  );
};

export default Transition;