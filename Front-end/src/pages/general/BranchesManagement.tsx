import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  MapPin, 
  Edit,
  Trash2,
  Building2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEffect } from 'react';
import { useBranchesStore } from '@/store/branchesStore';
import { useUsersStore } from '@/store/usersStore';
import type { Branch } from '@/types';

const BranchesManagement = () => {
  const { branches, load, create, update, remove, refresh } = useBranchesStore();
  const { load: loadUsers } = useUsersStore();
  useEffect(() => { load(); loadUsers(); }, [load, loadUsers]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      address: ''
    });
  };

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddBranch = async () => {
    // Validation
    if (!formData.name || !formData.address) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const lat = 36.7538 + (Math.random() - 0.5) * 0.1;
      const lng = 3.0588 + (Math.random() - 0.5) * 0.1;
      await create({
        name: formData.name,
        address: formData.address,
        lat,
        lng,
      });
      // No need to refresh - the store already adds the new branch
      setIsAddDialogOpen(false);
      resetForm();
      alert('Branche créée avec succès!');
    } catch (e) {
      console.error('Error creating branch:', e);
      // eslint-disable-next-line no-alert
      alert(e instanceof Error ? e.message : 'Erreur lors de la création de la branche');
    }
  };

  const handleEditBranch = () => {
    if (selectedBranch) {
      try {
        update(selectedBranch.id, {
          name: formData.name,
          address: formData.address,
        });
        refresh();
        setIsEditDialogOpen(false);
        setSelectedBranch(null);
        resetForm();
      } catch (e) {
        console.error('Error updating branch:', e);
        alert(e instanceof Error ? e.message : 'Erreur lors de la mise à jour de la branche');
      }
    }
  };

  const handleDeleteBranch = () => {
    if (selectedBranch) {
      try {
      remove(selectedBranch.id);
        refresh();
      setIsDeleteDialogOpen(false);
      setSelectedBranch(null);
      } catch (e) {
        console.error('Error deleting branch:', e);
        alert(e instanceof Error ? e.message : 'Erreur lors de la suppression de la branche');
      }
    }
  };

  const openEditDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsDeleteDialogOpen(true);
  };

  const stats = {
    total: branches.length,
    active: branches.length, // All branches are considered active in this simplified version
    inactive: 0,
    cities: new Set(branches.map(b => b.address.split(',')[1]?.trim() || 'Unknown')).size
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
          <h1 className="text-3xl font-bold text-foreground">Gestion des Branches</h1>
          <p className="text-muted-foreground">
            Gérez toutes les branches Algeria Eats
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter Branche
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Branches', value: stats.total, icon: Building2, color: 'text-primary' },
          { title: 'Actives', value: stats.active, icon: Building2, color: 'text-green-500' },
          { title: 'Inactives', value: stats.inactive, icon: Building2, color: 'text-red-500' },
          { title: 'Villes', value: stats.cities, icon: MapPin, color: 'text-secondary' }
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
                  placeholder="Rechercher par nom ou adresse..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Branches Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Liste des Branches ({filteredBranches.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Branche</th>
                    <th className="text-left py-3 px-4 font-medium">Adresse</th>
                    <th className="text-left py-3 px-4 font-medium">Statut</th>
                    <th className="text-left py-3 px-4 font-medium">Coordonnées</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBranches.map((branch, index) => (
                    <motion.tr
                      key={branch.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{branch.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {branch.id.split('_')[1]}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground max-w-xs truncate">
                            {branch.address}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="bg-green-500/10 border-green-500/20 text-green-500">
                          Active
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-mono text-muted-foreground">
                          {branch.lat.toFixed(4)}, {branch.lng.toFixed(4)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(branch)}
                            className="hover:bg-muted/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(branch)}
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

            {filteredBranches.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune branche trouvée</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Branch Modal */}
      {isAddDialogOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsAddDialogOpen(false)}
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
                  <Building2 className="h-5 w-5 text-primary" />
                  <span>Nouvelle Branche</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom de la branche</label>
                  <input
                    type="text"
                    placeholder="Nom de la branche"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Adresse</label>
                  <textarea
                    placeholder="Adresse complète de la branche"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                    className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-border/20">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="hover:bg-muted/20"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleAddBranch}
                    className="btn-primary"
                    disabled={!formData.name.trim() || !formData.address.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Branch Modal */}
      {isEditDialogOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsEditDialogOpen(false)}
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
                  <Building2 className="h-5 w-5 text-primary" />
                  <span>Modifier la Branche</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom de la branche</label>
                  <input
                    type="text"
                    placeholder="Nom de la branche"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Adresse</label>
                  <textarea
                    placeholder="Adresse complète de la branche"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                    className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-border/20">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="hover:bg-muted/20"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleEditBranch}
                    className="btn-primary"
                    disabled={!formData.name.trim() || !formData.address.trim()}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Branch Modal */}
      {isDeleteDialogOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsDeleteDialogOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="border-b border-border/20">
                <CardTitle className="flex items-center space-x-2">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <span>Supprimer la Branche</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">
                  Êtes-vous sûr de vouloir supprimer la branche <strong>"{selectedBranch?.name}"</strong> ? 
                  Cette action est irréversible.
                </p>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    className="hover:bg-muted/20"
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteBranch}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
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

export default BranchesManagement;