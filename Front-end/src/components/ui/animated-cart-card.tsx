import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  X,
  Package,
  Heart,
  Star,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { useNavigate } from 'react-router-dom';

interface AnimatedCartCardProps {
  className?: string;
  onClose?: () => void;
}

export const AnimatedCartCard: React.FC<AnimatedCartCardProps> = ({ className = '', onClose }) => {
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [removingItem, setRemovingItem] = useState<string | null>(null);

  const totalItems = getItemCount();
  const totalPrice = getTotal();

  const handleRemoveItem = async (dishId: string) => {
    setRemovingItem(dishId);
    // Add a small delay for animation
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

  const cartVariants = {
    collapsed: {
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    },
    expanded: {
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
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
      <Card className="card-gradient border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className="relative"
                animate={totalItems > 0 ? "bounce" : ""}
                variants={counterVariants}
              >
                <ShoppingCart className="h-6 w-6 text-primary" />
                {totalItems > 0 && (
                  <motion.div
                    className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
                  >
                    {totalItems}
                  </motion.div>
                )}
              </motion.div>
              <div>
                <CardTitle className="text-lg">Mon Panier</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {totalItems === 0 ? 'Votre panier est vide' : `${totalItems} article${totalItems > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            
            {totalItems > 0 && (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-sm font-semibold">
                  {totalPrice.toLocaleString()} DA
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 w-8 p-0"
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <X className="h-4 w-4" />
                  </motion.div>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <AnimatePresence>
          {totalItems > 0 && (
            <motion.div
              variants={cartVariants}
              initial="collapsed"
              animate={isExpanded ? "expanded" : "collapsed"}
              exit="collapsed"
            >
              <CardContent className="pt-0">
                <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.dish.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className={`relative p-3 rounded-lg border bg-card/50 backdrop-blur-sm transition-all duration-300 ${
                          removingItem === item.dish.id ? 'opacity-50 scale-95' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {/* Dish Image Placeholder */}
                          <div className="relative">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                              <Package className="h-6 w-6 text-primary" />
                            </div>
                            {item.quantity > 1 && (
                              <motion.div
                                className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
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
                            <h4 className="font-semibold text-sm truncate">
                              {item.dish.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {(item.dish.priceCents / 100).toLocaleString()} DA
                            </p>
                            {item.specialInstructions && (
                              <p className="text-xs text-muted-foreground italic">
                                "{item.specialInstructions}"
                              </p>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <motion.div
                              variants={buttonVariants}
                              whileHover="hover"
                              whileTap="tap"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.dish.id, item.quantity - 1)}
                                className="h-7 w-7 p-0"
                                disabled={removingItem === item.dish.id}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                            </motion.div>
                            
                            <motion.span
                              className="text-sm font-semibold min-w-[20px] text-center"
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
                                className="h-7 w-7 p-0"
                              >
                                <Plus className="h-3 w-3" />
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
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={removingItem === item.dish.id}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Cart Actions */}
                <motion.div
                  className="mt-4 pt-4 border-t border-border/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-bold text-lg text-primary">
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
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Commander
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {totalItems === 0 && (
          <CardContent className="pt-0">
            <motion.div
              className="text-center py-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center"
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
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </motion.div>
              <p className="text-muted-foreground text-sm mb-4">
                Ajoutez des plats délicieux à votre panier
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="text-sm"
              >
                Découvrir nos plats
              </Button>
            </motion.div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};
