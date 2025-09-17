import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  X,
  Package,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { useNavigate } from 'react-router-dom';

interface CompactCartCardProps {
  className?: string;
  onClose?: () => void;
}

export const CompactCartCard: React.FC<CompactCartCardProps> = ({ className = '', onClose }) => {
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  const totalItems = getItemCount();
  const totalPrice = getTotal();

  const handleRemoveItem = async (dishId: string) => {
    setRemovingItem(dishId);
    setTimeout(() => {
      removeItem(dishId);
      setRemovingItem(null);
    }, 300);
  };

  const handleQuantityChange = (dishId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(dishId);
    } else {
      updateQuantity(dishId, newQuantity);
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
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

  const counterVariants = {
    bounce: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card className="card-gradient border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl overflow-hidden">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <motion.div
                className="relative"
                animate={totalItems > 0 ? "bounce" : ""}
                variants={counterVariants}
              >
                <ShoppingCart className="h-5 w-5 text-primary" />
                {totalItems > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
                  >
                    {totalItems}
                  </motion.div>
                )}
              </motion.div>
              <div>
                <h3 className="font-semibold text-sm">Mon Panier</h3>
                <p className="text-xs text-muted-foreground">
                  {totalItems === 0 ? 'Vide' : `${totalItems} article${totalItems > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            
            {totalItems > 0 && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs font-semibold">
                  {totalPrice.toLocaleString()} DA
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 w-6 p-0"
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <X className="h-3 w-3" />
                  </motion.div>
                </Button>
              </div>
            )}
          </div>

          {/* Expanded Items */}
          <AnimatePresence>
            {isExpanded && totalItems > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2 mb-3 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
              >
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.dish.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className={`relative p-2 rounded-lg border bg-card/50 backdrop-blur-sm transition-all duration-300 ${
                        removingItem === item.dish.id ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {/* Dish Icon */}
                        <div className="relative">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                            <Package className="h-4 w-4 text-primary" />
                          </div>
                          {item.quantity > 1 && (
                            <motion.div
                              className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.1 }}
                            >
                              {item.quantity}
                            </motion.div>
                          )}
                        </div>

                        {/* Dish Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-xs truncate">
                            {item.dish.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {(item.dish.priceCents / 100).toLocaleString()} DA
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-1">
                          <motion.div
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.dish.id, item.quantity - 1)}
                              className="h-5 w-5 p-0"
                              disabled={removingItem === item.dish.id}
                            >
                              <Minus className="h-2 w-2" />
                            </Button>
                          </motion.div>
                          
                          <motion.span
                            className="text-xs font-semibold min-w-[16px] text-center"
                            key={item.quantity}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.quantity}
                          </motion.span>
                          
                          <motion.div
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.dish.id, item.quantity + 1)}
                              className="h-5 w-5 p-0"
                            >
                              <Plus className="h-2 w-2" />
                            </Button>
                          </motion.div>
                        </div>

                        {/* Remove Button */}
                        <motion.div
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.dish.id)}
                            className="h-5 w-5 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={removingItem === item.dish.id}
                          >
                            <Trash2 className="h-2 w-2" />
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Actions */}
          {totalItems > 0 && (
            <motion.div
              className="flex items-center justify-between pt-2 border-t border-border/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-xs">
                <span className="text-muted-foreground">Total: </span>
                <span className="font-bold text-primary">
                  {totalPrice.toLocaleString()} DA
                </span>
              </div>
              
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Button
                  onClick={() => {
                    navigate('/cart');
                    if (onClose) onClose();
                  }}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-7 px-3"
                >
                  Commander
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Empty State */}
          {totalItems === 0 && (
            <motion.div
              className="text-center py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="w-10 h-10 mx-auto mb-2 rounded-full bg-muted/20 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              >
                <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              </motion.div>
              <p className="text-muted-foreground text-xs mb-2">
                Panier vide
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="text-xs h-6 px-2"
              >
                Découvrir
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
