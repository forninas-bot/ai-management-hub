import React from 'react';
import { motion } from 'framer-motion';

type CardVariant = 'default' | 'glass' | 'neural' | 'van-gogh' | 'elevated';
type CardSize = 'sm' | 'md' | 'lg' | 'xl';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  emphasized?: boolean;
  interactive?: boolean;
  glow?: boolean;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'van-gogh',
  size = 'md',
  emphasized = false, 
  interactive = false,
  glow = false,
  className = '',
  onClick
}) => {
  const sizeClasses = {
    sm: 'p-3 rounded-lg',
    md: 'p-4 rounded-xl',
    lg: 'p-6 rounded-2xl',
    xl: 'p-8 rounded-3xl'
  };
  
  const variantClasses = {
    default: 'bg-white border border-neutral-200/50 shadow-md hover:shadow-lg',
    glass: 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:bg-white/20',
    neural: 'bg-gradient-to-br from-neutral-50/80 to-white/60 border border-neutral-200/30 shadow-lg hover:shadow-xl backdrop-blur-sm',
    'van-gogh': 'bg-gradient-to-br from-white/95 to-blue-50/80 border border-blue-200/30 shadow-lg hover:shadow-xl backdrop-blur-sm hover:border-blue-300/50',
    elevated: 'bg-white border border-neutral-200/50 shadow-xl hover:shadow-2xl transform hover:-translate-y-1'
  };
  
  const emphasizedClasses = emphasized 
    ? 'ring-2 ring-blue-500/20 border-blue-300/50 shadow-xl' 
    : '';
    
  const glowClasses = glow
    ? 'shadow-2xl shadow-blue-500/25 ring-2 ring-blue-400/30'
    : '';
    
  const interactiveClasses = interactive || onClick
    ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
    : '';
  
  const baseClasses = `
    transition-all duration-300 ease-out
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${emphasizedClasses}
    ${glowClasses}
    ${interactiveClasses}
    group
    relative
    overflow-hidden
  `;
  
  return (
    <motion.div
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={interactive || onClick ? { 
        scale: 1.02,
        transition: { duration: 0.2 }
      } : undefined}
      whileTap={interactive || onClick ? { 
        scale: 0.98,
        transition: { duration: 0.1 }
      } : undefined}
    >
      {/* 梵高風格裝飾邊框 */}
      {variant === 'van-gogh' && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      
      {/* 內容區域 */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* 互動光效 */}
      {(interactive || onClick) && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </div>
      )}
    </motion.div>
  );
};

export default Card;