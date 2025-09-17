import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Building2, 
  Users, 
  ShoppingCart, 
  Package, 
  Settings,
  Menu,
  X,
  LogOut,
  Crown,
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MegaPizzaLogo } from '@/components/ui/MegaPizzaLogo';
import { useAuthStore } from '@/store/authStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const generalAdminLinks = [
    { icon: BarChart3, label: 'Dashboard', path: '/general/dashboard' },
    { icon: Building2, label: 'Branches', path: '/general/branches' },
    { icon: Users, label: 'Utilisateurs', path: '/general/users' },
    { icon: ShoppingCart, label: 'Commandes', path: '/general/orders' },
    { icon: Package, label: 'Produits', path: '/general/products' },
  ];

  const branchAdminLinks = [
    { icon: BarChart3, label: 'Dashboard', path: '/branch/dashboard' },
    { icon: ShoppingCart, label: 'Commandes', path: '/branch/orders' },
    { icon: Package, label: 'Produits', path: '/branch/products' },
    { icon: Settings, label: 'Paramètres', path: '/branch/settings' },
  ];

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  const links = user.role === 'ADMIN' ? generalAdminLinks : branchAdminLinks;

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="bg-gradient-to-b from-gray-900 to-black border-r border-red-500/20 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-red-500/20">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between w-full"
              >
                <MegaPizzaLogo size="md" animate={true} />
                <div className="text-right">
                  <h1 className="text-white font-bold text-sm">Mega Pizza</h1>
                  <p className="text-xs text-gray-400">
                    {user?.role === 'ADMIN' ? 'Admin Général' : 'Admin Restaurant'}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="flex justify-center">
                <MegaPizzaLogo size="md" animate={true} />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white hover:bg-red-500/10"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-red-500/20">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-red-500/30">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-red-500 text-white">
                {user?.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-w-0 flex-1"
              >
                <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                <p className="text-gray-400 text-xs truncate">{user?.phone}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                        : 'text-gray-400 hover:text-white hover:bg-red-500/10'
                    }`
                  }
                >
                  <link.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm font-medium"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-red-500/20">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {sidebarOpen && 'Déconnexion'}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};