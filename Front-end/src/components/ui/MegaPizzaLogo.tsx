import { motion } from 'framer-motion';
import { ChefHat } from 'lucide-react';

interface MegaPizzaLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  animate?: boolean;
}

export const MegaPizzaLogo = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  animate = true 
}: MegaPizzaLogoProps) => {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-12 w-16',
    lg: 'h-16 w-20',
    xl: 'h-20 w-24'
  };

  const textSizeClasses = {
    xs: 'text-[8px]',
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-base'
  };

  const chefHatSizeClasses = {
    xs: 'h-2 w-2',
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6'
  };

  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={animate ? { scale: 1.05 } : {}}
      transition={{ duration: 0.2 }}
    >
      {/* Main Logo Container */}
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Red Oval Background */}
        <div 
          className="absolute inset-0 rounded-full border-2"
          style={{
            backgroundColor: '#E31E24',
            borderColor: '#F2C200',
            borderWidth: '3px'
          }}
        />
        
        {/* Text Content */}
        {showText && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            {/* MEGA Text */}
            <div 
              className={`font-black text-white leading-none ${textSizeClasses[size]}`}
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 900,
                letterSpacing: '0.02em',
                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                lineHeight: '0.8'
              }}
            >
              MEGA
            </div>
            
            {/* PIZZA Text */}
            <div 
              className={`font-black text-white leading-none ${textSizeClasses[size]}`}
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 900,
                letterSpacing: '0.02em',
                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                lineHeight: '0.8'
              }}
            >
              PIZZA
            </div>
          </div>
        )}
        
        {/* Chef Hat */}
        <motion.div
          className="absolute -top-1 -right-1 z-20"
          animate={animate ? {
            rotate: [0, -5, 5, 0],
            y: [0, -2, 0]
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <ChefHat 
            className={`${chefHatSizeClasses[size]} text-white`}
            style={{
              filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))',
              strokeWidth: 2
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};
