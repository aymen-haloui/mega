// Mega Pizza - Navigation Bar

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Bell,
  MapPin,
  Phone,
  LogOut,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MegaPizzaLogo } from '@/components/ui/MegaPizzaLogo';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const { user, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const { notifications, getUnreadCount } = useUIStore();
  
  const cartItemsCount = getItemCount();
  const unreadNotifications = getUnreadCount();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  // Hide navbar completely for admin users
  if (user?.role === 'ADMIN' || user?.role === 'BRANCH_USER') {
    return null;
  }

  const navItems = [
    { name: 'Accueil', href: '/', icon: MapPin },
    { name: 'Favoris', href: '/favorites', icon: Heart },
    { name: 'À propos', href: '/about', icon: Phone },
  ];

  // Add client-specific navigation items
  if (user?.role === 'client') {
    navItems.push(
      { name: 'Mes Commandes', href: '/orders', icon: ShoppingCart }
    );
  }

 


  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <MegaPizzaLogo size="md" animate={true} />
          <span className="font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Mega Pizza
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="flex items-center space-x-2 text-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-105 px-3 py-2 rounded-lg hover:bg-primary/10"
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-all duration-300">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-bounce-subtle"
                    >
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notification) => (
                    <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-4">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-muted-foreground">{notification.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>
                    Aucune notification
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Cart */}
          {user?.role === 'client' && cartItemsCount > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-primary/10 transition-all duration-300"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs glow-primary"
              >
                {cartItemsCount}
              </Badge>
            </Button>
          )}

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                {user.role === 'client' && (
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Mes Commandes
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="space-x-2">
              <Button variant="ghost" onClick={() => navigate('/auth/login')}>
                Connexion
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur"
        >
          <div className="container py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};