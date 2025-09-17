import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  MapPin,
  Clock,
  Phone,
  User,
  ArrowLeft,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { CloseButton } from '@/components/ui/close-button';
import { useOrdersStore } from '@/store/ordersStore';
import { useDishesStore } from '@/store/dishesStore';
import { useBranchesStore } from '@/store/branchesStore';
import { ordersAPI } from '@/api/orders';
import { Order as OrderType } from '@/types';

export const TraceOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orders: allOrders, refresh } = useOrdersStore();
  const { dishes } = useDishesStore();
  const { branches } = useBranchesStore();
  
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get order ID from URL parameters
    const orderId = location.pathname.split('/order/')[1];
    if (orderId) {
      loadOrder(orderId);
    } else {
      setError('ID de commande non trouvé');
    }
  }, [location.pathname]); // Remove allOrders dependency to prevent infinite loops

  // Update selected order when orders change (for real-time updates)
  useEffect(() => {
    if (selectedOrder && allOrders.length > 0) {
      const orderId = location.pathname.split('/order/')[1];
      if (orderId) {
        // Find the updated order
        let updatedOrder = allOrders.find(o => o.id === orderId);
        if (!updatedOrder) {
          const orderNumber = parseInt(orderId);
          if (!isNaN(orderNumber)) {
            updatedOrder = allOrders.find(o => o.orderNumber === orderNumber);
          }
        }
        
        if (updatedOrder && updatedOrder.status !== selectedOrder.status) {
          setSelectedOrder(updatedOrder);
        }
      }
    }
  }, [allOrders, selectedOrder, location.pathname]);

  // Auto-refresh orders to ensure we have the latest data
  useEffect(() => {
    const interval = setInterval(async () => {
      console.log('TraceOrderPage - Auto refresh triggered');
      
      // Force refresh by calling the API directly
      const { useOrdersStore } = await import('@/store/ordersStore');
      
      // Get fresh data from API
      const response = await ordersAPI.getOrders();
      const freshOrders = response.data || response;
      
      // Update store directly
      useOrdersStore.setState({ orders: freshOrders });
      
      console.log('TraceOrderPage - Auto refresh completed, fresh orders:', freshOrders.length);
      console.log('TraceOrderPage - Fresh orders data:', freshOrders.map(o => ({ id: o.id, status: o.status, orderNumber: o.orderNumber })));
      
      // Update selected order after refresh
      if (selectedOrder) {
        const orderId = location.pathname.split('/order/')[1];
        
        if (orderId) {
          let updatedOrder = freshOrders.find(o => o.id === orderId);
          if (!updatedOrder) {
            const orderNumber = parseInt(orderId);
            if (!isNaN(orderNumber)) {
              updatedOrder = freshOrders.find(o => o.orderNumber === orderNumber);
            }
          }
          
          console.log('TraceOrderPage - Current selected order:', selectedOrder?.status);
          console.log('TraceOrderPage - Updated order found:', updatedOrder?.status);
          
          if (updatedOrder && updatedOrder.status !== selectedOrder.status) {
            console.log('TraceOrderPage - Status changed from', selectedOrder.status, 'to', updatedOrder.status);
            setSelectedOrder(updatedOrder);
          }
        }
      }
    }, 5000); // Refresh every 5 seconds for more frequent updates

    return () => clearInterval(interval);
  }, [selectedOrder, location.pathname]);

  const loadOrder = async (orderId: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      // First, try to refresh the orders to ensure we have the latest data
      await refresh();
      
      // Get fresh orders from store after refresh
      const { useOrdersStore } = await import('@/store/ordersStore');
      const freshOrders = useOrdersStore.getState().orders;
      
      // Find the order by ID
      let order = freshOrders.find(o => o.id === orderId);
      
      // If not found by ID, try to find by orderNumber (fallback)
      if (!order) {
        const orderNumber = parseInt(orderId);
        if (!isNaN(orderNumber)) {
          order = freshOrders.find(o => o.orderNumber === orderNumber);
        }
      }
      
      if (order) {
        setSelectedOrder(order);
        setError('');
      } else {
        setError('Commande non trouvée. Veuillez vérifier l\'ID de la commande.');
      }
    } catch (error) {
      console.error('TraceOrderPage - Error loading order:', error);
      setError('Erreur lors du chargement de la commande');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    const orderId = location.pathname.split('/order/')[1];
    if (orderId) {
      console.log('TraceOrderPage - Manual refresh triggered');
      
      // Force refresh by calling the API directly
      const { useOrdersStore } = await import('@/store/ordersStore');
      
      // Get fresh data from API
      const response = await ordersAPI.getOrders();
      const freshOrders = response.data || response;
      
      // Update store directly
      useOrdersStore.setState({ orders: freshOrders });
      
      console.log('TraceOrderPage - Manual refresh completed, fresh orders:', freshOrders.length);
      
      // Then immediately find and update the selected order
      let order = freshOrders.find(o => o.id === orderId);
      if (!order) {
        const orderNumber = parseInt(orderId);
        if (!isNaN(orderNumber)) {
          order = freshOrders.find(o => o.orderNumber === orderNumber);
        }
      }
      
      if (order) {
        console.log('TraceOrderPage - Order found after manual refresh:', order.status);
        setSelectedOrder(order);
        setError('');
      } else {
        console.log('TraceOrderPage - Order not found after manual refresh');
        setError('Commande non trouvée. Veuillez vérifier l\'ID de la commande.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { color: 'bg-orange-500/10 border-orange-500/20 text-orange-500', label: 'En Attente' },
      'ACCEPTED': { color: 'bg-blue-500/10 border-blue-500/20 text-blue-500', label: 'Acceptée' },
      'PREPARING': { color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500', label: 'En Préparation' },
      'READY': { color: 'bg-green-500/10 border-green-500/20 text-green-500', label: 'Prête' },
      'OUT_FOR_DELIVERY': { color: 'bg-purple-500/10 border-purple-500/20 text-purple-500', label: 'En Livraison' },
      'COMPLETED': { color: 'bg-green-500/10 border-green-500/20 text-green-500', label: 'Livrée' },
      'CANCELED': { color: 'bg-red-500/10 border-red-500/20 text-red-500', label: 'Annulée' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['PENDING'];
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getProductDetails = (productId: string) => {
    return dishes.find(p => p.id === productId);
  };

  const getBranchDetails = (branchId: string) => {
    return branches.find(b => b.id === branchId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <RefreshCw className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-spin" />
          <p className="text-muted-foreground">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <XCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-x-4">
            <Button 
              onClick={() => {
                const orderId = location.pathname.split('/order/')[1];
                if (orderId) {
                  loadOrder(orderId);
                }
              }} 
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Réessayer</span>
            </Button>
            <Button onClick={() => navigate('/')} className="btn-primary">
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Commande non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CloseButton />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
            <Button
              onClick={handleManualRefresh}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Actualisation...' : 'Actualiser'}</span>
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Suivi de Commande</h1>
          <p className="text-muted-foreground">Commande #{selectedOrder.orderNumber}</p>
        </div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-gradient">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Commande #{selectedOrder.orderNumber}</CardTitle>
                  <p className="text-muted-foreground">
                    Commandée le {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  {getStatusBadge(selectedOrder.status)}
                  <p className="text-2xl font-bold text-primary mt-2">
                    {(selectedOrder.totalCents / 100).toLocaleString()} DA
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Informations client
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>Nom:</strong> {selectedOrder.userName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Téléphone:</strong> {selectedOrder.userPhone}
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Succursale
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {getBranchDetails(selectedOrder.branchId)?.name || 'Succursale inconnue'}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h4 className="font-semibold">Articles commandés</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => {
                    const dish = getProductDetails(item.dishId);
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{dish?.name || 'Produit inconnu'}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantité: {item.qty}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {((item.priceCents * item.qty) / 100).toLocaleString()} DA
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {(item.priceCents / 100).toLocaleString()} DA l'unité
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">
                    {(selectedOrder.totalCents / 100).toLocaleString()} DA
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};