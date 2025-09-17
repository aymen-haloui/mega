import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CloseButton } from '@/components/ui/close-button';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useBranchesStore } from '@/store/branchesStore';
import { ordersAPI } from '@/api/orders';
import { Order } from '@/types';

export const OrdersPage = () => {
  const { orders, refresh, loading } = useOrdersStore();
  const { branches } = useBranchesStore();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [userPhone, setUserPhone] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  useEffect(() => {
    // Load orders from localStorage or get from URL params
    const savedPhone = localStorage.getItem('lastUserPhone') || '';
    setUserPhone(savedPhone);
    
    console.log('OrdersPage - orders changed:', orders.length, 'orders');
    console.log('OrdersPage - orders data:', orders.map(o => ({ id: o.id, status: o.status, userPhone: o.userPhone })));
    
    if (savedPhone) {
      const filtered = orders.filter(order => order.userPhone === savedPhone);
      console.log('OrdersPage - filtered orders for phone', savedPhone, ':', filtered.length, 'orders');
      setUserOrders(filtered);
    } else {
      setUserOrders([]);
    }
  }, [orders]);

  // Auto-refresh orders every 15 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log('OrdersPage - Auto refresh triggered');
      setIsAutoRefreshing(true);
      try {
        // Force refresh by calling the API directly
        const { useOrdersStore } = await import('@/store/ordersStore');
        const store = useOrdersStore.getState();
        
        // Get fresh data from API
        const response = await ordersAPI.getOrders();
        const freshOrders = response.data || response;
        
        // Update store directly
        useOrdersStore.setState({ orders: freshOrders });
        
        console.log('OrdersPage - Auto refresh completed, fresh orders:', freshOrders.length);
        console.log('OrdersPage - Fresh orders data:', freshOrders.map(o => ({ id: o.id, status: o.status, userPhone: o.userPhone })));
        
        // Update user orders after refresh
        if (userPhone) {
          const filtered = freshOrders.filter(order => order.userPhone === userPhone);
          console.log('OrdersPage - Filtered fresh orders:', filtered.length, 'orders');
          setUserOrders(filtered);
        }
      } finally {
        setIsAutoRefreshing(false);
      }
    }, 15000); // Reduced to 15 seconds for more frequent updates

    return () => clearInterval(interval);
  }, [userPhone]);

  // Refresh on window focus for immediate updates
  useEffect(() => {
    const handleFocus = async () => {
      await refresh();
      // Update user orders after refresh
      if (userPhone) {
        const { useOrdersStore } = await import('@/store/ordersStore');
        const freshOrders = useOrdersStore.getState().orders;
        const filtered = freshOrders.filter(order => order.userPhone === userPhone);
        setUserOrders(filtered);
      }
    };

    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        await refresh();
        // Update user orders after refresh
        if (userPhone) {
          const { useOrdersStore } = await import('@/store/ordersStore');
          const freshOrders = useOrdersStore.getState().orders;
          const filtered = freshOrders.filter(order => order.userPhone === userPhone);
          setUserOrders(filtered);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refresh, userPhone]);

  const handleManualRefresh = async () => {
    console.log('OrdersPage - Manual refresh triggered');
    setIsRefreshing(true);
    try {
      // Force refresh by calling the API directly
      const { useOrdersStore } = await import('@/store/ordersStore');
      
      // Get fresh data from API
      const response = await ordersAPI.getOrders();
      const freshOrders = response.data || response;
      
      // Update store directly
      useOrdersStore.setState({ orders: freshOrders });
      
      console.log('OrdersPage - Manual refresh completed, fresh orders:', freshOrders.length);
      console.log('OrdersPage - Fresh orders data (manual):', freshOrders.map(o => ({ id: o.id, status: o.status, userPhone: o.userPhone })));
      
      // Immediately update user orders after refresh
      if (userPhone) {
        const filtered = freshOrders.filter(order => order.userPhone === userPhone);
        console.log('OrdersPage - Filtered fresh orders (manual):', filtered.length, 'orders');
        setUserOrders(filtered);
      }
    } catch (error) {
      console.error('Client OrdersPage - Manual refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePhoneSubmit = (phone: string) => {
    setUserPhone(phone);
    localStorage.setItem('lastUserPhone', phone);
    setUserOrders(orders.filter(order => order.userPhone === phone));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        label: 'En Attente',
        color: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
        icon: Clock
      },
      ACCEPTED: {
        label: 'Acceptée',
        color: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
        icon: CheckCircle
      },
      PREPARING: {
        label: 'En Préparation',
        color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
        icon: Package
      },
      READY: {
        label: 'Prête',
        color: 'bg-green-500/10 border-green-500/20 text-green-500',
        icon: CheckCircle
      },
      OUT_FOR_DELIVERY: {
        label: 'En Livraison',
        color: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
        icon: Truck
      },
      COMPLETED: {
        label: 'Livrée',
        color: 'bg-green-500/10 border-green-500/20 text-green-500',
        icon: CheckCircle
      },
      CANCELED: {
        label: 'Annulée',
        color: 'bg-red-500/10 border-red-500/20 text-red-500',
        icon: XCircle
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const IconComponent = config.icon;

    return (
      <Badge variant="outline" className={config.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : 'Branche inconnue';
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <CloseButton />
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mes Commandes</h1>
              <p className="text-muted-foreground">
                Suivez l'état de vos commandes en temps réel
              </p>
            </div>
            {userPhone && (
              <Button
                onClick={handleManualRefresh}
                disabled={isRefreshing || loading}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                {isRefreshing || loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>Actualiser</span>
              </Button>
            )}
          </div>
        </motion.div>

        {/* Phone Input Form */}
        {!userPhone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="text-center">Voir mes commandes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Numéro de téléphone</label>
                    <input
                      type="tel"
                      placeholder="+213 XXX XXX XXX"
                      className="w-full mt-1 px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          if (target.value.trim()) {
                            handlePhoneSubmit(target.value.trim());
                          }
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={() => {
                      const input = document.querySelector('input[type="tel"]') as HTMLInputElement;
                      if (input?.value.trim()) {
                        handlePhoneSubmit(input.value.trim());
                      }
                    }}
                    className="w-full btn-primary"
                  >
                    Voir mes commandes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Orders List */}
        <div className="space-y-6">
          {userPhone && userOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Aucune commande trouvée
              </h3>
              <p className="text-muted-foreground mb-6">
                Aucune commande trouvée pour le numéro {userPhone}
              </p>
              <Button
                onClick={() => {
                  setUserPhone('');
                  localStorage.removeItem('lastUserPhone');
                }}
                variant="outline"
              >
                Changer de numéro
              </Button>
            </motion.div>
          ) : userPhone && userOrders.length > 0 ? (
            userOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="card-gradient hover-scale">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          Commande #{order.orderNumber}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {getBranchName(order.branchId)}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex items-center justify-end space-x-2">
                          {getStatusBadge(order.status)}
                          {(loading || isAutoRefreshing) && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>{isAutoRefreshing ? 'Actualisation...' : 'Mise à jour...'}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-primary">
                          {(order.totalCents / 100).toLocaleString()} DA
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{order.deliveryAddress || 'Adresse non spécifiée'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{order.userPhone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{order.userName}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Date: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Heure: {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Commande #{order.orderNumber}
                        </p>
                      </div>
                    </div>

                    {/* Products */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Produits commandés:</h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm bg-muted/20 p-2 rounded">
                            <span>{item.dish.name}</span>
                            <span className="text-muted-foreground">
                              x{item.qty} - {(item.priceCents / 100).toLocaleString()} DA
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="space-y-1">
                        <h4 className="font-medium">Notes:</h4>
                        <p className="text-sm text-muted-foreground bg-muted/20 p-2 rounded">
                          {order.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : null}
        </div>
      </div>
    </div>
  );
};
