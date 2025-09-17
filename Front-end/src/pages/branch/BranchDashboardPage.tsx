import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  DollarSign,
  Clock,
  Star,
  Users,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MegaPizzaLogo } from '@/components/ui/MegaPizzaLogo';
import { LogoBackground } from '@/components/ui/LogoBackground';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useDishesStore } from '@/store/dishesStore';
import { useBranchesStore } from '@/store/branchesStore';

export const BranchDashboardPage = () => {
  const { user } = useAuthStore();
  const { orders, load: loadOrders } = useOrdersStore();
  const { dishes, load: loadDishes } = useDishesStore();
  const { branches, load: loadBranches } = useBranchesStore();
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load all stores when component mounts
    loadOrders();
    loadDishes();
    loadBranches();
  }, [loadOrders, loadDishes, loadBranches]); // Include all load functions

  // Refresh orders when page becomes visible (for real-time updates)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadOrders(); // Refresh orders when page becomes visible
      }
    };

    const handleFocus = () => {
      loadOrders(); // Refresh orders when window gains focus
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Also refresh orders every 30 seconds for real-time updates
    const interval = setInterval(() => {
      loadOrders();
    }, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [loadOrders, loadDishes, loadBranches]);

  // Calculate branch statistics using useMemo to prevent infinite loops
  const branchStats = useMemo(() => {
    if (!user?.branchId) {
      return {
        totalOrders: 0,
        totalProducts: 0,
        totalRevenue: 0,
        ordersToday: 0,
        revenueToday: 0,
        averageRating: 0,
        pendingOrders: 0,
        preparingOrders: 0
      };
    }
    
    // Filter data for this specific branch
    const branchOrders = Array.isArray(orders) ? orders.filter(order => order.branchId === user.branchId) : [];
    const branchDishes = Array.isArray(dishes) ? dishes.filter(dish => dish.menu.branchId === user.branchId) : [];
    
    const totalOrders = branchOrders.length;
    const totalProducts = branchDishes.length;
    const totalRevenue = branchOrders.reduce((sum, order) => sum + (order.totalCents / 100), 0);
    
    const today = new Date().toDateString();
    const ordersToday = branchOrders.filter(order => 
      new Date(order.createdAt).toDateString() === today
    ).length;
    
    const revenueToday = branchOrders
      .filter(order => new Date(order.createdAt).toDateString() === today)
      .reduce((sum, order) => sum + (order.totalCents / 100), 0);
    
    const pendingOrders = branchOrders.filter(order => order.status === 'PENDING').length;
    const preparingOrders = branchOrders.filter(order => order.status === 'PREPARING').length;
    
    // Calculate average rating (mock data)
    const averageRating = 4.6;
    
    return {
      totalOrders,
      totalProducts,
      totalRevenue,
      ordersToday,
      revenueToday,
      averageRating,
      pendingOrders,
      preparingOrders
    };
  }, [user?.branchId, orders, dishes]);

  // Set loading to false once we have data
  useEffect(() => {
    if (user && orders && dishes) {
      setIsLoading(false);
    }
  }, [user, orders, dishes]);

  const statCards = [
    {
      title: "Commandes Totales",
      value: branchStats.totalOrders,
      icon: ShoppingCart,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20"
    },
    {
      title: "Produits",
      value: branchStats.totalProducts,
      icon: Package,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      borderColor: "border-secondary/20"
    },
    {
      title: "Revenus Totaux",
      value: `${branchStats.totalRevenue.toLocaleString()} DA`,
      icon: DollarSign,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20"
    },
    {
      title: "Commandes Aujourd'hui",
      value: branchStats.ordersToday,
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      title: "Note Moyenne",
      value: `${branchStats.averageRating}★`,
      icon: Star,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      title: "En Attente",
      value: branchStats.pendingOrders,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20"
    }
  ];

  const branchOrders = Array.isArray(orders) ? orders.filter(order => order.branchId === user?.branchId).slice(0, 5) : [];
  const branch = Array.isArray(branches) ? branches.find(b => b.id === user?.branchId) : null;

  // Show loading state while data is being loaded
  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <LogoBackground intensity="low" speed="slow" />
        <div className="relative z-10 ml-64 p-8 space-y-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des données...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <LogoBackground intensity="low" speed="slow" />
      <div className="relative z-10 ml-64 p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center space-x-4">
            <MegaPizzaLogo size="lg" animate={true} />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard Branche</h1>
              <p className="text-muted-foreground">
                {branch ? `Gestion de ${branch.name}` : 'Gestion de votre restaurant'}
              </p>
            </div>
          </div>
        </motion.div>

      {/* Branch Info Card */}
      {branch && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="card-gradient border-l-4 border-l-secondary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">{branch.name}</h2>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{branch.address}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>9:00 - 22:00</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-green-500/10 border-green-500/20 text-green-500">
                    Ouvert
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="card-gradient hover-scale border-l-4 border-l-primary">
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
                  <div className={`p-3 rounded-full ${stat.bgColor} ${stat.borderColor} border`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts and Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <span>Commandes Récentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {branchOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">Commande #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {(order.totalCents / 100).toLocaleString()} DA
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`${
                          order.status === 'COMPLETED' ? 'border-green-500 text-green-500' :
                          order.status === 'PREPARING' ? 'border-yellow-500 text-yellow-500' :
                          order.status === 'PENDING' ? 'border-orange-500 text-orange-500' :
                          'border-gray-500 text-gray-500'
                        }`}
                      >
                        {order.status === 'COMPLETED' ? 'Livrée' :
                         order.status === 'PREPARING' ? 'En préparation' :
                         order.status === 'PENDING' ? 'En attente' :
                         order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <ShoppingCart className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-medium">Gérer les Commandes</p>
                      <p className="text-sm text-muted-foreground">Suivre et mettre à jour le statut</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Package className="h-6 w-6 text-secondary" />
                    <div>
                      <p className="font-medium">Gérer les Produits</p>
                      <p className="text-sm text-muted-foreground">Ajouter, modifier, supprimer</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Users className="h-6 w-6 text-accent" />
                    <div>
                      <p className="font-medium">Paramètres</p>
                      <p className="text-sm text-muted-foreground">Configuration du restaurant</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Métriques de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">
                  {branchStats.ordersToday}
                </div>
                <div className="text-sm text-muted-foreground">Commandes Aujourd'hui</div>
              </div>
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-secondary mb-2">
                  {branchStats.revenueToday.toLocaleString()} DA
                </div>
                <div className="text-sm text-muted-foreground">Revenus Aujourd'hui</div>
              </div>
              <div className="text-center p-4 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-accent mb-2">
                  {branchStats.averageRating}★
                </div>
                <div className="text-sm text-muted-foreground">Note Moyenne</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </div>
  );
};
