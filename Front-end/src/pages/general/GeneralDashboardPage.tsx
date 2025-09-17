import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Building2, 
  DollarSign,
  Package,
  Clock,
  Star,
  Utensils
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MegaPizzaLogo } from '@/components/ui/MegaPizzaLogo';
import { LogoBackground } from '@/components/ui/LogoBackground';
// Removed mock data import - using real data from stores
import { useOrdersStore } from '@/store/ordersStore';
import { useUsersStore } from '@/store/usersStore';
import { useBranchesStore } from '@/store/branchesStore';
import { useDishesStore } from '@/store/dishesStore';

export const GeneralDashboardPage = () => {
  const { orders, load: loadOrders } = useOrdersStore();
  const { users, load: loadUsers } = useUsersStore();
  const { branches, load: loadBranches } = useBranchesStore();
  const { dishes, load: loadDishes } = useDishesStore();
  
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load all stores when component mounts
    loadOrders();
    loadUsers();
    loadBranches();
    loadDishes();
  }, []); // Empty dependency array - only run on mount

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
  }, [loadOrders]);

  // Calculate statistics using useMemo to prevent infinite loops
  const stats = useMemo(() => {
    // Calculate statistics from real data
    const totalUsers = Array.isArray(users) ? users.length : 0;
    const totalBranches = Array.isArray(branches) ? branches.length : 0;
    const totalProducts = Array.isArray(dishes) ? dishes.length : 0;
    const totalOrders = Array.isArray(orders) ? orders.length : 0;
    
    const totalRevenue = Array.isArray(orders) ? orders.reduce((sum, order) => sum + (order.totalCents / 100), 0) : 0;
    
    const today = new Date().toDateString();
    const ordersToday = Array.isArray(orders) ? orders.filter(order => 
      new Date(order.createdAt).toDateString() === today
    ).length : 0;
    
    const revenueToday = Array.isArray(orders) ? orders
      .filter(order => new Date(order.createdAt).toDateString() === today)
      .reduce((sum, order) => sum + (order.totalCents / 100), 0) : 0;

    return {
      totalUsers,
      totalBranches,
      totalProducts,
      totalOrders,
      totalRevenue,
      ordersToday,
      revenueToday
    };
  }, [orders, users, branches, dishes]);

  // Set loading to false once we have data
  useEffect(() => {
    if (Array.isArray(orders) && Array.isArray(users) && Array.isArray(branches) && Array.isArray(dishes)) {
      setIsLoading(false);
    }
  }, [orders, users, branches, dishes]);

  const statCards = [
    {
      title: "Utilisateurs Totaux",
      value: stats.totalUsers,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20"
    },
    {
      title: "Branches",
      value: stats.totalBranches,
      icon: Building2,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      borderColor: "border-secondary/20"
    },
    {
      title: "Produits",
      value: stats.totalProducts,
      icon: Package,
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/20"
    },
    {
      title: "Commandes",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      title: "Revenus Totaux",
      value: `${stats.totalRevenue.toLocaleString()} DA`,
      icon: DollarSign,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20"
    },
    {
      title: "Commandes Aujourd'hui",
      value: stats.ordersToday,
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    }
  ];

  const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];
  const topBranches = Array.isArray(branches) ? branches.slice(0, 3) : [];

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
              <h1 className="text-3xl font-bold text-foreground">Dashboard Général</h1>
              <p className="text-muted-foreground">
                Vue d'ensemble de votre réseau de restaurants Mega Pizza
              </p>
            </div>
          </div>
        </motion.div>

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
                {recentOrders.map((order) => (
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
                          order.status === 'DELIVERED' ? 'border-green-500 text-green-500' :
                          order.status === 'PREPARING' ? 'border-yellow-500 text-yellow-500' :
                          order.status === 'PENDING' ? 'border-orange-500 text-orange-500' :
                          'border-gray-500 text-gray-500'
                        }`}
                      >
                        {order.status === 'DELIVERED' ? 'Livrée' :
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

        {/* Top Branches */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-secondary" />
                <span>Branches Performantes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topBranches.map((branch, index) => (
                  <div
                    key={branch.id}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {/* Branch Image */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        {branch.image ? (
                          <img
                            src={branch.image}
                            alt={branch.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <Utensils className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{branch.name}</p>
                        <p className="text-sm text-muted-foreground">{branch.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-medium">4.8</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Excellent</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/20 rounded-lg text-center hover:bg-muted/30 transition-colors cursor-pointer">
                <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="font-medium">Gérer les Utilisateurs</p>
                <p className="text-sm text-muted-foreground">Ajouter, modifier, supprimer</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg text-center hover:bg-muted/30 transition-colors cursor-pointer">
                <Building2 className="h-8 w-8 mx-auto text-secondary mb-2" />
                <p className="font-medium">Gérer les Branches</p>
                <p className="text-sm text-muted-foreground">Configuration et paramètres</p>
              </div>
              <div className="p-4 bg-muted/20 rounded-lg text-center hover:bg-muted/30 transition-colors cursor-pointer">
                <Package className="h-8 w-8 mx-auto text-accent mb-2" />
                <p className="font-medium">Catalogue Produits</p>
                <p className="text-sm text-muted-foreground">Gestion du menu global</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </div>
  );
};
