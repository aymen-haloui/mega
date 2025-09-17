import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LogoBackgroundProps {
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  speed?: 'slow' | 'medium' | 'fast';
}

export const LogoBackground = ({ 
  className = '', 
  intensity = 'medium',
  speed = 'medium' 
}: LogoBackgroundProps) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const intensityClasses = {
    low: 'opacity-5',
    medium: 'opacity-10',
    high: 'opacity-15'
  };

  const speedClasses = {
    slow: 20,
    medium: 15,
    fast: 10
  };

  const duration = speedClasses[speed];

  if (prefersReducedMotion) {
    return (
      <div className={`absolute inset-0 -z-10 ${className}`}>
        <div 
          className={`absolute inset-0 ${intensityClasses[intensity]}`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='logo' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cellipse cx='50' cy='50' rx='40' ry='25' fill='%23E31E24' stroke='%23F2C200' stroke-width='3'/%3E%3Ctext x='50' y='45' text-anchor='middle' fill='white' font-family='system-ui' font-weight='900' font-size='8'%3EMEGA%3C/text%3E%3Ctext x='50' y='58' text-anchor='middle' fill='white' font-family='system-ui' font-weight='900' font-size='8'%3EPIZZA%3C/text%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23logo)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat'
          }}
        />
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Animated Logo Pattern */}
      <motion.div
        className={`absolute inset-0 ${intensityClasses[intensity]}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='logo' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cellipse cx='50' cy='50' rx='40' ry='25' fill='%23E31E24' stroke='%23F2C200' stroke-width='3'/%3E%3Ctext x='50' y='45' text-anchor='middle' fill='white' font-family='system-ui' font-weight='900' font-size='8'%3EMEGA%3C/text%3E%3Ctext x='50' y='58' text-anchor='middle' fill='white' font-family='system-ui' font-weight='900' font-size='8'%3EPIZZA%3C/text%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23logo)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          backgroundRepeat: 'repeat'
        }}
        animate={{
          x: [0, -50, 0],
          y: [0, -25, 0],
          rotate: [0, 1, 0]
        }}
        transition={{
          duration,
          ease: 'easeInOut',
          repeat: Infinity
        }}
      />
      
      {/* Floating Logo Elements */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: '60px',
            height: '40px',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cellipse cx='50' cy='50' rx='40' ry='25' fill='%23E31E24' stroke='%23F2C200' stroke-width='2' opacity='0.3'/%3E%3Ctext x='50' y='45' text-anchor='middle' fill='white' font-family='system-ui' font-weight='900' font-size='8' opacity='0.5'%3EMEGA%3C/text%3E%3Ctext x='50' y='58' text-anchor='middle' fill='white' font-family='system-ui' font-weight='900' font-size='8' opacity='0.5'%3EPIZZA%3C/text%3E%3C/svg%3E")`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            rotate: [0, Math.random() * 10 - 5, 0],
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: duration + Math.random() * 10,
            delay: Math.random() * 5,
            ease: 'easeInOut',
            repeat: Infinity
          }}
        />
      ))}
    </div>
  );
};
