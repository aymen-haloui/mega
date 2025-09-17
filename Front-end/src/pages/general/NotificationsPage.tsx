import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Search, 
  Filter,
  Check,
  CheckCheck,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Calendar,
  User,
  X,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotificationsStore, notificationHelpers } from '@/store/notificationsStore';
import { useAuthStore } from '@/store/authStore';
import { Notification } from '@/types';

export const NotificationsPage = () => {
  const { notifications, load, loading, error, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications, getUnreadCount } = useNotificationsStore();
  const { user } = useAuthStore();
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let filtered = notifications;

    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(notification => 
        statusFilter === 'read' ? notification.isRead : !notification.isRead
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, typeFilter, statusFilter]);

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 border-green-500/20 text-green-500';
      case 'error': return 'bg-red-500/10 border-red-500/20 text-red-500';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500';
      case 'info': return 'bg-blue-500/10 border-blue-500/20 text-blue-500';
      default: return 'bg-gray-500/10 border-gray-500/20 text-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Hier';
    return date.toLocaleDateString('fr-FR');
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      await deleteNotification(id);
    }
  };

  const handleClearAll = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      await clearAllNotifications();
    }
  };

  const createTestNotification = async () => {
    const types: Notification['type'][] = ['success', 'error', 'warning', 'info'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    await notificationHelpers.showInfo(
      'Notification de Test',
      'Ceci est une notification de test pour démontrer le système.',
      user?.id
    );
  };

  const getStats = () => {
    const total = notifications.length;
    const unread = getUnreadCount();
    const read = total - unread;
    const byType = notifications.reduce((acc, notif) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return { total, unread, read, byType };
  };

  const stats = getStats();

  return (
    <div className="ml-64 p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            Gestion des notifications système et utilisateur
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={createTestNotification}
            className="flex items-center space-x-2"
          >
            <Bell className="h-4 w-4" />
            <span>Test</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            className="flex items-center space-x-2"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Tout Marquer</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            <span>Vider</span>
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total', value: stats.total, icon: Bell, color: 'text-primary' },
          { title: 'Non Lues', value: stats.unread, icon: EyeOff, color: 'text-orange-500' },
          { title: 'Lues', value: stats.read, icon: CheckCircle, color: 'text-green-500' },
          { title: 'Erreurs', value: stats.byType.error || 0, icon: AlertCircle, color: 'text-purple-500' }
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
                  placeholder="Rechercher dans les notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Tous les types</option>
                <option value="success">Succès</option>
                <option value="error">Erreur</option>
                <option value="warning">Avertissement</option>
                <option value="info">Information</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="unread">Non lues</option>
                <option value="read">Lues</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Liste des Notifications ({filteredNotifications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Titre</th>
                    <th className="text-left py-3 px-4 font-medium">Message</th>
                    <th className="text-left py-3 px-4 font-medium">Statut</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotifications.map((notification, index) => (
                    <motion.tr
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                        notification.isRead ? 'opacity-75' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <Badge 
                          variant="outline" 
                          className={`flex items-center space-x-1 w-fit ${getTypeColor(notification.type)}`}
                        >
                          {getTypeIcon(notification.type)}
                          <span className="capitalize">{notification.type}</span>
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{notification.title}</p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {notification.message}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          variant="outline" 
                          className={notification.isRead 
                            ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                            : 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                          }
                        >
                          {notification.isRead ? 'Lue' : 'Non lue'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {formatTimestamp(notification.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="hover:bg-green-500/10 hover:text-green-500"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedNotification(notification)}
                            className="hover:bg-muted/20"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="hover:bg-red-500/10 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune notification trouvée</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedNotification(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="border-b border-border/20">
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <span>Détails de la Notification</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant="outline" 
                    className={`flex items-center space-x-1 ${getTypeColor(selectedNotification.type)}`}
                  >
                    {getTypeIcon(selectedNotification.type)}
                    <span className="capitalize">{selectedNotification.type}</span>
                  </Badge>
                  {!selectedNotification.isRead && (
                    <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-blue-500">
                      Non lue
                    </Badge>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Titre</label>
                  <p className="mt-1 font-semibold">{selectedNotification.title}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Message</label>
                  <p className="mt-1 text-foreground">{selectedNotification.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Utilisateur</label>
                    <p className="mt-1">{selectedNotification.userId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date</label>
                    <p className="mt-1">{new Date(selectedNotification.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-border/20">
                  {!selectedNotification.isRead && (
                    <Button
                      onClick={() => {
                        handleMarkAsRead(selectedNotification.id);
                        setSelectedNotification(null);
                      }}
                      className="flex items-center space-x-2"
                    >
                      <Check className="h-4 w-4" />
                      <span>Marquer comme lue</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedNotification(null)}
                    className="hover:bg-muted/20"
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

