import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Settings, 
  Building2,
  Package,
  LogOut,
  History,
  MessageSquare,
  Tag,
  Bell,
  ChefHat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MegaPizzaLogo } from '@/components/ui/MegaPizzaLogo';
import { useAuthStore } from '@/store/authStore';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const getNavItems = () => {
    if (user?.role === 'ADMIN') {
      return [
        { name: 'Dashboard', href: '/general/dashboard', icon: LayoutDashboard },
        { name: 'Branches', href: '/general/branches', icon: Building2 },
        { name: 'Utilisateurs', href: '/general/users', icon: Users },
        { name: 'Commandes', href: '/general/orders', icon: ShoppingCart },
        { name: 'Produits', href: '/general/products', icon: Package },
        { name: 'Catégories', href: '/general/categories', icon: Tag },
        { name: 'Ingrédients', href: '/general/ingredients', icon: ChefHat },
        { name: 'Avis', href: '/general/reviews', icon: MessageSquare },
        { name: 'Notifications', href: '/general/notifications', icon: Bell },
        { name: 'Journal Audit', href: '/general/audit', icon: History },
      ];
    } else if (user?.role === 'BRANCH_USER') {
      return [
        { name: 'Dashboard', href: '/branch/dashboard', icon: LayoutDashboard },
        { name: 'Commandes', href: '/branch/orders', icon: ShoppingCart },
        { name: 'Produits', href: '/branch/products', icon: Package },
        { name: 'Ingrédients', href: '/branch/ingredients', icon: ChefHat },
        { name: 'Paramètres', href: '/branch/settings', icon: Settings },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="sidebar-static bg-card border-r border-border transition-all duration-300 overflow-hidden w-64"
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-center border-b border-border px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-3"
          >
            <MegaPizzaLogo size="md" animate={true} />
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mega Pizza
            </span>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-glow-primary'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className={`h-5 w-5 ${
                  isActive ? 'text-primary-foreground' : 'text-foreground/70 group-hover:text-foreground'
                }`} />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {item.name}
                </motion.span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.phone}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role === 'ADMIN' ? 'Admin Général' : 'Admin Branche'}
              </p>
            </motion.div>
          </div>
          
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="mt-3 w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
