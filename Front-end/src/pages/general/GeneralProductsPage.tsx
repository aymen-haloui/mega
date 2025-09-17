import { useState, useEffect } from 'react';
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
  Building2,
  TrendingUp,
  AlertCircle,
  DollarSign
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
import { useBranchesStore } from '@/store/branchesStore';
import { useDishesStore } from '@/store/dishesStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useIngredientsStore } from '@/store/ingredientsStore';
import { Dish as DishType } from '@/types';

export const GeneralProductsPage = () => {
  const { branches, load: loadBranches } = useBranchesStore();
  const { dishes, load: loadDishes, create: addDish, update: updateDish, remove: deleteDish, refresh: refreshDishes } = useDishesStore();
  const { categories, load: loadCategories } = useCategoriesStore();
  const { ingredients, load: loadIngredients, getAvailableIngredients } = useIngredientsStore();
  const [filteredProducts, setFilteredProducts] = useState<DishType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DishType | null>(null);
  
  // Form data for adding/editing products
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priceCents: '',
    categoryId: '',
    branchId: '',
    imageUrl: '',
    available: true,
    menuId: '',
    selectedIngredientId: '',
    selectedIngredients: [] as string[],
    allergens: '',
    preparationTime: '15'
  });

  useEffect(() => {
    // Load data from stores
    loadBranches();
    loadDishes();
    loadCategories();
    loadIngredients();
  }, [loadBranches, loadDishes, loadCategories, loadIngredients]);

  useEffect(() => {
    // Update filtered products when products change
    setFilteredProducts(Array.isArray(dishes) ? dishes : []);
  }, [dishes]);

  useEffect(() => {
    // Filter products based on search and filters
    let filtered = Array.isArray(dishes) ? dishes : [];

    if (searchTerm) {
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(dish => dish.categoryId === categoryFilter);
    }

    if (branchFilter !== 'all') {
      filtered = filtered.filter(dish => dish.menu.branchId === branchFilter);
    }

    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(dish => 
        availabilityFilter === 'available' ? dish.available : !dish.available
      );
    }

    setFilteredProducts(filtered);
  }, [dishes, searchTerm, categoryFilter, branchFilter, availabilityFilter]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? `${category.icon} ${category.name}` : 'Catégorie inconnue';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || 'bg-gray-500';
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : 'Branche inconnue';
  };

  const handleAddProduct = () => {
    setFormData({
      name: '',
      description: '',
      priceCents: '',
      categoryId: '',
      branchId: '',
      imageUrl: '',
      available: true,
      menuId: '',
      selectedIngredientId: '',
      selectedIngredients: [],
      allergens: '',
      preparationTime: '15'
    });
    setShowAddProductModal(true);
  };

  const handleEditProduct = (product: DishType) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      priceCents: (product.priceCents / 100).toString(),
      categoryId: product.categoryId || '',
      branchId: product.menu?.branchId || product.menuId || '',
      imageUrl: product.imageUrl || '',
      available: product.available,
      menuId: product.menuId,
      selectedIngredientId: '',
      selectedIngredients: product.ingredients?.map(ing => ing.ingredientId) || [],
      allergens: '',
      preparationTime: '15'
    });
    setEditingProduct(product);
    setShowAddProductModal(true); // Open the modal for editing
  };

  const handleSubmitProduct = async () => {
    if (!formData.name || !formData.description || !formData.priceCents || !formData.categoryId || !formData.branchId) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      priceCents: parseInt(formData.priceCents) * 100,
      categoryId: formData.categoryId,
      menuId: formData.menuId,
      ingredients: formData.selectedIngredients.map(ingredientId => ({
        ingredientId,
        required: true,
        qtyUnit: 1
      }))
    };

    if (editingProduct) {
      await updateDish(editingProduct.id, {
        ...productData,
        available: formData.available,
        imageUrl: formData.imageUrl
      });
    } else {
      await addDish(productData);
    }

    // Refresh the dishes list to ensure UI is updated
    refreshDishes();

    setShowAddProductModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      priceCents: '',
      categoryId: '',
      branchId: '',
      imageUrl: '',
      available: true,
      menuId: '',
      selectedIngredientId: '',
      selectedIngredients: [],
      allergens: '',
      preparationTime: '15'
    });
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      await deleteDish(productId);
      refreshDishes();
    }
  };

  const handleToggleAvailability = async (productId: string, available: boolean) => {
    await updateDish(productId, { available });
    refreshDishes();
  };

  const stats = {
    total: Array.isArray(dishes) ? dishes.length : 0,
    available: Array.isArray(dishes) ? dishes.filter(p => p.available).length : 0,
    unavailable: Array.isArray(dishes) ? dishes.filter(p => !p.available).length : 0,
    categories: categories.length,
    branches: Array.isArray(dishes) ? [...new Set(dishes.map(p => p.menu.branchId))].length : 0,
    totalValue: Array.isArray(dishes) ? dishes.reduce((sum, dish) => sum + (dish.priceCents / 100), 0) : 0,
    averageRating: 4.5 // Placeholder since rating is not in the schema
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
          <h1 className="text-3xl font-bold text-foreground">Catalogue Global des Produits</h1>
          <p className="text-muted-foreground">
            Gérez tous les produits de toutes les branches
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
          { title: 'Branches', value: stats.branches, icon: Building2, color: 'text-blue-500' },
          { title: 'Valeur Stock', value: `${stats.totalValue.toLocaleString()} DA`, icon: DollarSign, color: 'text-yellow-500' },
          { title: 'Note Moyenne', value: `${stats.averageRating.toFixed(1)}★`, icon: Star, color: 'text-accent' }
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2 relative">
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
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>

              {/* Branch Filter */}
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
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
                <option value="all">Tous les statuts</option>
                <option value="available">Disponibles</option>
                <option value="unavailable">Indisponibles</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="card-gradient hover-scale h-full">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`${getCategoryColor(product.categoryId)}/10 border-${getCategoryColor(product.categoryId)}/20`}
                      >
                        {getCategoryName(product.categoryId)}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="bg-blue-500/10 border-blue-500/20 text-blue-500"
                      >
                        {getBranchName(product.menu.branchId)}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={product.available 
                          ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                          : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }
                      >
                        {product.available ? 'Disponible' : 'Indisponible'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product Image */}
                <div className="aspect-square bg-muted/20 rounded-lg overflow-hidden">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                  
                  {/* Ingredients Display */}
                  {product.ingredients && product.ingredients.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground flex items-center space-x-1">
                        <span>🥘</span>
                        <span>Ingrédients:</span>
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {product.ingredients.slice(0, 3).map((ingredient, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs bg-primary/5 border-primary/20 text-primary"
                          >
                            {ingredient.ingredient?.name || `Ingredient ${ingredient.ingredientId}`}
                          </Badge>
                        ))}
                        {product.ingredients.length > 3 && (
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-muted/20 border-muted/30 text-muted-foreground"
                          >
                            +{product.ingredients.length - 3} autres
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">4.5</span>
                      <span className="text-xs text-muted-foreground">(0)</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {(product.priceCents / 100).toLocaleString()} DA
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Menu: {product.menu.name}
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
                      onClick={() => handleEditProduct(product)}
                      className="hover:bg-muted/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="hover:bg-red-500/10 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAvailability(product.id, !product.available)}
                    className={product.available 
                      ? 'hover:bg-red-500/10 hover:text-red-500' 
                      : 'hover:bg-green-500/10 hover:text-green-500'
                    }
                  >
                    {product.available ? 'Désactiver' : 'Activer'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
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
      {showAddProductModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]"
          onClick={() => setShowAddProductModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-[10000]"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="border-b border-border/20">
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span>Ajouter un Produit</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Image Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-muted/20 border border-border/30 rounded-lg flex items-center justify-center">
                      <Package className="h-4 w-4 text-yellow-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Informations de Base</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Image URL */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                        <span>Image du produit</span>
                        <Badge variant="outline" className="text-xs">URL</Badge>
                      </label>
                      <div className="relative">
                    <input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="w-full p-4 bg-black border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 hover:border-border text-white placeholder:text-gray-400"
                        />
                        {formData.imageUrl && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                  </div>
                  </div>
                        )}
                      </div>
                      {formData.imageUrl && (
                        <div className="mt-3">
                          <img 
                            src={formData.imageUrl} 
                            alt="Preview" 
                            className="w-24 h-24 object-cover rounded-lg border-2 border-border/20 shadow-sm"
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
                      <DollarSign className="h-4 w-4 text-yellow-500" />
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

                {/* Branch & Ingredients Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-muted/20 border border-border/30 rounded-lg flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-yellow-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Disponibilité & Ingrédients</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Branch */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                        <span>Branche</span>
                        <Badge variant="destructive" className="text-xs">*</Badge>
                      </label>
                      <select 
                        value={formData.branchId}
                        onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                        className="w-full p-4 bg-black border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 hover:border-border appearance-none cursor-pointer relative z-[10001] text-white"
                      >
                        <option value="">🏢 Sélectionner une branche</option>
                        <option value="all">🌍 Toutes les branches</option>
                      {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>📍 {branch.name}</option>
                      ))}
                    </select>
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
                        <span className={`text-sm font-medium ${formData.available ? 'text-green-600' : 'text-red-600'}`}>
                          {formData.available ? '✅ Disponible' : '❌ Indisponible'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground flex items-center space-x-2">
                      <span>Ingrédients</span>
                      <Badge variant="destructive" className="text-xs">*</Badge>
                    </label>
                    <div className="p-4 bg-black border border-border/50 rounded-xl">
                      <select 
                        value={formData.selectedIngredientId}
                        onChange={(e) => setFormData({ ...formData, selectedIngredientId: e.target.value })}
                        className="w-full p-3 bg-black border border-border/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200 appearance-none cursor-pointer relative z-[10001] text-white"
                      >
                        <option value="">🥘 Sélectionner un ingrédient</option>
                        {ingredients.map(ingredient => (
                          <option key={ingredient.id} value={ingredient.id}>
                            {ingredient.name}
                          </option>
                        ))}
                    </select>
                      
                      {formData.selectedIngredientId && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const ingredient = ingredients.find(ing => ing.id === formData.selectedIngredientId);
                            if (ingredient && !formData.selectedIngredients.includes(ingredient.id)) {
                              setFormData({
                                ...formData,
                                selectedIngredients: [...formData.selectedIngredients, ingredient.id],
                                selectedIngredientId: ''
                              });
                            }
                          }}
                          className="mt-3 text-xs bg-primary/10 hover:bg-primary/20 border-primary/30"
                        >
                          ➕ Ajouter cet ingrédient
                        </Button>
                      )}
                      
                      {formData.selectedIngredients.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground mb-3 flex items-center space-x-2">
                            <span>Ingrédients sélectionnés:</span>
                            <Badge variant="secondary" className="text-xs">
                              {formData.selectedIngredients.length}
                            </Badge>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {formData.selectedIngredients.map(ingredientId => {
                              const ingredient = ingredients.find(ing => ing.id === ingredientId);
                              return ingredient ? (
                                <Badge key={ingredientId} variant="secondary" className="flex items-center space-x-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                                  <span>{ingredient.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => setFormData({
                                      ...formData,
                                      selectedIngredients: formData.selectedIngredients.filter(id => id !== ingredientId)
                                    })}
                                    className="ml-1 hover:text-red-500 transition-colors"
                                  >
                                    ✕
                                  </button>
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Additional Info Section */}
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

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-border/20">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddProductModal(false)}
                    className="px-6 py-3 hover:bg-muted/20 transition-all duration-200 border-border/50"
                  >
                    <span className="mr-2">❌</span>
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSubmitProduct}
                    className="px-8 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    disabled={!formData.name || !formData.priceCents || !formData.categoryId || !formData.branchId}
                  >
                    <span className="mr-2">{editingProduct ? '✏️' : '✨'}</span>
                    {editingProduct ? 'Modifier le Produit' : 'Créer le Produit'}
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
