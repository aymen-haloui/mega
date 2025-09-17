import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  X,
  Package
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cartStore';
import { AnimatedCartCard } from './animated-cart-card';

interface FloatingCartButtonProps {
  className?: string;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ className = '' }) => {
  const { getItemCount } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);

  const totalItems = getItemCount();

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

  const counterVariants = {
    bounce: {
      scale: [1, 1.3, 1],
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  };

  const overlayVariants = {
    hidden: {
      opacity: 0,
      backdropFilter: 'blur(0px)'
    },
    visible: {
      opacity: 1,
      backdropFilter: 'blur(4px)',
      transition: {
        duration: 0.3
      }
    }
  };

  const cartVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <>
      {/* Floating Cart Button */}
      <motion.div
        className={`fixed bottom-6 right-6 z-40 ${className}`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
      >
        <motion.div
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="relative"
        >
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="relative w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
            animate={totalItems > 0 ? "bounce" : ""}
            variants={counterVariants}
          >
            <motion.div
              animate={{ rotate: isOpen ? 45 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <ShoppingCart className="h-6 w-6" />
              )}
            </motion.div>

            {/* Item Counter Badge */}
            {totalItems > 0 && (
              <motion.div
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.2, 
                  type: 'spring', 
                  stiffness: 500,
                  damping: 15
                }}
              >
                {totalItems > 99 ? '99+' : totalItems}
              </motion.div>
            )}

            {/* Pulse Animation for Empty Cart */}
            {totalItems === 0 && (
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            )}
          </motion.button>

          {/* Tooltip */}
          <motion.div
            className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-foreground text-background text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            initial={{ opacity: 0, y: 5 }}
            whileHover={{ opacity: 1, y: 0 }}
          >
            {totalItems === 0 ? 'Voir Mon Panier' : `${totalItems} article${totalItems > 1 ? 's' : ''}`}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"></div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Cart Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="fixed inset-0 bg-black/20 z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Cart Panel */}
            <motion.div
              variants={cartVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] z-50"
            >
              <AnimatedCartCard onClose={() => setIsOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
