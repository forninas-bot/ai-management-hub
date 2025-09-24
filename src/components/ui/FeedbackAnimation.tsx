import React, { useState, useEffect } from 'react';

type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading';
type AnimationType = 'bounce' | 'shake' | 'pulse' | 'glow' | 'ripple' | 'neural';

interface FeedbackAnimationProps {
  type: FeedbackType;
  animation?: AnimationType;
  message?: string;
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

const FeedbackAnimation: React.FC<FeedbackAnimationProps> = ({
  type,
  animation = 'bounce',
  message,
  duration = 3000,
  onComplete,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          text: 'text-white',
          icon: '✓',
          glow: 'shadow-green-500/50'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          text: 'text-white',
          icon: '✕',
          glow: 'shadow-red-500/50'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500',
          text: 'text-white',
          icon: '⚠',
          glow: 'shadow-yellow-500/50'
        };
      case 'info':
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          icon: 'ℹ',
          glow: 'shadow-blue-500/50'
        };
      case 'loading':
        return {
          bg: 'bg-ai-cyan',
          text: 'text-white',
          icon: '⟳',
          glow: 'shadow-ai-cyan/50'
        };
      default:
        return {
          bg: 'bg-neural-600',
          text: 'text-white',
          icon: '•',
          glow: 'shadow-neural-600/50'
        };
    }
  };

  const getAnimationClasses = () => {
    if (!isAnimating) return 'opacity-0 scale-95';

    switch (animation) {
      case 'bounce':
        return 'animate-bounce';
      case 'shake':
        return 'animate-shake';
      case 'pulse':
        return 'animate-pulse';
      case 'glow':
        return 'animate-glow';
      case 'ripple':
        return 'animate-ripple';
      case 'neural':
        return 'animate-neural-pulse';
      default:
        return 'animate-bounce';
    }
  };

  const styles = getTypeStyles();

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className={`
        ${styles.bg} ${styles.text}
        px-4 py-3 rounded-lg shadow-lg ${styles.glow}
        flex items-center space-x-3
        transition-all duration-300
        ${getAnimationClasses()}
      `}>
        <span className="text-lg font-bold">{styles.icon}</span>
        {message && <span className="font-medium">{message}</span>}
      </div>
    </div>
  );
};

// 按鈕點擊反饋組件
interface ButtonFeedbackProps {
  children: React.ReactNode;
  onClick?: () => void;
  feedbackType?: FeedbackType;
  className?: string;
  disabled?: boolean;
}

export const ButtonFeedback: React.FC<ButtonFeedbackProps> = ({
  children,
  onClick,
  feedbackType = 'success',
  className = '',
  disabled = false
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    
    setIsPressed(true);
    setShowFeedback(true);
    onClick?.();
    
    setTimeout(() => setIsPressed(false), 150);
  };

  return (
    <>
      <button
        className={`
          relative overflow-hidden
          transform transition-all duration-150
          ${isPressed ? 'scale-95' : 'scale-100'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          ${className}
        `}
        onClick={handleClick}
        disabled={disabled}
      >
        {children}
        
        {/* 漣漪效果 */}
        {isPressed && (
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
        )}
      </button>
      
      {showFeedback && (
        <FeedbackAnimation
          type={feedbackType}
          animation="ripple"
          duration={1000}
          onComplete={() => setShowFeedback(false)}
        />
      )}
    </>
  );
};

// 表單提交反饋組件
interface FormFeedbackProps {
  isSubmitting: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export const FormFeedback: React.FC<FormFeedbackProps> = ({
  isSubmitting,
  isSuccess,
  isError,
  successMessage = '提交成功！',
  errorMessage = '提交失敗，請重試'
}) => {
  if (isSubmitting) {
    return (
      <FeedbackAnimation
        type="loading"
        animation="neural"
        message="正在提交..."
        duration={10000}
      />
    );
  }

  if (isSuccess) {
    return (
      <FeedbackAnimation
        type="success"
        animation="bounce"
        message={successMessage}
        duration={3000}
      />
    );
  }

  if (isError) {
    return (
      <FeedbackAnimation
        type="error"
        animation="shake"
        message={errorMessage}
        duration={4000}
      />
    );
  }

  return null;
};

export default FeedbackAnimation;