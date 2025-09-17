import { useState, useEffect } from 'react';
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
  Building2,
  DollarSign,
  TrendingUp,
  Mail,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOrdersStore } from '@/store/ordersStore';
import { useBranchesStore } from '@/store/branchesStore';
import { useUsersStore } from '@/store/usersStore';
import { Order as OrderType } from '@/types';

export const GeneralOrdersPage = () => {
  const { orders, load } = useOrdersStore();
  const { branches } = useBranchesStore();
  const { users } = useUsersStore();
  const [filteredOrders, setFilteredOrders] = useState<OrderType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);

  useEffect(() => {
    // Load orders from store
    load();
  }, [load]);

  // Refresh orders when page becomes visible (for real-time updates)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        load(); // Refresh orders when page becomes visible
      }
    };

    const handleFocus = () => {
      load(); // Refresh orders when window gains focus
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Also refresh orders every 30 seconds for real-time updates
    const interval = setInterval(() => {
      load();
    }, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [load]);

  useEffect(() => {
    // Filter orders based on search and filters
    let filtered = Array.isArray(orders) ? orders : [];

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (branchFilter !== 'all') {
      filtered = filtered.filter(order => order.branchId === branchFilter);
    }


    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, branchFilter]);

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


  const getClientInfo = (order: OrderType) => {
    return {
      name: order.userName || 'Client inconnu',
      phone: order.userPhone || 'N/A'
    };
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : 'Branche inconnue';
  };


  const stats = {
    total: Array.isArray(orders) ? orders.length : 0,
    pending: Array.isArray(orders) ? orders.filter(o => o.status === 'PENDING').length : 0,
    accepted: Array.isArray(orders) ? orders.filter(o => o.status === 'ACCEPTED').length : 0,
    preparing: Array.isArray(orders) ? orders.filter(o => o.status === 'PREPARING').length : 0,
    ready: Array.isArray(orders) ? orders.filter(o => o.status === 'READY').length : 0,
    outForDelivery: Array.isArray(orders) ? orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length : 0,
    completed: Array.isArray(orders) ? orders.filter(o => o.status === 'COMPLETED').length : 0,
    cancelled: Array.isArray(orders) ? orders.filter(o => o.status === 'CANCELED').length : 0,
    totalRevenue: Array.isArray(orders) ? orders.reduce((sum, order) => sum + (order.totalCents / 100), 0) : 0,
    averageOrderValue: Array.isArray(orders) && orders.length > 0 ? orders.reduce((sum, order) => sum + (order.totalCents / 100), 0) / orders.length : 0
  };

  // branches are already loaded from useBranchesStore

  return (
    <div className="ml-64 p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-foreground">Gestion Globale des Commandes</h1>
        <p className="text-muted-foreground">
          Suivez et gérez toutes les commandes de toutes les branches
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
          { title: 'Revenus Totaux', value: `${stats.totalRevenue.toLocaleString()} DA`, icon: DollarSign, color: 'text-yellow-500' },
          { title: 'Valeur Moyenne', value: `${stats.averageOrderValue.toLocaleString()} DA`, icon: TrendingUp, color: 'text-accent' }
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2 relative">
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

              {/* Branch Filter */}
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Toutes les branches</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
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
                            <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-blue-500">
                              {getBranchName(order.branchId)}
                            </Badge>
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

                        {/* Client Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{client.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{client.phone}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Créé: {new Date(order.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {order.items?.length || 0} article(s)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Products */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Produits commandés:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm bg-muted/20 p-2 rounded">
                                <span>Plat {item.dishId}</span>
                                <span className="text-muted-foreground">
                                  x{item.qty} - {(item.priceCents / 100).toLocaleString()} DA
                                </span>
                              </div>
                            )) || []}
                          </div>
                        </div>

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
                        
                        <div className="text-center text-sm text-muted-foreground">
                          Seuls les administrateurs de branche peuvent modifier le statut
                        </div>
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
                    <h4 className="font-semibold">Informations Client</h4>
                    <div className="p-4 bg-muted/10 rounded-lg space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getClientInfo(selectedOrder).name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getClientInfo(selectedOrder).phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Informations de Commande</h4>
                    <div className="p-4 bg-muted/10 rounded-lg space-y-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Créé: {new Date(selectedOrder.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedOrder.items?.length || 0} article(s)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getBranchName(selectedOrder.branchId)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products List */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Produits Commandés</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item) => {
                      const branch = branches.find(b => b.id === selectedOrder.branchId);
                      
                      return (
                        <div key={item.dishId} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">Plat {item.dishId}</p>
                              <p className="text-sm text-muted-foreground">{branch?.name}</p>
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
                    }) || []}
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
                    onClick={() => {
                      // Update status
                    }}
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
    </div>
  );
};
