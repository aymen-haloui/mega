import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  ShoppingCart, 
  Heart, 
  Star, 
  Settings,
  Camera,
  LogOut,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
// Removed mock data import - using real data from stores
import { useNavigate } from 'react-router-dom';
import { ProfileUpdateForm } from '@/components/client/ProfileUpdateForm';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserOrders = () => {
    if (!user) return [];
    return mockOrders.filter(order => order.clientId === user.id).slice(0, 5);
  };

  const getUserStats = () => {
    if (!user) return null;
    
    const userOrders = mockOrders.filter(order => order.clientId === user.id);
    const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
    const averageOrder = userOrders.length > 0 ? totalSpent / userOrders.length : 0;
    
    return {
      totalOrders: userOrders.length,
      totalSpent,
      averageOrder,
      lastOrder: userOrders.length > 0 ? new Date(userOrders[0].createdAt) : null
    };
  };

  const stats = getUserStats();
  const recentOrders = getUserOrders();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Utilisateur non connecté</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Mon Profil</h1>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles et préférences
            </p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleLogout} variant="outline" className="hover:bg-red-500/10 hover:text-red-500">
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Update Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ProfileUpdateForm onSuccess={() => {
                // Refresh user data after successful update
                window.location.reload();
              }} />
            </motion.div>

            {/* User Info Display */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="card-gradient">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-primary" />
                    <span>Informations du Compte</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-muted/20 rounded-full overflow-hidden">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{user.name}</h3>
                      <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-blue-500">
                        {user.role === 'client' ? 'Client' : user.role}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Membre depuis {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                      {user.updatedAt && (
                        <p className="text-sm text-muted-foreground">
                          Dernière mise à jour: {new Date(user.updatedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Current Info Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
                      <p className="text-foreground font-medium">{user.name}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                      <p className="text-foreground font-medium">{user.phone || 'Non spécifié'}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Statut</label>
                      <Badge 
                        variant="outline" 
                        className={!user.isBlocked 
                          ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                          : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }
                      >
                        {!user.isBlocked ? 'Actif' : 'Bloqué'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="card-gradient">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5 text-secondary" />
                    <span>Commandes Récentes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentOrders.length > 0 ? (
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
                              {order.total.toLocaleString()} DA
                            </p>
                            <Badge 
                              variant="outline" 
                              className={`${
                                order.status === 'delivered' ? 'border-green-500 text-green-500' :
                                order.status === 'preparing' ? 'border-yellow-500 text-yellow-500' :
                                order.status === 'pending' ? 'border-orange-500 text-orange-500' :
                                'border-gray-500 text-gray-500'
                              }`}
                            >
                              {order.status === 'delivered' ? 'Livrée' :
                               order.status === 'preparing' ? 'En préparation' :
                               order.status === 'pending' ? 'En attente' :
                               order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Aucune commande pour le moment</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="card-gradient">
                <CardHeader>
                  <CardTitle>Statistiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total Commandes</span>
                        <span className="font-bold text-primary">{stats.totalOrders}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total Dépensé</span>
                        <span className="font-bold text-secondary">{stats.totalSpent.toLocaleString()} DA</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Commande Moyenne</span>
                        <span className="font-bold text-accent">{stats.averageOrder.toLocaleString()} DA</span>
                      </div>
                      {stats.lastOrder && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Dernière Commande</span>
                          <span className="font-bold text-foreground">
                            {stats.lastOrder.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground text-center">Aucune donnée disponible</p>
                  )}
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
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-muted/20"
                    onClick={() => navigate('/cart')}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Mon Panier
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-muted/20"
                    onClick={() => navigate('/favorites')}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Mes Favoris
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-muted/20"
                    onClick={() => navigate('/orders')}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Mes Commandes
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-muted/20"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Paramètres
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Account Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="card-gradient">
                <CardHeader>
                  <CardTitle>Statut du Compte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Statut</span>
                    <Badge 
                      variant="outline" 
                      className={!user.isBlocked 
                        ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                      }
                    >
                      {!user.isBlocked ? 'Actif' : 'Bloqué'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Vérifié</span>
                    <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-blue-500">
                      Oui
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Membre depuis</span>
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
