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
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIngredientsStore } from '@/store/ingredientsStore';
import { useBranchesStore } from '@/store/branchesStore';
import { Ingredient, BranchIngredientAvailability } from '@/types';

export const IngredientsPage = () => {
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
    toggleIngredientExpiration,
    toggleBranchIngredientExpiration,
    getIngredientStats
  } = useIngredientsStore();
  
  const { branches } = useBranchesStore();
  
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [availabilityMatrix, setAvailabilityMatrix] = useState<{ [key: string]: { [key: string]: boolean } }>({});
  const [newlyAddedIngredients, setNewlyAddedIngredients] = useState<Set<string>>(new Set());

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

    if (selectedBranch !== 'all') {
      filtered = filtered.filter(ingredient => {
        const isAvailable = getBranchAvailability(ingredient.id, selectedBranch);
        if (availabilityFilter === 'available') return isAvailable;
        if (availabilityFilter === 'unavailable') return !isAvailable;
        return true;
      });
    }

    setFilteredIngredients(filtered);
  }, [ingredients, searchTerm, availabilityFilter, selectedBranch, getBranchAvailability]);

  useEffect(() => {
    // Initialize availability matrix
    const matrix: { [key: string]: { [key: string]: boolean } } = {};
    ingredients.forEach(ingredient => {
      matrix[ingredient.id] = {};
      branches.forEach(branch => {
        matrix[ingredient.id][branch.id] = getBranchAvailability(ingredient.id, branch.id);
      });
    });
    setAvailabilityMatrix(matrix);
  }, [ingredients, branches, getBranchAvailability, branchAvailabilities]);


  const handleAddIngredient = async () => {
    if (!formData.name.trim()) return;

    try {
      const newIngredient = await addIngredient({ name: formData.name, createdBy: 'system' });
      
      // Mark as newly added for special animation
      setNewlyAddedIngredients(prev => new Set([...prev, newIngredient.id]));
      
      // Remove from newly added after animation completes
      setTimeout(() => {
        setNewlyAddedIngredients(prev => {
          const newSet = new Set(prev);
          newSet.delete(newIngredient.id);
          return newSet;
        });
      }, 2000);
      
      setFormData({ name: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding ingredient:', error);
    }
  };

  const handleUpdateIngredient = async () => {
    if (!editingIngredient || !formData.name.trim()) return;

    try {
      await updateIngredient(editingIngredient.id, { name: formData.name });
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



  const testAvailabilityFeature = () => {
    // Test function to verify availability works
    const storedAvailabilities = localStorage.getItem('branchIngredientAvailabilities');
    
    console.log('=== TESTING AVAILABILITY FEATURE ===');
    console.log('Current branchAvailabilities:', branchAvailabilities);
    console.log('Stored availabilities:', storedAvailabilities ? JSON.parse(storedAvailabilities) : 'None');
    console.log('Availability matrix:', availabilityMatrix);
    
    // Test toggling tomato availability in first branch
    if (branches.length > 0) {
      const firstBranchId = branches[0].id;
      const tomatoId = 'ing_1';
      const availability = branchAvailabilities.find(
        avail => avail.ingredientId === tomatoId && avail.branchId === firstBranchId
      );
      const currentAvailability = availability ? availability.available : true;
      console.log(`Current availability for tomato in ${branches[0].name}:`, currentAvailability);
      
      // Toggle availability
      handleAvailabilityChange(tomatoId, firstBranchId, !currentAvailability);
      alert(`Toggled tomato availability in ${branches[0].name}! Check the console for logs.`);
    }
  };

  const debugAvailability = () => {
    console.log('=== DEBUG AVAILABILITY ===');
    console.log('Ingredients:', ingredients.length);
    console.log('Branches:', branches.length);
    console.log('BranchAvailabilities:', branchAvailabilities.length);
    console.log('AvailabilityMatrix keys:', Object.keys(availabilityMatrix));
    
    // Show first ingredient's availability across all branches
    if (ingredients.length > 0 && branches.length > 0) {
      const firstIngredient = ingredients[0];
      console.log(`\n${firstIngredient.name} availability:`);
      branches.forEach(branch => {
        const availability = branchAvailabilities.find(
          avail => avail.ingredientId === firstIngredient.id && avail.branchId === branch.id
        );
        const isAvailable = availability ? availability.available : true;
        console.log(`  ${branch.name}: ${isAvailable ? 'Available' : 'Unavailable'}`);
      });
    }
  };

  const testReactivity = () => {
    console.log('=== TESTING REACTIVITY ===');
    console.log('Current branchAvailabilities length:', branchAvailabilities.length);
    
    // Test if the UI updates when we change data
    if (branches.length > 0 && ingredients.length > 0) {
      const firstBranchId = branches[0].id;
      const firstIngredientId = ingredients[0].id;
      
      const availability = branchAvailabilities.find(
        avail => avail.ingredientId === firstIngredientId && avail.branchId === firstBranchId
      );
      const currentAvailability = availability ? availability.available : true;
      
      console.log(`Toggling ${ingredients[0].name} in ${branches[0].name} from ${currentAvailability} to ${!currentAvailability}`);
      handleAvailabilityChange(firstIngredientId, firstBranchId, !currentAvailability);
    }
  };

  const debugExpirationState = () => {
    console.log('=== DEBUGGING EXPIRATION STATE ===');
    console.log('Ingredients:', ingredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      expired: ing.expired,
      branchExpired: ing.branchExpired
    })));
    
    console.log('Branch Availabilities:', branchAvailabilities);
    
    // Test first ingredient's state across all branches
    if (ingredients.length > 0 && branches.length > 0) {
      const firstIngredient = ingredients[0];
      console.log(`\n${firstIngredient.name} state across branches:`);
      branches.forEach(branch => {
        const availability = branchAvailabilities.find(
          avail => avail.ingredientId === firstIngredient.id && avail.branchId === branch.id
        );
        const baseAvailability = availability ? availability.available : true;
        const isBranchExpired = firstIngredient.branchExpired?.[branch.id] || false;
        const finalAvailability = baseAvailability && !isBranchExpired;
        
        console.log(`  ${branch.name}: base=${baseAvailability}, expired=${isBranchExpired}, final=${finalAvailability}`);
      });
    }
  };

  const handleAvailabilityChange = async (ingredientId: string, branchId: string, available: boolean) => {
    try {
      console.log('Updating availability:', { ingredientId, branchId, available });
      await updateBranchAvailability(ingredientId, branchId, available);
      console.log('Availability updated successfully');
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
    const total = ingredients.length;
    const totalAvailabilities = branchAvailabilities.length;
    const availableCount = branchAvailabilities.filter(avail => avail.available).length;
    const unavailableCount = totalAvailabilities - availableCount;

    return { total, totalAvailabilities, availableCount, unavailableCount };
  };

  const stats = getOverallStats();

  return (
    <div className="ml-64 p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Gestion des Ingrédients</h1>
          <p className="text-muted-foreground">
            Gestion des ingrédients et de leur disponibilité par branche
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Ingrédient
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Ingrédients', value: stats.total, icon: Package, color: 'text-primary' },
          { title: 'Disponibles', value: stats.availableCount, icon: CheckCircle, color: 'text-green-500' },
          { title: 'Indisponibles', value: stats.unavailableCount, icon: XCircle, color: 'text-red-500' },
          { title: 'Branches', value: branches.length, icon: Building2, color: 'text-purple-500' }
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
                  placeholder="Rechercher un ingrédient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Branch Filter */}
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="px-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Toutes les branches</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>

              {/* Availability Filter */}
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="px-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Toutes</option>
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
        transition={{ delay: 0.4 }}
      >
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Liste des Ingrédients ({filteredIngredients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Ingrédient</th>
                    {selectedBranch === 'all' 
                      ? branches.map(branch => (
                      <th key={branch.id} className="text-center py-3 px-2 lg:px-4 font-medium min-w-[120px]">
                        <div className="flex flex-col items-center space-y-1">
                          <Building2 className="h-4 w-4" />
                          <span className="text-xs text-center break-words">{branch.name}</span>
                        </div>
                      </th>
                        ))
                      : (() => {
                          const selectedBranchData = branches.find(b => b.id === selectedBranch);
                          return selectedBranchData ? (
                            <th className="text-center py-3 px-4 font-medium">
                              <div className="flex flex-col items-center space-y-1">
                                <Building2 className="h-4 w-4" />
                                <span className="text-xs">{selectedBranchData.name}</span>
                              </div>
                            </th>
                          ) : null;
                        })()
                    }
                    <th className="text-left py-3 px-4 font-medium">Statistiques</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIngredients.map((ingredient, index) => {
                    const stats = getIngredientStats(ingredient.id);
                    const isNewlyAdded = newlyAddedIngredients.has(ingredient.id);
                    
                    return (
                      <motion.tr
                        key={ingredient.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              ingredient.expired ? 'bg-orange-500/10' : 'bg-primary/10'
                            }`}>
                              <Package className={`h-4 w-4 ${
                                ingredient.expired ? 'text-orange-500' : 'text-primary'
                              }`} />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className={`font-medium ${ingredient.expired ? 'text-orange-500' : ''}`}>
                                  {ingredient.name}
                                </p>
                                {ingredient.expired && (
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
                        
                        {(selectedBranch === 'all' ? branches : branches.filter(b => b.id === selectedBranch)).map(branch => {
                          // Get availability directly from branchAvailabilities
                          const availability = branchAvailabilities.find(
                            avail => avail.ingredientId === ingredient.id && avail.branchId === branch.id
                          );
                          const baseAvailability = availability ? availability.available : true;
                          const isBranchExpired = ingredient.branchExpired?.[branch.id] || false;
                          
                          // If ingredient is expired in this branch, it should be unavailable
                          const isAvailable = baseAvailability && !isBranchExpired;
                          
                          return (
                            <td key={branch.id} className="py-4 px-2 lg:px-4 text-center">
                              <div className="flex flex-col items-center space-y-1">
                                {/* Availability status display - clickable to toggle */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (isBranchExpired) {
                                      // If expired, clicking should make it available (unexpire)
                                      toggleBranchIngredientExpiration(ingredient.id, branch.id);
                                    } else {
                                      // If not expired, clicking should toggle availability
                                      updateBranchAvailability(ingredient.id, branch.id, !baseAvailability);
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
                                  key={`${ingredient.id}-${branch.id}-expired-${isBranchExpired}`}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleBranchIngredientExpiration(ingredient.id, branch.id)}
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
                          );
                        })}

                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-green-600">{stats.availableBranches}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <XCircle className="h-3 w-3 text-red-500" />
                              <span className="text-red-600">{stats.unavailableBranches}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {/* Global expiration button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleIngredientExpiration(ingredient.id)}
                              className={`hover:bg-orange-500/10 hover:text-orange-500 ${
                                ingredient.expired ? 'bg-orange-500/10 text-orange-500' : ''
                              }`}
                              title={ingredient.expired ? 'Marquer comme disponible (global)' : 'Marquer comme expiré (global)'}
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
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
            className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="border-b border-border/20">
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span>{editingIngredient ? 'Modifier l\'Ingrédient' : 'Nouvel Ingrédient'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom de l'ingrédient</label>
                  <input
                    type="text"
                    placeholder="Nom de l'ingrédient"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-border/20">
                  <Button
                    variant="outline"
                    onClick={closeModals}
                    className="hover:bg-muted/20"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={editingIngredient ? handleUpdateIngredient : handleAddIngredient}
                    className="btn-primary"
                    disabled={!formData.name.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingIngredient ? 'Modifier' : 'Créer'}
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
