import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  User,
  MapPin,
  Phone,
  Eye,
  Edit,
  Truck,
  Mail,
  FileText,
  Calendar,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useUsersStore } from '@/store/usersStore';
import { useDishesStore } from '@/store/dishesStore';
import { Order as OrderType } from '@/types';

export const BranchOrdersPage = () => {
  const { user } = useAuthStore();
  const { orders, updateOrderStatus, updateOrderStatusLocal, load } = useOrdersStore();
  const { users, load: loadUsers } = useUsersStore();
  const { dishes } = useDishesStore();
  const [filteredOrders, setFilteredOrders] = useState<OrderType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState<OrderType | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  // Filter orders for this specific branch
  const branchOrders = useMemo(() => {
    return orders.filter(order => order.branchId === user?.branchId);
  }, [orders, user?.branchId]);

  useEffect(() => {
    // Load orders and users on component mount
    load();
    loadUsers();
  }, []); // Empty dependency array - only run on mount

  // Refresh orders when page becomes visible (for real-time updates)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Only refresh if we haven't refreshed recently
        const lastRefresh = localStorage.getItem('lastOrdersRefresh');
        const now = Date.now();
        if (!lastRefresh || now - parseInt(lastRefresh) > 5000) { // 5 seconds cooldown
          load();
          localStorage.setItem('lastOrdersRefresh', now.toString());
        }
      }
    };

    const handleFocus = () => {
      // Only refresh if we haven't refreshed recently
      const lastRefresh = localStorage.getItem('lastOrdersRefresh');
      const now = Date.now();
      if (!lastRefresh || now - parseInt(lastRefresh) > 5000) { // 5 seconds cooldown
        load();
        localStorage.setItem('lastOrdersRefresh', now.toString());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Also refresh orders every 30 seconds for real-time updates
    const interval = setInterval(() => {
      load();
      localStorage.setItem('lastOrdersRefresh', Date.now().toString());
    }, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []); // Remove load dependency to prevent frequent re-runs


  useEffect(() => {
    // Filter orders based on search and filters
    let filtered = branchOrders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userPhone?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [branchOrders, searchTerm, statusFilter]);

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
        label: 'Prêt',
        color: 'bg-green-500/10 border-green-500/20 text-green-500',
        icon: CheckCircle
      },
      OUT_FOR_DELIVERY: {
        label: 'En Livraison',
        color: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
        icon: Truck
      },
      COMPLETED: {
        label: 'Livré',
        color: 'bg-green-500/10 border-green-500/20 text-green-500',
        icon: CheckCircle
      },
      CANCELED: {
        label: 'Annulé',
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

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const paymentConfig = {
      pending: {
        label: 'En Attente',
        color: 'bg-orange-500/10 border-orange-500/20 text-orange-500'
      },
      paid: {
        label: 'Payé',
        color: 'bg-green-500/10 border-green-500/20 text-green-500'
      },
      failed: {
        label: 'Échoué',
        color: 'bg-red-500/10 border-red-500/20 text-red-500'
      }
    };

    const config = paymentConfig[paymentStatus as keyof typeof paymentConfig] || paymentConfig.pending;

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getClientInfo = (order: OrderType) => {
    return {
      name: order.userName || 'Client inconnu',
      phone: order.userPhone || 'N/A',
      role: 'client',
      isActive: true,
      createdAt: order.createdAt,
      id: order.id
    };
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      // Update locally first for immediate UI feedback
      updateOrderStatusLocal(orderId, newStatus as OrderType['status']);
      
      // Then update via API for backend sync
      await updateOrderStatus(orderId, newStatus as OrderType['status']);
    } catch (error) {
      console.error('Failed to update order status:', error);
      // Optionally revert the local change on error
    }
  };

  const openStatusModal = (order: OrderType) => {
    setOrderToUpdate(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const handleStatusChange = async () => {
    if (orderToUpdate && newStatus) {
      try {
        console.log('BranchOrdersPage - Changing status for order', orderToUpdate.id, 'to', newStatus);
        await updateOrderStatus(orderToUpdate.id, newStatus as OrderType['status']);
        console.log('BranchOrdersPage - Status change completed successfully');
        setShowStatusModal(false);
        setOrderToUpdate(null);
        setNewStatus('');
      } catch (error) {
        console.error('BranchOrdersPage - Failed to update order status:', error);
        // Keep modal open on error so user can retry
      }
    }
  };

  const stats = {
    total: branchOrders.length,
    pending: branchOrders.filter(o => o.status === 'PENDING').length,
    accepted: branchOrders.filter(o => o.status === 'ACCEPTED').length,
    preparing: branchOrders.filter(o => o.status === 'PREPARING').length,
    ready: branchOrders.filter(o => o.status === 'READY').length,
    outForDelivery: branchOrders.filter(o => o.status === 'OUT_FOR_DELIVERY').length,
    completed: branchOrders.filter(o => o.status === 'COMPLETED').length,
    cancelled: branchOrders.filter(o => o.status === 'CANCELED').length,
    totalRevenue: branchOrders.reduce((sum, order) => sum + (order.totalCents / 100), 0)
  };

  return (
    <div className="ml-64 p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-foreground">Gestion des Commandes</h1>
        <p className="text-muted-foreground">
          Suivez et gérez toutes les commandes de votre restaurant
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Commandes', value: stats.total, icon: ShoppingCart, color: 'text-primary' },
          { title: 'En Attente', value: stats.pending, icon: Clock, color: 'text-orange-500' },
          { title: 'Acceptées', value: stats.accepted, icon: CheckCircle, color: 'text-blue-500' },
          { title: 'En Préparation', value: stats.preparing, icon: Package, color: 'text-yellow-500' },
          { title: 'Prêt', value: stats.ready, icon: CheckCircle, color: 'text-green-500' },
          { title: 'En Livraison', value: stats.outForDelivery, icon: Truck, color: 'text-purple-500' },
          { title: 'Livré', value: stats.completed, icon: CheckCircle, color: 'text-green-500' },
          { title: 'Annulé', value: stats.cancelled, icon: XCircle, color: 'text-red-500' },
          { title: 'Revenus Totaux', value: `${stats.totalRevenue.toLocaleString()} DA`, icon: ShoppingCart, color: 'text-yellow-500' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="card-gradient hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-muted/20">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher par ID commande ou nom client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="PENDING">En Attente</option>
                <option value="ACCEPTED">Acceptée</option>
                <option value="PREPARING">En Préparation</option>
                <option value="READY">Prêt</option>
                <option value="OUT_FOR_DELIVERY">En Livraison</option>
                <option value="COMPLETED">Livré</option>
                <option value="CANCELED">Annulé</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Commandes ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOrders.map((order, index) => {
                const client = getClientInfo(order);
                
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Order Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-lg">Commande #{order.orderNumber}</h3>
                            {getStatusBadge(order.status)}
                            {getPaymentStatusBadge(order.paymentStatus)}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              {(order.totalCents / 100).toLocaleString()} DA
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Client Summary */}
                        <div className="flex items-center space-x-3 p-3 bg-muted/10 rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={client.avatar} alt={client.name} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{client.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {client.role}
                              </Badge>
                              {client.isActive ? (
                                <UserCheck className="h-3 w-3 text-green-500" />
                              ) : (
                                <UserX className="h-3 w-3 text-red-500" />
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Client depuis {new Date(client.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Client Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Client Profile */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm text-muted-foreground">Profil Client</h4>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={client.avatar} alt={client.name} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{client.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Shield className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground capitalize">{client.role}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {client.isActive ? (
                                    <UserCheck className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <UserX className="h-3 w-3 text-red-500" />
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {client.isActive ? 'Actif' : 'Inactif'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Contact Info */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm text-muted-foreground">Contact</h4>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{order.userPhone || client.phone || 'N/A'}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Membre depuis: {new Date(client.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Delivery Info */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm text-muted-foreground">Livraison</h4>
                            <div className="space-y-2">
                              <div className="flex items-start space-x-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                  <span className="text-sm text-muted-foreground block">
                                    {order.deliveryAddress || 'Adresse non spécifiée'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {order.deliveryTime || 'Temps non spécifié'}
                                </span>
                              </div>
                              {order.notes && (
                                <div className="flex items-start space-x-2">
                                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <div className="flex-1">
                                    <span className="text-xs text-muted-foreground block">
                                      <strong>Notes:</strong> {order.notes}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Products */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Produits commandés:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                      </div>

                      {/* Actions */}
                      <div className="ml-4 space-y-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="w-full hover:bg-muted/20"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </Button>
                        
                        {order.status === 'PENDING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'ACCEPTED')}
                            className="w-full hover:bg-blue-500/10 hover:text-blue-500"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accepter
                          </Button>
                        )}
                        
                        {order.status === 'ACCEPTED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                            className="w-full hover:bg-yellow-500/10 hover:text-yellow-500"
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Préparer
                          </Button>
                        )}
                        
                        {order.status === 'PREPARING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'READY')}
                            className="w-full hover:bg-green-500/10 hover:text-green-500"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Prêt
                          </Button>
                        )}
                        
                        {order.status === 'READY' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'OUT_FOR_DELIVERY')}
                            className="w-full hover:bg-purple-500/10 hover:text-purple-500"
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            En Livraison
                          </Button>
                        )}
                        
                        {order.status === 'OUT_FOR_DELIVERY' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                            className="w-full hover:bg-green-500/10 hover:text-green-500"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Livré
                          </Button>
                        )}
                        
                        {(order.status === 'PENDING' || order.status === 'ACCEPTED' || order.status === 'PREPARING' || order.status === 'READY') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'CANCELED')}
                            className="w-full hover:bg-red-500/10 hover:text-red-500"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Annuler
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openStatusModal(order)}
                          className="w-full hover:bg-blue-500/10 hover:text-blue-500"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Changer Statut
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune commande trouvée</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="border-b border-border/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    <span>Détails de la Commande #{selectedOrder.orderNumber}</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                    className="hover:bg-muted/20"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Informations Client Complètes</h4>
                    <div className="p-4 bg-muted/10 rounded-lg space-y-4">
                      {/* Client Profile */}
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={getClientInfo(selectedOrder).avatar} alt={getClientInfo(selectedOrder).name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-lg">
                            {getClientInfo(selectedOrder).name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{getClientInfo(selectedOrder).name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Shield className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground capitalize">{getClientInfo(selectedOrder).role}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getClientInfo(selectedOrder).isActive ? (
                              <UserCheck className="h-3 w-3 text-green-500" />
                            ) : (
                              <UserX className="h-3 w-3 text-red-500" />
                            )}
                            <span className="text-sm text-muted-foreground">
                              {getClientInfo(selectedOrder).isActive ? 'Compte Actif' : 'Compte Inactif'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Contact Details */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedOrder.userPhone || getClientInfo(selectedOrder).phone || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Client depuis: {new Date(getClientInfo(selectedOrder).createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            ID Commande: {getClientInfo(selectedOrder).id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Informations de Livraison Complètes</h4>
                    <div className="p-4 bg-muted/10 rounded-lg space-y-3">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm font-medium block">Adresse de livraison:</span>
                          <span className="text-sm text-muted-foreground">
                            {selectedOrder.deliveryAddress || 'Adresse non spécifiée'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm font-medium block">Temps de livraison:</span>
                          <span className="text-sm text-muted-foreground">
                            {selectedOrder.deliveryTime || 'Temps non spécifié'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm font-medium block">Commande passée le:</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm font-medium block">Méthode de paiement:</span>
                          <span className="text-sm text-muted-foreground capitalize">
                            {selectedOrder.paymentMethod === 'card' ? 'Carte bancaire' : 
                             selectedOrder.paymentMethod === 'cash' ? 'Espèces' : 
                             selectedOrder.paymentMethod === 'online' ? 'En ligne' : selectedOrder.paymentMethod}
                          </span>
                        </div>
                      </div>
                      {selectedOrder.notes && (
                        <div className="flex items-start space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <span className="text-sm font-medium block">Notes spéciales:</span>
                            <span className="text-sm text-muted-foreground">{selectedOrder.notes}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Products List */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Produits Commandés</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => {
                      const dish = dishes.find(d => d.id === item.dishId);
                      
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{dish?.name || item.dish.name}</p>
                              <p className="text-sm text-muted-foreground">Catégorie: {dish?.categoryId || item.dish.categoryId || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{item.qty}x</p>
                            <p className="text-sm text-muted-foreground">
                              {(item.priceCents / 100).toLocaleString()} DA
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-border/20 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      {(selectedOrder.totalCents / 100).toLocaleString()} DA
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/20">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Contact client
                    }}
                    className="hover:bg-muted/20"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contacter le Client
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openStatusModal(selectedOrder)}
                    className="hover:bg-muted/20"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier le Statut
                  </Button>
                  <Button
                    onClick={() => setSelectedOrder(null)}
                    className="btn-primary"
                  >
                    Fermer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Status Update Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le Statut de la Commande</DialogTitle>
            <DialogDescription>
              Changer le statut de la commande #{orderToUpdate?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut actuel</label>
              <div className="p-2 bg-muted/20 rounded-lg">
                {orderToUpdate && getStatusBadge(orderToUpdate.status)}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Nouveau statut</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>En Attente</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ACCEPTED">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Acceptée</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PREPARING">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4" />
                      <span>En Préparation</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="READY">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Prêt</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="OUT_FOR_DELIVERY">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4" />
                      <span>En Livraison</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="COMPLETED">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Livré</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="CANCELED">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4" />
                      <span>Annulé</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleStatusChange} 
              className="btn-primary"
              disabled={!newStatus || newStatus === orderToUpdate?.status}
            >
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};