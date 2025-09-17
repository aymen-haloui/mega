import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Search, 
  Filter,
  User,
  Calendar,
  Activity,
  Eye,
  Download,
  RefreshCw,
  Clock,
  Shield,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuditStore, auditHelpers } from '@/store/auditStore';
import { useAuthStore } from '@/store/authStore';
import { AuditLog } from '@/types';

export const AuditLogPage = () => {
  const { logs, load, loading, error } = useAuditStore();
  const { user } = useAuthStore();
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.userId && log.userId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    if (entityFilter !== 'all') {
      filtered = filtered.filter(log => log.entity === entityFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(log => new Date(log.createdAt) >= filterDate);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, actionFilter, entityFilter, dateFilter]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <Plus className="h-4 w-4" />;
      case 'UPDATE': return <Edit className="h-4 w-4" />;
      case 'DELETE': return <Trash2 className="h-4 w-4" />;
      case 'LOGIN': return <Shield className="h-4 w-4" />;
      case 'LOGOUT': return <XCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-500/10 border-green-500/20 text-green-500';
      case 'UPDATE': return 'bg-blue-500/10 border-blue-500/20 text-blue-500';
      case 'DELETE': return 'bg-red-500/10 border-red-500/20 text-red-500';
      case 'LOGIN': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
      case 'LOGOUT': return 'bg-orange-500/10 border-orange-500/20 text-orange-500';
      default: return 'bg-gray-500/10 border-gray-500/20 text-gray-500';
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'User': return <User className="h-4 w-4" />;
      case 'Order': return <FileText className="h-4 w-4" />;
      case 'Dish': return <Activity className="h-4 w-4" />;
      case 'Branch': return <Building2 className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleString('fr-FR')
    };
  };

  const exportLogs = () => {
    const csvContent = [
      ['Action', 'Entity', 'Entity ID', 'User ID', 'Timestamp', 'IP Address', 'User Agent'],
      ...filteredLogs.map(log => [
        log.action,
        log.entity,
        log.entityId,
        log.userId || '',
        log.createdAt,
        log.ipAddress || '',
        log.userAgent || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAllLogs = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer tous les logs d\'audit ?')) {
      useAuditStore.getState().clearLogs();
    }
  };

  return (
    <div className="ml-64 p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Journal d'Audit</h1>
          <p className="text-muted-foreground">
            Suivi de toutes les activités et modifications du système
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={exportLogs}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </Button>
          <Button
            variant="outline"
            onClick={clearAllLogs}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            <span>Vider</span>
          </Button>
          <Button
            onClick={() => load()}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Logs', value: logs.length, icon: History, color: 'text-primary' },
          { title: 'Créations', value: logs.filter(log => log.action === 'CREATE').length, icon: CheckCircle, color: 'text-green-500' },
          { title: 'Modifications', value: logs.filter(log => log.action === 'UPDATE').length, icon: Edit, color: 'text-blue-500' },
          { title: 'Suppressions', value: logs.filter(log => log.action === 'DELETE').length, icon: Trash2, color: 'text-red-500' }
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
                  placeholder="Rechercher dans les logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Action Filter */}
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Toutes les actions</option>
                <option value="CREATE">Création</option>
                <option value="UPDATE">Modification</option>
                <option value="DELETE">Suppression</option>
                <option value="LOGIN">Connexion</option>
                <option value="LOGOUT">Déconnexion</option>
              </select>

              {/* Entity Filter */}
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="px-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Toutes les entités</option>
                <option value="User">Utilisateur</option>
                <option value="Order">Commande</option>
                <option value="Dish">Plat</option>
                <option value="Branch">Branche</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Toutes les périodes</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Journal d'Activité ({filteredLogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Action</th>
                    <th className="text-left py-3 px-4 font-medium">Entité</th>
                    <th className="text-left py-3 px-4 font-medium">ID</th>
                    <th className="text-left py-3 px-4 font-medium">Utilisateur</th>
                    <th className="text-left py-3 px-4 font-medium">Date/Heure</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => {
                    const timestamp = formatTimestamp(log.createdAt);
                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <Badge 
                            variant="outline" 
                            className={`flex items-center space-x-1 w-fit ${getActionColor(log.action)}`}
                          >
                            {getActionIcon(log.action)}
                            <span>{log.action}</span>
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {getEntityIcon(log.entity)}
                            <span className="text-sm">{log.entity}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {log.entityId}
                          </code>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-muted-foreground">
                            {log.userId || 'Système'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <div className="text-sm">
                              <div>{timestamp.date}</div>
                              <div className="text-muted-foreground">{timestamp.time}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            className="hover:bg-muted/20"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <History className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun log d'audit trouvé</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedLog(null)}
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
                  <History className="h-5 w-5 text-primary" />
                  <span>Détails du Log</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Action</label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getActionIcon(selectedLog.action)}
                      <span>{selectedLog.action}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Entité</label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getEntityIcon(selectedLog.entity)}
                      <span>{selectedLog.entity}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID de l'Entité</label>
                  <code className="block mt-1 text-xs bg-muted px-2 py-1 rounded">
                    {selectedLog.entityId}
                  </code>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Utilisateur</label>
                  <p className="mt-1">{selectedLog.userId || 'Système'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date/Heure</label>
                  <p className="mt-1">{formatTimestamp(selectedLog.createdAt).full}</p>
                </div>

                {selectedLog.ipAddress && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Adresse IP</label>
                    <p className="mt-1 font-mono text-sm">{selectedLog.ipAddress}</p>
                  </div>
                )}

                {selectedLog.oldValues && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Anciennes Valeurs</label>
                    <pre className="mt-1 text-xs bg-muted p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedLog.oldValues, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.newValues && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nouvelles Valeurs</label>
                    <pre className="mt-1 text-xs bg-muted p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedLog.newValues, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-border/20">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedLog(null)}
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

