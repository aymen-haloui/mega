import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Star, 
  ShoppingCart,
  ArrowRight,
  Utensils,
  Users,
  Award,
  Truck,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MegaPizzaLogo } from '@/components/ui/MegaPizzaLogo';
import { LogoBackground } from '@/components/ui/LogoBackground';
import { CompactCartCard } from '@/components/ui/compact-cart-card';
import { useAuthStore } from '@/store/authStore';
import { useBranchesStore } from '@/store/branchesStore';

export const HomePage = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestBranch, setNearestBranch] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { branches, load, getActive } = useBranchesStore();
  
  // Load branches on component mount
  useEffect(() => {
    load();
  }, [load]);

  
  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get user location and find nearest branch
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userCoords);

          // Find nearest branch
          if (branches.length > 0) {
            let closest = branches[0];
            let minDistance = calculateDistance(
              userCoords.lat, userCoords.lng, 
              closest.lat, closest.lng
            );

            branches.forEach(branch => {
            const distance = calculateDistance(
              userCoords.lat, userCoords.lng,
              branch.lat, branch.lng
            );
            if (distance < minDistance) {
              minDistance = distance;
              closest = branch;
            }
            });

            setNearestBranch(closest);
          }
        },
        () => {
          // Default to first branch if location is denied
          if (branches.length > 0) {
            setNearestBranch(branches[0]);
          }
        }
      );
    } else {
      if (branches.length > 0) {
        setNearestBranch(branches[0]);
      }
    }
  }, [branches]);

  const stats = [
    { icon: Utensils, label: 'Plats Disponibles', value: '150+' },
    { icon: Users, label: 'Clients Satisfaits', value: '10k+' },
    { icon: Award, label: 'Années d\'Expérience', value: '25+' },
    { icon: Truck, label: 'Livraisons/Jour', value: '500+' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-muted/20" />
        <LogoBackground intensity="low" speed="slow" />
        
        <div className="relative z-10 container mx-auto px-4 text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center"
            >
              <MegaPizzaLogo size="xl" animate={true} />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-glow">
                Mega Pizza
              </span>
              <br />
              <span className="text-foreground">Hub</span>
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Découvrez les meilleures pizzas et spécialités italiennes. 
              <br />
              Cuisine authentique et moderne, livrée avec passion.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            {user?.role === 'client' ? (
              <>
                <Button size="lg" className="btn-primary text-lg px-10 py-6 h-14 font-semibold" onClick={() => navigate('/')}>
                  <MapPin className="mr-2 h-5 w-5" />
                  Voir les Restaurants
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-10 py-6 h-14 font-semibold border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300" onClick={() => navigate('/cart')}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Mon Panier
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" className="btn-primary text-lg px-10 py-6 h-14 font-semibold" onClick={() => navigate('/auth/login')}>
                  Commencer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-10 py-6 h-14 font-semibold border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300" onClick={() => navigate('/auth/login')}>
                  Créer un Compte
                </Button>
              </>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center space-y-3 p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/20 hover:border-primary/30 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <stat.icon className="h-10 w-10 mx-auto text-accent animate-bounce-subtle" />
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Floating elements */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-primary rounded-full opacity-20"
        />
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-1/4 w-12 h-12 bg-gradient-accent rounded-full opacity-20"
        />
      </section>

      {/* Actions Rapides Section */}
      <section className="relative py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Actions Rapides</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Accédez rapidement à vos fonctionnalités favorites
              </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Cart Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <CompactCartCard />
              </motion.div>

              {/* Favorites Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Card className="card-gradient border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl cursor-pointer group"
                      onClick={() => navigate('/favorites')}>
                  <CardContent className="p-6 text-center">
                    <motion.div
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Heart className="h-8 w-8 text-pink-500" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2">Mes Favoris</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Retrouvez vos plats préférés
                    </p>
                    <Badge variant="secondary" className="text-sm">
                      0 favoris
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Other Branches Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <Card className="card-gradient border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl cursor-pointer group"
                      onClick={() => navigate('/branches')}>
                  <CardContent className="p-6 text-center">
                    <motion.div
                      className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MapPin className="h-8 w-8 text-blue-500" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-2">Autres Branches</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Découvrez nos autres restaurants
                    </p>
                    <Badge variant="secondary" className="text-sm">
                      {getActive().length} restaurants
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Branches Map Section */}
      <section className="relative py-24 bg-muted/20">
        <LogoBackground intensity="medium" speed="medium" />
        <div className="relative z-10 container mx-auto px-4 space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-6"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">Nos Restaurants</h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Trouvez le restaurant Mega Pizza le plus proche de vous
            </p>
          </motion.div>


          {/* All Restaurants Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          >
            {getActive()
              .filter((branch, index, self) => 
                index === self.findIndex(b => b.id === branch.id)
              )
              .map((branch, index) => (
              <motion.div
                          key={branch.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card 
                  className="overflow-hidden card-gradient hover-scale cursor-pointer"
                          onClick={() => navigate(`/branch/${branch.id}/menu`)}
                        >
                  <div className="relative h-48 overflow-hidden">
                    {branch.image ? (
                      <img
                        src={branch.image}
                        alt={branch.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Utensils className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4">
                      <Badge 
                        variant="secondary" 
                        className="bg-white/90 text-black hover:bg-white"
                      >
                        {branch.city}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1">{branch.name}</h3>
                      <div className="flex items-center space-x-4 text-white/90 text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                            <span>{branch.openTime} - {branch.closeTime}</span>
                          </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>4.8</span>
                        </div>
                    </div>
                  </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{branch.address}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{branch.phone}</span>
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/branch/${branch.id}/menu`);
                        }}
                      >
                        Voir le Menu
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                </div>
              </CardContent>
            </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Nearest Branch Highlight */}
          {nearestBranch && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Card className="max-w-md mx-auto card-gradient glow-accent">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <MapPin className="h-5 w-5 text-accent" />
                    <span>Restaurant le Plus Proche</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="text-xl font-semibold">{nearestBranch.name}</h3>
                  <p className="text-muted-foreground">{nearestBranch.address}</p>
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{nearestBranch.openTime} - {nearestBranch.closeTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{nearestBranch.phone}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full btn-primary"
                    onClick={() => navigate(`/branch/${nearestBranch.id}/menu`)}
                  >
                    Commander Maintenant
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>

    </div>
  );
};
