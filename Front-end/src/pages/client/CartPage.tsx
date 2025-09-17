import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Package,
  MapPin,
  Clock,
  ArrowRight,
  Heart,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogoBackground } from '@/components/ui/LogoBackground';
import { CloseButton } from '@/components/ui/close-button';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useBranchesStore } from '@/store/branchesStore';
import { useDishesStore } from '@/store/dishesStore';
import { useNavigate } from 'react-router-dom';

export const CartPage = () => {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const { createOrder } = useOrdersStore();
  const { branches, load: loadBranches } = useBranchesStore();
  const { dishes, load: loadDishes } = useDishesStore();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');

  useEffect(() => {
    // Load data from stores
    loadBranches();
    loadDishes();
  }, [loadBranches, loadDishes]);

  // No user authentication needed for clients


  const getBranchDetails = (branchId: string) => {
    return branches.find(branch => branch.id === branchId);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!userName.trim()) {
      alert('Veuillez saisir votre nom');
      return;
    }
    if (!userPhone.trim()) {
      alert('Veuillez saisir un numéro de téléphone');
      return;
    }

    // No authentication required for clients - they just provide name and phone

    try {
      // Get the branch ID from the first item
      const branchId = items[0]?.dish.menu.branchId || '1';
      
      // Create order using the new API structure
      console.log('Creating order with data:', {
        branchId,
        userName,
        userPhone,
        items: items.map(item => ({
          dishId: item.dishId,
          qty: item.quantity,
          priceCents: item.priceCents
        }))
      });

      const orderData = {
        branchId,
        userName,
        userPhone,
        items: items.map(item => ({
          dishId: item.dishId,
          qty: item.quantity,
          priceCents: item.priceCents
        }))
      };

      // Create order using the store
      const order = await createOrder(orderData);
      console.log('Order created successfully:', order);
      
      // Save user phone for future order tracking
      localStorage.setItem('lastUserPhone', userPhone);
      
      // Clear cart
      clearCart();
      
      // Small delay to ensure order is properly added to store
      setTimeout(() => {
        // Navigate to order tracking page
        navigate(`/order/${order.id}`);
      }, 100);
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Erreur lors de la création de la commande: ' + (error as Error).message);
    }
  };

  const subtotal = getTotal();
  const total = subtotal;

  if (items.length === 0) {
    return (
      <div className="relative min-h-screen">
        <LogoBackground intensity="low" speed="slow" />
        <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">Votre Panier est Vide</h1>
          <p className="text-muted-foreground mb-8">
            Découvrez nos délicieux plats et commencez à commander !
          </p>
          <Button onClick={() => navigate('/')} className="btn-primary">
            Découvrir le Menu
          </Button>
        </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <LogoBackground intensity="low" speed="slow" />
      <CloseButton />
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-2">Votre Panier</h1>
            <p className="text-muted-foreground">
              {items.length} article{items.length > 1 ? 's' : ''} dans votre panier
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => {
                const dish = item.dish;

                return (
                  <motion.div
                    key={item.dishId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                  <Card className="card-gradient hover-scale">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        {/* Dish Image */}
                        <div className="w-20 h-20 bg-muted/20 rounded-lg overflow-hidden flex-shrink-0">
                          {dish.imageUrl ? (
                            <img 
                              src={dish.imageUrl} 
                              alt={dish.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Dish Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{dish.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {dish.description}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.dishId)}
                              className="hover:bg-red-500/10 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.dishId, item.quantity - 1)}
                                className="w-8 h-8 p-0"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-12 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.dishId, item.quantity + 1)}
                                className="w-8 h-8 p-0"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">
                                {(dish.priceCents * item.quantity / 100).toLocaleString()} DA
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {(dish.priceCents / 100).toLocaleString()} DA l'unité
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {/* Clear Cart Button */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={clearCart}
                className="hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vider le Panier
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <Card className="card-gradient sticky top-8">
              <CardHeader>
                <CardTitle>Résumé de la Commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Informations Client</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Votre nom</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Entrez votre nom complet"
                        className="w-full mt-1 px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Numéro de téléphone</label>
                      <input
                        type="tel"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        placeholder="+213 XXX XXX XXX"
                        className="w-full mt-1 px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total ({items.length} article{items.length > 1 ? 's' : ''})</span>
                    <span className="text-primary">{(total / 100).toLocaleString()} DA</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button 
                  onClick={handleCheckout} 
                  className="w-full btn-primary"
                  disabled={items.length === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Confirmer la Commande
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                {/* Additional Info */}
                <div className="text-center text-sm text-muted-foreground">
                  <p>Livraison gratuite à partir de 2000 DA</p>
                  <p>Temps de livraison estimé: 30-45 minutes</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
