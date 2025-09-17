import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Star,
  Tag,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Building2,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { useDishesStore } from '@/store/dishesStore';
import { useIngredientsStore } from '@/store/ingredientsStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import { Dish as DishType, Ingredient } from '@/types';

export const BranchProductsPage = () => {
  const { user } = useAuthStore();
  const { dishes, create: addDish, update: updateDish, remove: deleteDish, load: loadDishes, refresh, loading, error } = useDishesStore();
  const { ingredients, load: loadIngredients } = useIngredientsStore();
  const { categories, load: loadCategories } = useCategoriesStore();
  const [isLoading, setIsLoading] = useState(true);
  
  // Load dishes, ingredients, and categories on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([loadDishes(), loadIngredients(), loadCategories()]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []); // Remove loadDishes from dependencies to prevent infinite loop
  
  // Filter dishes for this specific branch with error handling using useMemo
  const branchDishes = useMemo(() => {
    return dishes.filter(dish => {
      try {
        // Since we use branchId as menuId, filter by menuId directly
        return dish.menuId === user?.branchId;
      } catch (error) {
        console.warn('Error filtering dish:', error, dish);
        return false;
      }
    });
  }, [dishes, user?.branchId]);
  
  // Categories are now loaded from the categories store
  // const categories = useMemo(() => {
  //   return [...new Set(branchDishes.map(p => p.category || p.categoryId))].filter(Boolean);
  // }, [branchDishes]);
  const [filteredDishes, setFilteredDishes] = useState<DishType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingDish, setEditingDish] = useState<DishType | null>(null);
  
  // Form data for adding/editing products
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceCents: '',
    categoryId: '',
    imageUrl: '',
    available: true,
    menuId: user?.branchId || '', // Use the user's branchId as menuId
    ingredients: [] as Array<{ ingredientId: string; qtyUnit?: number; required: boolean }>,
    allergens: '',
    preparationTime: '15'
  });

  // branchDishes is already defined above

  // Remove this empty useEffect that was causing issues

  useEffect(() => {
    // Filter products based on search and filters
    let filtered = branchDishes;

    if (searchTerm) {
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(dish => (dish.categoryId || dish.category) === categoryFilter);
    }

    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(dish => 
        availabilityFilter === 'available' ? dish.available : !dish.available
      );
    }

    setFilteredDishes(filtered);
  }, [branchDishes, searchTerm, categoryFilter, availabilityFilter]);

  // Category utility functions removed - using categories store

  const handleAddProduct = () => {
    setFormData({
      name: '',
      description: '',
      priceCents: '',
      categoryId: '',
      imageUrl: '',
      available: true,
      menuId: user?.branchId || '',
      ingredients: [],
      allergens: '',
      preparationTime: '15'
    });
    setShowAddProductModal(true);
  };

  const handleEditDish = (dish: DishType) => {
    setFormData({
      name: dish.name,
      description: dish.description || '',
      priceCents: dish.priceCents.toString(),
      categoryId: dish.categoryId || dish.category || '',
      imageUrl: dish.imageUrl || '',
      available: dish.available,
      menuId: dish.menuId,
      ingredients: dish.ingredients?.map(ing => ({
        ingredientId: ing.ingredientId,
        qtyUnit: ing.qtyUnit,
        required: ing.required
      })) || [],
      allergens: '', // TODO: Add allergens field to Dish type
      preparationTime: '15' // TODO: Add preparationTime field to Dish type
    });
    setEditingDish(dish);
    setShowAddProductModal(true); // Open the modal for editing
  };

  const handleSubmitProduct = async () => {
    if (!formData.name || !formData.description || !formData.priceCents || !formData.categoryId) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      priceCents: parseInt(formData.priceCents),
      categoryId: formData.categoryId,
      imageUrl: formData.imageUrl,
      available: formData.available,
      menuId: formData.menuId,
      ingredients: formData.ingredients,
      createdAt: new Date().toISOString()
    };

    if (editingDish) {
      await updateDish(editingDish.id, productData);
    } else {
      await addDish(productData);
    }

    // Refresh the dishes list to ensure UI is updated
    refresh();

    setShowAddProductModal(false);
    setEditingDish(null);
    setFormData({
      name: '',
      description: '',
      priceCents: '',
      categoryId: '',
      imageUrl: '',
      available: true,
      menuId: user?.branchId || '',
      ingredients: [],
      allergens: '',
      preparationTime: '15'
    });
  };

  const handleToggleAvailability = async (dishId: string, available: boolean) => {
    await updateDish(dishId, { available });
    refresh(); // Refresh the dishes list after toggle
  };

  const handleDeleteDish = async (dishId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      await deleteDish(dishId);
      refresh(); // Refresh the dishes list after deletion
    }
  };

  const addIngredientToDish = (ingredientId: string) => {
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    if (!ingredient) return;

    const newIngredient = {
      ingredientId: ingredient.id,
      qtyUnit: 1,
      required: true
    };

    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }));
  };

  const removeIngredientFromDish = (ingredientId: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.ingredientId !== ingredientId)
    }));
  };

  const updateIngredientQuantity = (ingredientId: string, qtyUnit: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => 
        ing.ingredientId === ingredientId ? { ...ing, qtyUnit } : ing
      )
    }));
  };

  const toggleIngredientRequired = (ingredientId: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => 
        ing.ingredientId === ingredientId ? { ...ing, required: !ing.required } : ing
      )
    }));
  };


  const stats = useMemo(() => ({
    total: branchDishes.length,
    available: branchDishes.filter(d => d.available || d.isAvailable).length,
    unavailable: branchDishes.filter(d => !(d.available || d.isAvailable)).length,
    categories: [...new Set(branchDishes.map(d => d.categoryId || d.category))].filter(Boolean).length,
    totalValue: branchDishes.reduce((sum, dish) => sum + (dish.priceCents || 0), 0)
  }), [branchDishes]);


  // Show loading state
  if (isLoading || loading) {
    return (
      <div className="ml-64 p-8 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des produits...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="ml-64 p-8 space-y-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">Erreur lors du chargement des produits</p>
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button onClick={() => loadDishes()} className="mt-4">
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Gestion des Produits</h1>
          <p className="text-muted-foreground">
            Gérez le catalogue de produits de votre restaurant
          </p>
        </div>
        <Button onClick={handleAddProduct} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter Produit
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Produits', value: stats.total, icon: Package, color: 'text-primary' },
          { title: 'Disponibles', value: stats.available, icon: Package, color: 'text-green-500' },
          { title: 'Indisponibles', value: stats.unavailable, icon: AlertCircle, color: 'text-red-500' },
          { title: 'Catégories', value: stats.categories, icon: Tag, color: 'text-secondary' },
          { title: 'Valeur Stock', value: `${stats.totalValue.toLocaleString()} DA`, icon: TrendingUp, color: 'text-yellow-500' }
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
                  placeholder="Rechercher par nom ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.icon} {category.name}</option>
                ))}
              </select>

              {/* Availability Filter */}
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

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish, index) => (
          <motion.div
            key={dish.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="card-gradient hover-scale h-full">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{dish.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={`${(() => {
                          const category = categories.find(cat => cat.id === (dish.categoryId || dish.category));
                          return category ? `bg-[${category.color}]` : 'bg-gray-500';
                        })()}/10 border-${(() => {
                          const category = categories.find(cat => cat.id === (dish.categoryId || dish.category));
                          return category ? `bg-[${category.color}]` : 'bg-gray-500';
                        })()}/20`}
                      >
                        {(() => {
                          const category = categories.find(cat => cat.id === (dish.categoryId || dish.category));
                          return category ? `${category.icon} ${category.name}` : 'Autre';
                        })()}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={(dish.available || dish.isAvailable) 
                          ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                          : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }
                      >
                        {(dish.available || dish.isAvailable) ? 'Disponible' : 'Indisponible'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Dish Image */}
                <div className="aspect-square bg-muted/20 rounded-lg overflow-hidden">
                  {dish.imageUrl ? (
                    <img 
                      src={dish.imageUrl} 
                      alt={dish.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Dish Info */}
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {dish.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">4.5</span>
                      <span className="text-xs text-muted-foreground">(12)</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {(dish.priceCents / 100).toLocaleString()} DA
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Menu: {dish.menu?.name || 'Menu par défaut'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border/20">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditDish(dish)}
                      className="hover:bg-muted/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDish(dish.id)}
                      className="hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAvailability(dish.id, !(dish.available || dish.isAvailable))}
                    className={(dish.available || dish.isAvailable) 
                      ? 'hover:bg-red-500/10 hover:text-red-500' 
                      : 'hover:bg-green-500/10 hover:text-green-500'
                    }
                  >
                    {(dish.available || dish.isAvailable) ? 'Désactiver' : 'Activer'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredDishes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucun produit trouvé</p>
        </motion.div>
      )}


      {/* Add/Edit Product Modal */}
      <Dialog open={showAddProductModal} onOpenChange={(open) => {
        if (!open) {
          // When closing the modal, reset editing state
          setEditingDish(null);
          setFormData({
            name: '',
            description: '',
            priceCents: '',
            categoryId: '',
            imageUrl: '',
            available: true,
            menuId: user?.branchId || '',
            ingredients: [],
            allergens: '',
            preparationTime: '15'
          });
        }
        setShowAddProductModal(open);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDish ? 'Modifier le Produit' : 'Ajouter un Produit'}
            </DialogTitle>
            <DialogDescription>
              {editingDish ? 'Modifiez les informations du produit' : 'Ajoutez un nouveau produit à votre catalogue'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-8">
            {/* Base Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted/20 border border-border/30 rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Informations de Base</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Image */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                    <span>Image du produit</span>
                    <Button variant="outline" size="sm" className="text-xs">URL</Button>
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full p-4 bg-black border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 hover:border-border text-white placeholder:text-gray-400"
                  />
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Product Name */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                    <span>Nom du produit</span>
                    <Badge variant="destructive" className="text-xs">*</Badge>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Pizza Margherita"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-4 bg-black border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 hover:border-border text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                  <span>Description</span>
                  <Badge variant="destructive" className="text-xs">*</Badge>
                </label>
                <textarea
                  placeholder="Décrivez votre produit de manière attrayante..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-4 bg-black border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 hover:border-border resize-none text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Pricing & Category Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted/20 border border-border/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Prix & Catégorie</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Price */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                    <span>Prix</span>
                    <Badge variant="destructive" className="text-xs">*</Badge>
                    <Badge variant="outline" className="text-xs">DA</Badge>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.priceCents}
                      onChange={(e) => setFormData({ ...formData, priceCents: e.target.value })}
                      className="w-full p-4 bg-black border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 hover:border-border text-white placeholder:text-gray-400"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      DA
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                    <span>Catégorie</span>
                    <Badge variant="destructive" className="text-xs">*</Badge>
                  </label>
                  <select 
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-4 bg-black border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 hover:border-border appearance-none cursor-pointer relative z-[10001] text-white"
                  >
                    <option value="">🍽️ Sélectionner une catégorie</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Availability & Ingredients Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted/20 border border-border/30 rounded-lg flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Disponibilité & Ingrédients</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Branch (read-only for branch users) */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                    <span>Branche</span>
                    <Badge variant="destructive" className="text-xs">*</Badge>
                  </label>
                  <div className="w-full p-4 bg-muted/20 border border-border/50 rounded-xl text-muted-foreground">
                    📍 {user?.branch?.name || 'Votre branche'}
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Disponibilité</label>
                  <div className="flex items-center space-x-3 p-4 bg-black border border-border/50 rounded-xl">
                    <Switch
                      checked={formData.available}
                      onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                      className="data-[state=checked]:bg-green-500"
                    />
                    <span className={`flex items-center space-x-2 ${formData.available ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {formData.available ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      <span className="font-medium">{formData.available ? 'Disponible' : 'Indisponible'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                  <span>Ingrédients</span>
                  <Badge variant="destructive" className="text-xs">*</Badge>
                </label>
                
                {/* Add Ingredient */}
                <div className="space-y-2">
                  <select 
                    onChange={(e) => {
                      if (e.target.value) {
                        addIngredientToDish(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full p-4 bg-black border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 hover:border-border appearance-none cursor-pointer relative z-[10001] text-white"
                  >
                    <option value="">🥘 Sélectionner un ingrédient</option>
                    {ingredients
                      .filter(ing => !formData.ingredients.some(formIng => formIng.ingredientId === ing.id))
                      .map((ingredient) => (
                        <option key={ingredient.id} value={ingredient.id}>
                          {ingredient.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Selected Ingredients */}
                {formData.ingredients.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Ingrédients sélectionnés</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {formData.ingredients.map((ingredientForm) => {
                        const ingredient = ingredients.find(ing => ing.id === ingredientForm.ingredientId);
                        if (!ingredient) return null;
                        
                        return (
                          <div key={ingredient.id} className="flex items-center space-x-2 p-3 bg-black border border-border/50 rounded-xl">
                            <div className="flex-1">
                              <p className="font-medium text-white">{ingredient.name}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <label className="text-xs text-muted-foreground">Quantité:</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={ingredientForm.qtyUnit || 1}
                                  onChange={(e) => updateIngredientQuantity(ingredient.id, parseInt(e.target.value) || 1)}
                                  className="w-16 h-6 text-xs bg-muted/20 border border-border/50 rounded px-2 text-white"
                                />
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="checkbox"
                                    id={`required-${ingredient.id}`}
                                    checked={ingredientForm.required}
                                    onChange={() => toggleIngredientRequired(ingredient.id)}
                                    className="w-3 h-3"
                                  />
                                  <label htmlFor={`required-${ingredient.id}`} className="text-xs text-muted-foreground">
                                    Requis
                                  </label>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeIngredientFromDish(ingredient.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Supplementary Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted/20 border border-border/30 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Informations Supplémentaires</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Allergens */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                    <span>Allergènes</span>
                    <Badge variant="outline" className="text-xs">Optionnel</Badge>
                  </label>
                  <input
                    type="text"
                    placeholder="Gluten, Lait, Œufs..."
                    value={formData.allergens}
                    onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                    className="w-full p-4 bg-black border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 hover:border-border text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Preparation Time */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                    <span>Temps de préparation</span>
                    <Badge variant="outline" className="text-xs">Minutes</Badge>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="15"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                      className="w-full p-4 bg-black border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 hover:border-border text-white placeholder:text-gray-400"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      min
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-border/20">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddProductModal(false);
                setEditingDish(null);
                // Reset form to default values
                setFormData({
                  name: '',
                  description: '',
                  priceCents: '',
                  categoryId: '',
                  imageUrl: '',
                  available: true,
                  menuId: user?.branchId || '',
                  ingredients: [],
                  allergens: '',
                  preparationTime: '15'
                });
              }}
              className="px-6 py-3 hover:bg-muted/20 transition-all duration-200 border-border/50"
            >
              <span className="mr-2">❌</span>
              Annuler
            </Button>
            <Button
              onClick={handleSubmitProduct}
              className="px-6 py-3 bg-primary hover:bg-primary/90 transition-all duration-200"
            >
              <span className="mr-2">➕</span>
              {editingDish ? 'Modifier le Produit' : 'Créer le Produit'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};