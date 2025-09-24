import React from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'text' | 'icon' | 'van-gogh' | 'neural' | 'glass' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  glow?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'van-gogh', 
  size = 'md',
  children, 
  className = '',
  loading = false,
  glow = false,
  fullWidth = false,
  disabled,
  ...props 
}) => {
  const baseClasses = `
    font-medium transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 
    relative overflow-hidden group 
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm rounded-lg min-w-[2rem]',
    md: 'h-10 px-4 text-sm rounded-xl min-w-[2.5rem]',
    lg: 'h-12 px-6 text-base rounded-xl min-w-[3rem]',
    xl: 'h-14 px-8 text-lg rounded-2xl min-w-[3.5rem]'
  };
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500/50 shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 focus:ring-orange-500/50 shadow-lg hover:shadow-xl',
    text: 'bg-transparent text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100/50 focus:ring-neutral-400/50',
    icon: 'bg-neutral-100/50 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-200/50 aspect-square rounded-full flex items-center justify-center focus:ring-neutral-400/50',
    'van-gogh': 'bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-yellow-600 focus:ring-blue-500/50 shadow-lg hover:shadow-xl bg-[length:200%_100%] hover:bg-[position:100%_0%]',
    neural: 'bg-gradient-to-br from-neutral-50/80 to-white/60 text-neutral-700 hover:from-neutral-100/80 hover:to-white/80 border border-neutral-200/50 hover:border-neutral-300/50 focus:ring-neutral-400/50 shadow-md hover:shadow-lg backdrop-blur-sm',
    glass: 'bg-white/10 text-neutral-700 hover:bg-white/20 backdrop-blur-xl border border-white/20 hover:border-white/30 focus:ring-white/50 shadow-lg',
    outline: 'bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500/50 shadow-sm hover:shadow-md'
  };
  
  const glowClass = glow ? 'animate-van-gogh-glow' : '';
  
  // 分離HTML button props和motion props，排除與framer-motion衝突的事件處理器
  const { 
    onDrag, 
    onDragStart, 
    onDragEnd,
    onAnimationStart,
    onAnimationEnd,
    onAnimationIteration,
    onTransitionEnd,
    ...buttonProps 
  } = props;
  const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${glowClass} ${className || ''}`.trim();

  return (
    <motion.button
      {...buttonProps}
      className={buttonClasses}
      disabled={disabled || loading}
      whileHover={{ 
        scale: variant === 'icon' ? 1.1 : 1.02,
        transition: { duration: 0.2, ease: 'easeOut' }
      }}
      whileTap={{ 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* 載入動畫 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-van-gogh-spin" />
        </div>
      )}
      
      {/* 按鈕內容 */}
      <span className={`transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      
      {/* 梵高風格光效 */}
      {(variant === 'van-gogh' || variant === 'primary' || variant === 'secondary') && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </div>
      )}
      
      {/* 梵高風格筆觸紋理 */}
      {variant === 'van-gogh' && (
        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" 
               style={{
                 backgroundImage: `repeating-linear-gradient(
                   45deg,
                   transparent,
                   transparent 2px,
                   rgba(255,255,255,0.1) 2px,
                   rgba(255,255,255,0.1) 4px
                 )`
               }} />
        </div>
      )}
    </motion.button>
  );
};

export default Button;