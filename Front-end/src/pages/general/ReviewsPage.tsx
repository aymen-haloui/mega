import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Search, 
  Filter,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  User,
  Phone,
  Trash2,
  Eye,
  TrendingUp,
  Award,
  Heart,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useReviewsStore } from '@/store/reviewsStore';
import { useDishesStore } from '@/store/dishesStore';
import { Review } from '@/types';

export const ReviewsPage = () => {
  const { reviews, load, loading, error, getReviewStats, deleteReview } = useReviewsStore();
  const { dishes } = useDishesStore();
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [dishFilter, setDishFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let filtered = reviews;

    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.userPhone.includes(searchTerm) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getDishName(review.dishId).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (ratingFilter !== 'all') {
      filtered = filtered.filter(review => review.rating.toString() === ratingFilter);
    }

    if (dishFilter !== 'all') {
      filtered = filtered.filter(review => review.dishId === dishFilter);
    }

    setFilteredReviews(filtered);
  }, [reviews, searchTerm, ratingFilter, dishFilter]);

  const getDishName = (dishId: string) => {
    const dish = dishes.find(d => d.id === dishId);
    return dish ? dish.name : 'Plat inconnu';
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-500/10 border-green-500/20 text-green-500';
    if (rating >= 3) return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500';
    return 'bg-red-500/10 border-red-500/20 text-red-500';
  };

  const getOverallStats = () => {
    if (reviews.length === 0) return { total: 0, average: 0, distribution: {} };
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = Math.round((sum / reviews.length) * 10) / 10;
    
    const distribution = reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as { [key: number]: number });

    return { total: reviews.length, average, distribution };
  };

  const overallStats = getOverallStats();

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      await deleteReview(reviewId);
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
          <h1 className="text-3xl font-bold text-foreground">Avis Clients</h1>
          <p className="text-muted-foreground">
            Gestion et analyse des avis clients sur les plats
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Avis', value: overallStats.total, icon: MessageSquare, color: 'text-primary' },
          { title: 'Note Moyenne', value: overallStats.average.toFixed(1), icon: Star, color: 'text-yellow-500' },
          { title: 'Avis Positifs', value: (overallStats.distribution[5] || 0) + (overallStats.distribution[4] || 0), icon: ThumbsUp, color: 'text-green-500' },
          { title: 'Avis Négatifs', value: (overallStats.distribution[1] || 0) + (overallStats.distribution[2] || 0), icon: ThumbsDown, color: 'text-red-500' }
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
                  placeholder="Rechercher dans les avis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Rating Filter */}
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Toutes les notes</option>
                <option value="5">5 étoiles</option>
                <option value="4">4 étoiles</option>
                <option value="3">3 étoiles</option>
                <option value="2">2 étoiles</option>
                <option value="1">1 étoile</option>
              </select>

              {/* Dish Filter */}
              <select
                value={dishFilter}
                onChange={(e) => setDishFilter(e.target.value)}
                className="px-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Tous les plats</option>
                {dishes.map(dish => (
                  <option key={dish.id} value={dish.id}>{dish.name}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reviews Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Liste des Avis ({filteredReviews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Client</th>
                    <th className="text-left py-3 px-4 font-medium">Plat</th>
                    <th className="text-left py-3 px-4 font-medium">Note</th>
                    <th className="text-left py-3 px-4 font-medium">Commentaire</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((review, index) => (
                    <motion.tr
                      key={review.id}
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
                            <p className="font-medium">{review.userName}</p>
                            <p className="text-sm text-muted-foreground">{review.userPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-muted-foreground">
                          {getDishName(review.dishId)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {getRatingStars(review.rating)}
                          </div>
                          <Badge 
                            variant="outline" 
                            className={getRatingColor(review.rating)}
                          >
                            {review.rating}/5
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {review.comment}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedReview(review)}
                            className="hover:bg-muted/20"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
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

            {filteredReviews.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun avis trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedReview(null)}
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
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span>Détails de l'Avis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {getRatingStars(selectedReview.rating)}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getRatingColor(selectedReview.rating)}
                  >
                    {selectedReview.rating}/5 étoiles
                  </Badge>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Plat</label>
                  <p className="mt-1 font-medium">{getDishName(selectedReview.dishId)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Commentaire</label>
                  <p className="mt-1 text-foreground">{selectedReview.comment}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Client</label>
                    <p className="mt-1">{selectedReview.userName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                    <p className="mt-1 font-mono text-sm">{selectedReview.userPhone}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="mt-1">{new Date(selectedReview.createdAt).toLocaleString('fr-FR')}</p>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-border/20">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedReview(null)}
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

