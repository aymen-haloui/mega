import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CloseButtonProps {
  onClose?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
}

export const CloseButton: React.FC<CloseButtonProps> = ({ 
  onClose, 
  className = '', 
  size = 'md',
  variant = 'ghost'
}) => {
  const navigate = useNavigate();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Default behavior: go back or go to home
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  };

  const sizeClasses = {
    sm: 'h-6 w-6 p-0',
    md: 'h-8 w-8 p-0',
    lg: 'h-10 w-10 p-0'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  return (
    <motion.div
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      className={`fixed top-4 right-4 z-50 ${className}`}
    >
      <Button
        variant={variant}
        size="sm"
        onClick={handleClose}
        className={`${sizeClasses[size]} hover:bg-destructive/10 hover:text-destructive transition-colors duration-200`}
        aria-label="Fermer"
      >
        <motion.div
          animate={{ rotate: 0 }}
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          <X className={iconSizes[size]} />
        </motion.div>
      </Button>
    </motion.div>
  );
};
