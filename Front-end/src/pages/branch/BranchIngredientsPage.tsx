import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Building2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Filter,
  Save,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIngredientsStore } from '@/store/ingredientsStore';
import { useAuthStore } from '@/store/authStore';
import { useBranchesStore } from '@/store/branchesStore';
import { Ingredient, BranchIngredientAvailability } from '@/types';

export const BranchIngredientsPage = () => {
  const { user } = useAuthStore();
  const { branches } = useBranchesStore();
  const { 
    ingredients, 
    branchAvailabilities, 
    load, 
    loading, 
    error, 
    addIngredient, 
    updateIngredient, 
    deleteIngredient,
    updateBranchAvailability,
    getBranchAvailability,
    toggleBranchIngredientExpiration,
    getIngredientStats
  } = useIngredientsStore();
  
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  // Get current branch
  const currentBranch = branches.find(branch => branch.id === user?.branchId);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let filtered = ingredients;

    if (searchTerm) {
      filtered = filtered.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (availabilityFilter !== 'all' && currentBranch) {
      filtered = filtered.filter(ingredient => {
        const availability = branchAvailabilities.find(
          avail => avail.ingredientId === ingredient.id && avail.branchId === currentBranch.id
        );
        const baseAvailability = availability ? availability.available : true;
        const isBranchExpired = ingredient.branchExpired?.[currentBranch.id] || false;
        const isAvailable = baseAvailability && !isBranchExpired;
        
        return availabilityFilter === 'available' ? isAvailable : !isAvailable;
      });
    }

    setFilteredIngredients(filtered);
  }, [ingredients, searchTerm, availabilityFilter, branchAvailabilities, currentBranch]);

  const handleAddIngredient = async () => {
    if (!formData.name.trim()) return;

    try {
      await addIngredient({ name: formData.name.trim() });
      setFormData({ name: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding ingredient:', error);
    }
  };

  const handleUpdateIngredient = async () => {
    if (!editingIngredient || !formData.name.trim()) return;

    try {
      await updateIngredient(editingIngredient.id, { name: formData.name.trim() });
      setEditingIngredient(null);
      setFormData({ name: '' });
    } catch (error) {
      console.error('Error updating ingredient:', error);
    }
  };

  const handleDeleteIngredient = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet ingrédient ?')) {
      try {
        await deleteIngredient(id);
      } catch (error) {
        console.error('Error deleting ingredient:', error);
      }
    }
  };

  const handleAvailabilityChange = async (ingredientId: string, available: boolean) => {
    if (!currentBranch) return;
    
    try {
      await updateBranchAvailability(ingredientId, currentBranch.id, available);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const openEditModal = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({ name: ingredient.name });
  };

  const closeModals = () => {
    setShowAddModal(false);
    setEditingIngredient(null);
    setFormData({ name: '' });
  };

  const getOverallStats = () => {
    if (!currentBranch) return { total: 0, available: 0, unavailable: 0, expired: 0 };
    
    const total = ingredients.length;
    let available = 0;
    let unavailable = 0;
    let expired = 0;

    ingredients.forEach(ingredient => {
      const availability = branchAvailabilities.find(
        avail => avail.ingredientId === ingredient.id && avail.branchId === currentBranch.id
      );
      const baseAvailability = availability ? availability.available : true;
      const isBranchExpired = ingredient.branchExpired?.[currentBranch.id] || false;
      
      if (isBranchExpired) {
        expired++;
      } else if (baseAvailability) {
        available++;
      } else {
        unavailable++;
      }
    });

    return { total, available, unavailable, expired };
  };

  const stats = getOverallStats();

  if (loading) {
    return (
      <div className="ml-64 p-8 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des ingrédients...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-64 p-8 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">Erreur lors du chargement des ingrédients</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Ingrédients</h1>
          <p className="text-muted-foreground mt-2">
            Gestion des ingrédients pour {currentBranch?.name || 'votre branche'}
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvel Ingrédient</span>
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Ingrédients', value: stats.total, icon: Package, color: 'text-primary' },
          { title: 'Disponibles', value: stats.available, icon: CheckCircle, color: 'text-green-500' },
          { title: 'Indisponibles', value: stats.unavailable, icon: XCircle, color: 'text-red-500' },
          { title: 'Expirés', value: stats.expired, icon: AlertTriangle, color: 'text-orange-500' }
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

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher un ingrédient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="px-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="available">Disponibles</option>
                <option value="unavailable">Indisponibles</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ingredients Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Ingrédients ({filteredIngredients.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Ingrédient</th>
                    <th className="text-center py-3 px-4 font-medium">Statut</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIngredients.map((ingredient, index) => {
                    if (!currentBranch) return null;
                    
                    const availability = branchAvailabilities.find(
                      avail => avail.ingredientId === ingredient.id && avail.branchId === currentBranch.id
                    );
                    const baseAvailability = availability ? availability.available : true;
                    const isBranchExpired = ingredient.branchExpired?.[currentBranch.id] || false;
                    const isAvailable = baseAvailability && !isBranchExpired;
                    
                    return (
                      <motion.tr
                        key={ingredient.id}
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isBranchExpired ? 'bg-orange-500/10' : 'bg-primary/10'
                            }`}>
                              <Package className={`h-4 w-4 ${
                                isBranchExpired ? 'text-orange-500' : 'text-primary'
                              }`} />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className={`font-medium ${isBranchExpired ? 'text-orange-500' : ''}`}>
                                  {ingredient.name}
                                </p>
                                {isBranchExpired && (
                                  <Badge variant="outline" className="bg-orange-500/10 border-orange-500/20 text-orange-500 text-xs">
                                    Expiré
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Créé le {new Date(ingredient.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center space-y-1">
                            {/* Status display - clickable to toggle availability */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (isBranchExpired) {
                                  // If expired, clicking should make it available (unexpire)
                                  toggleBranchIngredientExpiration(ingredient.id, currentBranch.id);
                                } else {
                                  // If not expired, clicking should toggle availability
                                  const availability = branchAvailabilities.find(
                                    avail => avail.ingredientId === ingredient.id && avail.branchId === currentBranch.id
                                  );
                                  const baseAvailability = availability ? availability.available : true;
                                  handleAvailabilityChange(ingredient.id, !baseAvailability);
                                }
                              }}
                              className={`w-8 h-8 p-0 rounded-full ${
                                isBranchExpired
                                  ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-500' 
                                  : isAvailable 
                                  ? 'bg-green-500/10 hover:bg-green-500/20 text-green-500' 
                                  : 'bg-red-500/10 hover:bg-red-500/20 text-red-500'
                              }`}
                              title={
                                isBranchExpired 
                                  ? 'Cliquer pour marquer comme disponible (non expiré)'
                                  : isAvailable 
                                  ? 'Cliquer pour marquer comme indisponible'
                                  : 'Cliquer pour marquer comme disponible'
                              }
                            >
                              {isBranchExpired ? (
                                <AlertTriangle className="h-4 w-4" />
                              ) : isAvailable ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </Button>
                            {/* Expired button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleBranchIngredientExpiration(ingredient.id, currentBranch.id)}
                              className={`w-6 h-6 p-0 ${
                                isBranchExpired 
                                  ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-500' 
                                  : 'hover:bg-orange-500/10 hover:text-orange-500 text-muted-foreground'
                              }`}
                              title={isBranchExpired ? 'Marquer comme non expiré' : 'Marquer comme expiré'}
                            >
                              <AlertTriangle className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(ingredient)}
                              className="hover:bg-muted/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteIngredient(ingredient.id)}
                              className="hover:bg-red-500/10 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredIngredients.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun ingrédient trouvé</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingIngredient) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={closeModals}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingIngredient ? 'Modifier l\'Ingrédient' : 'Nouvel Ingrédient'}
              </h3>
              <Button variant="ghost" size="sm" onClick={closeModals}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom de l'ingrédient</label>
                <Input
                  placeholder="Nom de l'ingrédient"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <Button
                  onClick={editingIngredient ? handleUpdateIngredient : handleAddIngredient}
                  className="flex-1"
                  disabled={!formData.name.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingIngredient ? 'Modifier' : 'Créer'}
                </Button>
                <Button variant="outline" onClick={closeModals}>
                  Annuler
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
