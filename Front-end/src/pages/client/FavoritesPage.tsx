import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Trash2, 
  ShoppingCart, 
  Star, 
  Package,
  Search,
  Filter,
  MapPin,
  Clock,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
// Removed mock data import - using real data from stores
import { useNavigate } from 'react-router-dom';

export const FavoritesPage = () => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
      setFilteredFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    // Filter favorites based on search and category
    let filtered = favorites;

    if (searchTerm) {
      filtered = filtered.filter(favId => {
        const product = dishes.find(p => p.id === favId);
        return product && (
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(favId => {
        const product = dishes.find(p => p.id === favId);
        return product && product.categoryId === categoryFilter;
      });
    }

    setFilteredFavorites(filtered);
  }, [favorites, searchTerm, categoryFilter]);

  const toggleFavorite = (productId: string) => {
    const newFavorites = favorites.includes(productId)
      ? favorites.filter(id => id !== productId)
      : [...favorites, productId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const removeFavorite = (productId: string) => {
    const newFavorites = favorites.filter(id => id !== productId);
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const addToCart = (productId: string) => {
    addItem(productId, 1);
  };

  const getProductDetails = (productId: string) => {
    return dishes.find(dish => dish.id === productId);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Catégorie inconnue';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || 'bg-gray-500';
  };

  const categories = mockCategories;

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <Heart className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">Aucun Favori</h1>
          <p className="text-muted-foreground mb-8">
            Vous n'avez pas encore ajouté de produits à vos favoris.
            Découvrez notre menu et ajoutez vos plats préférés !
          </p>
          <Button onClick={() => navigate('/')} className="btn-primary">
            Découvrir le Menu
          </Button>
        </motion.div>
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
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Mes Favoris</h1>
          <p className="text-muted-foreground">
            {favorites.length} produit{favorites.length > 1 ? 's' : ''} dans vos favoris
          </p>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-gradient">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher dans vos favoris..."
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
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((productId, index) => {
            const product = getProductDetails(productId);
            if (!product) return null;

            return (
              <motion.div
                key={productId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="card-gradient hover-scale h-full group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="outline" 
                            className={`${getCategoryColor(product.categoryId)}/10 border-${getCategoryColor(product.categoryId)}/20`}
                          >
                            {getCategoryName(product.categoryId)}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={product.isAvailable 
                              ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                              : 'bg-red-500/10 border-red-500/20 text-red-500'
                            }
                          >
                            {product.isAvailable ? 'Disponible' : 'Indisponible'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFavorite(productId)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Product Image */}
                    <div className="aspect-square bg-muted/20 rounded-lg overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
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
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{product.rating}</span>
                          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {product.price.toLocaleString()} DA
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Stock: {product.stock}
                          </p>
                        </div>
                      </div>

                      {/* Allergens */}
                      {product.allergens && product.allergens.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Allergènes:</p>
                          <div className="flex flex-wrap gap-1">
                            {product.allergens.map((allergen, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {allergen}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/20">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/branch/${product.branchId}/menu`)}
                        className="hover:bg-muted/20"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                      
                      <Button
                        onClick={() => addToCart(productId)}
                        className="btn-primary"
                        disabled={!product.isAvailable}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State for Filtered Results */}
        {filteredFavorites.length === 0 && favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Aucun produit trouvé dans vos favoris avec ces critères de recherche.
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
                    onClick={() => navigate('/')}
                    className="hover:bg-muted/20"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Découvrir Plus de Produits
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFavorites([]);
                      localStorage.removeItem('favorites');
                    }}
                    className="hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Vider Tous les Favoris
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
