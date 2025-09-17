import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Building2,
  User,
  Shield,
  AlertTriangle,
  Clock,
  FileText,
  TrendingDown,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUsersStore } from '@/store/usersStore';
import { useBranchesStore } from '@/store/branchesStore';
import { User as UserType } from '@/types';

export const GeneralUsersPage = () => {
  const { users, addUser, updateUser, deleteUser } = useUsersStore();
  const { branches } = useBranchesStore();
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  useEffect(() => {
    // Filter users based on search and filters
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? !user.isBlocked : user.isBlocked
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'generalAdmin':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'branchAdmin':
        return <Building2 className="h-4 w-4 text-yellow-500" />;
      case 'client':
        return <User className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Admin Général';
      case 'BRANCH_USER':
        return 'Utilisateur Branche';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500/10 border-red-500/20 text-red-500';
      case 'BRANCH_USER':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-500';
      default:
        return 'bg-gray-500/10 border-gray-500/20 text-gray-500';
    }
  };

  const getBranchName = (branchId?: string) => {
    if (!branchId) return 'N/A';
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : 'Branche inconnue';
  };

  const handleAddUser = () => {
    setShowAddUserModal(true);
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteUser(userId);
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    branchUsers: users.filter(u => u.role === 'BRANCH_USER').length,
    active: users.filter(u => !u.isBlocked).length,
    blocked: users.filter(u => u.isBlocked).length
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
          <h1 className="text-3xl font-bold text-foreground">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérez tous les utilisateurs de la plateforme
          </p>
        </div>
        <Button onClick={handleAddUser} className="btn-primary">
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter Utilisateur
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Total Utilisateurs', value: stats.total, icon: Users, color: 'text-primary' },
          { title: 'Admins Généraux', value: stats.admins, icon: Shield, color: 'text-red-500' },
          { title: 'Utilisateurs Branches', value: stats.branchUsers, icon: Building2, color: 'text-blue-500' },
          { title: 'Actifs', value: stats.active, icon: Users, color: 'text-green-500' },
          { title: 'Bloqués', value: stats.blocked, icon: Users, color: 'text-gray-500' }
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
                  placeholder="Rechercher par nom ou téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Tous les rôles</option>
                <option value="generalAdmin">Admin Général</option>
                <option value="branchAdmin">Admin Branche</option>
                <option value="client">Client</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Liste des Utilisateurs ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Utilisateur</th>
                    <th className="text-left py-3 px-4 font-medium">Rôle</th>
                    <th className="text-left py-3 px-4 font-medium">Branche</th>
                    <th className="text-left py-3 px-4 font-medium">Statut</th>
                    <th className="text-left py-3 px-4 font-medium">Performance</th>
                    <th className="text-left py-3 px-4 font-medium">Notes</th>
                    <th className="text-left py-3 px-4 font-medium">Date Création</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role)}
                          <Badge 
                            variant="outline" 
                            className={getRoleBadgeColor(user.role)}
                          >
                            {getRoleLabel(user.role)}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-muted-foreground">
                          {user.role === 'BRANCH_USER' ? getBranchName(user.branchId) : 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          variant="outline" 
                          className={!user.isBlocked 
                            ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                          }
                        >
                          {!user.isBlocked ? 'Actif' : 'Bloqué'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3 text-orange-500" />
                            <span className="text-xs text-orange-600">{user.cancellationCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingDown className="h-3 w-3 text-red-500" />
                            <span className="text-xs text-red-600">{user.noShowCount}</span>
                          </div>
                          {user.lastOrderAt && (
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-blue-500" />
                              <span className="text-xs text-blue-600">
                                {new Date(user.lastOrderAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="max-w-xs">
                          {user.notes ? (
                            <div className="flex items-center space-x-1">
                              <FileText className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground truncate" title={user.notes}>
                                {user.notes.length > 30 ? `${user.notes.substring(0, 30)}...` : user.notes}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Aucune note</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="hover:bg-muted/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
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

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

              {/* Add/Edit User Modal */}
        {showAddUserModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="border-0 shadow-none">
                <CardHeader className="border-b border-border/20">
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-primary" />
                    <span>Ajouter un Utilisateur</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <form>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom Complet</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Nom et prénom"
                        className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Téléphone</label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="+1234567890"
                        className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rôle</label>
                      <select name="role" className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="">Sélectionner un rôle</option>
                        <option value="BRANCH_USER">Utilisateur de Branche</option>
                        <option value="ADMIN">Admin Général</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Branche (si Admin de Branche)</label>
                      <select name="branchId" className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="">Sélectionner une branche</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Statut</label>
                      <select name="isActive" className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="true">Actif</option>
                        <option value="false">Inactif</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Adresse</label>
                    <textarea
                      name="address"
                      placeholder="Adresse complète..."
                      rows={3}
                      className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mot de Passe</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  </form>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-border/20">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddUserModal(false)}
                      className="hover:bg-muted/20"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={async () => {
                        // Get form data
                        const form = document.querySelector('form') as HTMLFormElement;
                        if (form) {
                          const formData = new FormData(form);
                          const name = formData.get('name') as string;
                          const phone = formData.get('phone') as string;
                          const role = formData.get('role') as string;
                          const branchId = formData.get('branchId') as string;
                          const isActive = formData.get('isActive') === 'true';
                          const address = formData.get('address') as string;
                          const password = formData.get('password') as string;

                          if (name && phone && password) {
                            try {
                              await addUser({
                                name,
                                phone: phone || '',
                                role: role as 'ADMIN' | 'BRANCH_USER',
                                branchId: role === 'BRANCH_USER' ? branchId : undefined,
                                password,
                                isBlocked: !isActive,
                                cancellationCount: 0,
                                noShowCount: 0,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                              });
                              setShowAddUserModal(false);
                              alert('Utilisateur créé avec succès!');
                            } catch (error) {
                              console.error('Error adding user:', error);
                              alert('Erreur lors de la création de l\'utilisateur');
                            }
                          } else {
                            alert('Veuillez remplir tous les champs obligatoires');
                          }
                        }
                      }}
                      className="btn-primary"
                    >
                      Ajouter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setEditingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="border-0 shadow-none">
                <CardHeader className="border-b border-border/20">
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-primary" />
                    <span>Modifier l'Utilisateur</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom Complet</label>
                      <input
                        type="text"
                        defaultValue={editingUser.name}
                        placeholder="Nom et prénom"
                        className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Téléphone</label>
                      <input
                        type="tel"
                        defaultValue={editingUser.phone}
                        placeholder="+1234567890"
                        className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rôle</label>
                      <select 
                        defaultValue={editingUser.role}
                        className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Sélectionner un rôle</option>
                        <option value="BRANCH_USER">Utilisateur de Branche</option>
                        <option value="ADMIN">Admin Général</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Branche (si Admin de Branche)</label>
                      <select 
                        defaultValue={editingUser.branchId || ''}
                        className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Sélectionner une branche</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>{branch.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Statut</label>
                      <select 
                        defaultValue={(!editingUser.isBlocked).toString()}
                        className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="true">Actif</option>
                        <option value="false">Inactif</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Notes</label>
                      <textarea 
                        defaultValue={editingUser.notes || ''}
                        placeholder="Ajouter des notes sur cet utilisateur..."
                        className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Annulations</label>
                        <input 
                          type="number" 
                          defaultValue={editingUser.cancellationCount}
                          min="0"
                          className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Absences</label>
                        <input 
                          type="number" 
                          defaultValue={editingUser.noShowCount}
                          min="0"
                          className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>


                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nouveau Mot de Passe (optionnel)</label>
                    <input
                      type="password"
                      placeholder="Laissez vide pour conserver le mot de passe actuel"
                      className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-border/20">
                    <Button
                      variant="outline"
                      onClick={() => setEditingUser(null)}
                      className="hover:bg-muted/20"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={() => {
                        // Handle save logic here
                        setEditingUser(null);
                      }}
                      className="btn-primary"
                    >
                      Modifier
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
