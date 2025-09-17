import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Utensils, 
  Search, 
  Filter,
  ShoppingCart,
  Heart,
  Star,
  Package,
  MapPin,
  Clock,
  Phone,
  Mail,
  Plus,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useBranchesStore } from '@/store/branchesStore';
import { useDishesStore } from '@/store/dishesStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import { Dish as DishType, Branch } from '@/types';

export const BranchMenuPage = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const { addItem, items } = useCartStore();
  const { branches, load: loadBranches } = useBranchesStore();
  const { dishes, load: loadDishes, isDishAvailable } = useDishesStore();
  const { categories, load: loadCategories } = useCategoriesStore();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [filteredDishes, setFilteredDishes] = useState<DishType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyAddedToCart, setRecentlyAddedToCart] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load data from stores
    loadBranches();
    loadDishes();
    loadCategories();
  }, [loadBranches, loadDishes, loadCategories]);

  useEffect(() => {
    // Load branch and dishes
    if (branchId) {
      const currentBranch = branches.find(b => b.id === branchId);
      const branchDishes = dishes.filter(d => d.menu.branchId === branchId);
      
      setBranch(currentBranch);
      setFilteredDishes(branchDishes);
    }

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, [branchId, branches, dishes]);

  useEffect(() => {
    // Filter and sort dishes
    let filtered = dishes.filter(d => d.menu.branchId === branchId);

    if (searchTerm) {
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dish.description && dish.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(dish => 
        (dish.category || dish.categoryId) === categoryFilter
      );
    }

    // Sort dishes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return a.priceCents - b.priceCents;
        case 'price-high':
          return b.priceCents - a.priceCents;
        default:
          return 0;
      }
    });

    setFilteredDishes(filtered);
  }, [dishes, branchId, searchTerm, sortBy, categoryFilter]);

  const toggleFavorite = (productId: string) => {
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const addToCart = (dish: DishType) => {
    addItem(dish, 1);
    
    // Mark as recently added for animation
    setRecentlyAddedToCart(prev => new Set([...prev, dish.id]));
    
    // Remove from recently added after animation completes
    setTimeout(() => {
      setRecentlyAddedToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(dish.id);
        return newSet;
      });
    }, 1500);
  };

  const testDishAvailability = () => {
    console.log('=== TESTING DISH AVAILABILITY ===');
    const storedIngredients = localStorage.getItem('ingredients');
    const storedDishes = localStorage.getItem('mockDishes');
    
    console.log('Ingredients:', storedIngredients ? JSON.parse(storedIngredients) : 'None');
    console.log('Dishes:', storedDishes ? JSON.parse(storedDishes) : 'None');
    
    // Test each dish
    filteredDishes.forEach(dish => {
      const available = isDishAvailable(dish, branchId);
      console.log(`Dish: ${dish.name} - Available: ${available}`, {
        dishAvailable: dish.available,
        branchId,
        ingredients: dish.ingredients?.map(ing => ({
          id: ing.ingredientId,
          name: ing.ingredient?.name,
          required: ing.required
        }))
      });
    });
  };

  const getCategoryName = (categoryId: string) => {
    // Find category from admin categories
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      return category.name;
    }
    
    // Fallback mapping for backward compatibility
    const categoryMap: { [key: string]: string } = {
      'pizza': 'Pizza',
      'pasta': 'Pâtes',
      'salad': 'Salades',
      'drink': 'Boissons',
      'dessert': 'Desserts',
    };
    return categoryMap[categoryId] || 'Autre';
  };

  const getCategoryColor = (categoryId: string) => {
    // Find category from admin categories
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      // Convert hex color to Tailwind class
      const colorMap: { [key: string]: string } = {
        '#FF6B6B': 'bg-red-500',
        '#4ECDC4': 'bg-teal-500',
        '#45B7D1': 'bg-blue-500',
        '#96CEB4': 'bg-green-500',
        '#FFEAA7': 'bg-yellow-500',
        '#DDA0DD': 'bg-purple-500',
      };
      return colorMap[category.color] || 'bg-gray-500';
    }
    
    // Fallback color mapping for backward compatibility
    const colorMap: { [key: string]: string } = {
      'pizza': 'bg-red-500',
      'pasta': 'bg-orange-500',
      'salad': 'bg-green-500',
      'drink': 'bg-blue-500',
      'dessert': 'bg-purple-500',
    };
    return colorMap[categoryId] || 'bg-gray-500';
  };

  const getCartItemQuantity = (dishId: string) => {
    const item = items.find(item => item.dishId === dishId);
    return item ? item.quantity : 0;
  };

  // Use all categories from admin instead of just available ones from current branch
  const availableCategories = categories.length > 0 ? categories : [
    { id: 'pizza', name: 'Pizza', icon: '🍕' },
    { id: 'pasta', name: 'Pâtes', icon: '🍝' },
    { id: 'salad', name: 'Salades', icon: '🥗' },
    { id: 'drink', name: 'Boissons', icon: '🥤' },
    { id: 'dessert', name: 'Desserts', icon: '🍰' },
    { id: 'other', name: 'Autres', icon: '🍽️' }
  ];

  if (!branch) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Utensils className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Branche non trouvée</p>
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
        {/* Branch Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">{branch.name}</h1>
            <div className="flex items-center justify-center space-x-6 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{branch.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>9h00 - 23h00</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+213 XXX XXX XXX</span>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="bg-green-500/10 border-green-500/20 text-green-500"
            >
              Ouvert
            </Badge>
            <Button
              onClick={testDishAvailability}
              variant="outline"
              size="sm"
              className="bg-blue-500/10 border-blue-500/20 text-blue-500 hover:bg-blue-500/20"
            >
              🧪 Test Availability
            </Button>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-gradient">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher dans le menu..."
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
                  <option key="all" value="all">Toutes les catégories</option>
                  {availableCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option key="name" value="name">Nom</option>
                  <option key="price-low" value="price-low">Prix croissant</option>
                  <option key="price-high" value="price-high">Prix décroissant</option>
                  <option key="rating" value="rating">Note</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish, index) => {
            const isFavorite = favorites.includes(dish.id);
            const cartQuantity = getCartItemQuantity(dish.id);
            const isRecentlyAdded = recentlyAddedToCart.has(dish.id);
            const dishIsAvailable = isDishAvailable(dish, branchId);

            return (
              <motion.div
                key={dish.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  ...(isRecentlyAdded && {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(34, 197, 94, 0)",
                      "0 0 0 10px rgba(34, 197, 94, 0.1)",
                      "0 0 0 0 rgba(34, 197, 94, 0)"
                    ]
                  })
                }}
                transition={{ 
                  delay: 0.2 + index * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  ...(isRecentlyAdded && {
                    scale: { duration: 0.6, ease: "easeInOut" },
                    boxShadow: { duration: 1.5, ease: "easeOut" }
                  })
                }}
                whileHover={{ 
                  scale: 1.02,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="card-gradient hover-scale h-full group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{dish.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="outline" 
                            className={`${getCategoryColor(dish.category || dish.categoryId)}/10 border-${getCategoryColor(dish.category || dish.categoryId)}/20`}
                          >
                            {getCategoryName(dish.category || dish.categoryId)}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={dishIsAvailable 
                              ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                              : 'bg-red-500/10 border-red-500/20 text-red-500'
                            }
                            title={!dishIsAvailable && dish.available ? 'Ingrédient expiré' : ''}
                          >
                            {dishIsAvailable ? 'Disponible' : 'Indisponible'}
                          </Badge>
                          {!dishIsAvailable && dish.available && (
                            <Badge 
                              variant="outline" 
                              className="bg-orange-500/10 border-orange-500/20 text-orange-500 text-xs"
                              title="Ce produit contient des ingrédients expirés"
                            >
                              ⚠️ Ingrédient expiré
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(dish.id)}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                          isFavorite ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </Button>
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
                      
                      {/* Ingredients Display */}
                      {dish.ingredients && dish.ingredients.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground flex items-center space-x-1">
                            <span>🥘</span>
                            <span>Ingrédients:</span>
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {dish.ingredients.slice(0, 3).map((ingredient, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="text-xs bg-primary/5 border-primary/20 text-primary"
                              >
                                {ingredient.ingredient?.name || `Ingredient ${ingredient.ingredientId}`}
                              </Badge>
                            ))}
                            {dish.ingredients.length > 3 && (
                              <Badge 
                                variant="outline" 
                                className="text-xs bg-muted/20 border-muted/30 text-muted-foreground"
                              >
                                +{dish.ingredients.length - 3} autres
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
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
                            15 min
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/20">
                      {cartQuantity > 0 ? (
                        <div className="flex items-center space-x-2">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToCart(dish)}
                            className="w-8 h-8 p-0"
                              disabled={!dishIsAvailable}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          </motion.div>
                          <motion.span 
                            className="w-8 text-center font-medium"
                            animate={isRecentlyAdded ? { 
                              scale: [1, 1.2, 1],
                              color: ["hsl(var(--foreground))", "hsl(var(--primary))", "hsl(var(--foreground))"]
                            } : {}}
                            transition={{ duration: 0.5 }}
                          >
                            {cartQuantity}
                          </motion.span>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToCart(dish)}
                            className="w-8 h-8 p-0"
                              disabled={!dishIsAvailable}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          </motion.div>
                        </div>
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={() => addToCart(dish)}
                            className={`btn-primary w-full ${isRecentlyAdded ? 'bg-green-500 hover:bg-green-600' : ''}`}
                            disabled={!dishIsAvailable}
                          >
                            <motion.div
                              animate={isRecentlyAdded ? { 
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                              } : {}}
                              transition={{ duration: 0.5 }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                            </motion.div>
                            {isRecentlyAdded ? 'Ajouté!' : 'Ajouter'}
                        </Button>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredDishes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Utensils className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Aucun produit trouvé avec ces critères de recherche.'
                : 'Aucun produit disponible dans cette branche.'
              }
            </p>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="card-gradient">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">Actions Rapides</h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/cart')}
                    className="hover:bg-muted/20"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Voir Mon Panier ({items.length})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/favorites')}
                    className="hover:bg-muted/20"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Mes Favoris ({favorites.length})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="hover:bg-muted/20"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Autres Branches
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};
