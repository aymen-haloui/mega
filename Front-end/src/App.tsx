import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useCartSync } from '@/hooks/useCartSync';
import { Toaster } from '@/components/ui/toaster';
import { FloatingCartButton } from '@/components/ui/floating-cart-button';

// Layout Components
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';

// Client Pages
import { HomePage } from '@/pages/client/HomePage';
import { BranchMenuPage } from '@/pages/client/BranchMenuPage';
import { CartPage } from '@/pages/client/CartPage';
import { OrdersPage } from '@/pages/client/OrdersPage';
import { TraceOrderPage } from '@/pages/client/TraceOrderPage';
import { FavoritesPage } from '@/pages/client/FavoritesPage';
import { AboutPage } from '@/pages/client/AboutPage';
import { ProfilePage } from '@/pages/client/ProfilePage';

// Branch Admin Pages
import { BranchDashboardPage } from '@/pages/branch/BranchDashboardPage';
import { BranchOrdersPage } from '@/pages/branch/BranchOrdersPage';
import { BranchProductsPage } from '@/pages/branch/BranchProductsPage';
import { BranchIngredientsPage } from '@/pages/branch/BranchIngredientsPage';
import { BranchSettingsPage } from '@/pages/branch/BranchSettingsPage';

// General Admin Pages
import { GeneralDashboardPage } from '@/pages/general/GeneralDashboardPage';
import BranchesManagement from '@/pages/general/BranchesManagement';
import { GeneralUsersPage } from '@/pages/general/GeneralUsersPage';
import { GeneralOrdersPage } from '@/pages/general/GeneralOrdersPage';
import { GeneralProductsPage } from '@/pages/general/GeneralProductsPage';
import { AuditLogPage } from '@/pages/general/AuditLogPage';
import { ReviewsPage } from '@/pages/general/ReviewsPage';
import { CategoriesPage } from '@/pages/general/CategoriesPage';
import { NotificationsPage } from '@/pages/general/NotificationsPage';
import { IngredientsPage } from '@/pages/general/IngredientsPage';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Page Transition Component
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

function App() {
  const { user, isAuthenticated } = useAuthStore();
  
  // Sync cart with user authentication
  useCartSync();

  // Auto-logout admin users from public pages
  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'BRANCH_USER')) {
      const currentPath = window.location.pathname;
      const publicPaths = ['/', '/favorites', '/about'];
      
      if (publicPaths.includes(currentPath)) {
        // Redirect admin users to their dashboard
        const redirectPath = user.role === 'ADMIN' ? '/general/dashboard' : '/branch/dashboard';
        window.location.href = redirectPath;
      }
    }
  }, [user]);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="min-h-screen bg-background text-foreground">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Auth Routes */}
            <Route 
              path="/auth/login" 
              element={
                <PageTransition>
                  <LoginPage />
                </PageTransition>
              } 
            />
            
            

            {/* Public Routes - Only for clients and non-authenticated users */}
            <Route 
              path="/" 
              element={
                <PageTransition>
                  <Navbar />
                  <HomePage />
                  <Footer />
                  <FloatingCartButton />
                </PageTransition>
              } 
            />
            
            <Route 
              path="/favorites" 
              element={
                <PageTransition>
                  <Navbar />
                  <FavoritesPage />
                  <Footer />
                  <FloatingCartButton />
                </PageTransition>
              } 
            />
            
            <Route 
              path="/about" 
              element={
                <PageTransition>
                  <Navbar />
                  <AboutPage />
                  <Footer />
                  <FloatingCartButton />
                </PageTransition>
              } 
            />

            {/* Client Routes - No authentication required */}
            <Route 
              path="/branch/:branchId/menu" 
              element={
                <PageTransition>
                  <Navbar />
                  <BranchMenuPage />
                  <Footer />
                  <FloatingCartButton />
                </PageTransition>
              } 
            />
            
            <Route 
              path="/cart" 
              element={
                <PageTransition>
                  <Navbar />
                  <CartPage />
                  <Footer />
                  <FloatingCartButton />
                </PageTransition>
              } 
            />
            
            <Route 
              path="/orders" 
              element={
                <PageTransition>
                  <Navbar />
                  <OrdersPage />
                  <Footer />
                  <FloatingCartButton />
                </PageTransition>
              } 
            />
            
            <Route 
              path="/order/:orderId" 
              element={
                <PageTransition>
                  <Navbar />
                  <TraceOrderPage />
                  <Footer />
                  <FloatingCartButton />
                </PageTransition>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute allowedRoles={['CLIENT', 'ADMIN', 'BRANCH_USER']}>
                  <PageTransition>
                    <Navbar />
                    <ProfilePage />
                    <Footer />
                    <FloatingCartButton />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />

            {/* Branch Admin Routes */}
            <Route 
              path="/branch/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['BRANCH_USER']}>
                  <PageTransition>
                    <Sidebar />
                    <BranchDashboardPage />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/branch/orders" 
              element={
                <ProtectedRoute allowedRoles={['BRANCH_USER']}>
                  <PageTransition>
                    <Sidebar />
                    <BranchOrdersPage />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/branch/products" 
              element={
                <ProtectedRoute allowedRoles={['BRANCH_USER']}>
                  <PageTransition>
                    <Sidebar />
                    <BranchProductsPage />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/branch/ingredients" 
              element={
                <ProtectedRoute allowedRoles={['BRANCH_USER']}>
                  <PageTransition>
                    <Sidebar />
                    <BranchIngredientsPage />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/branch/settings" 
              element={
                <ProtectedRoute allowedRoles={['BRANCH_USER']}>
                  <PageTransition>
                    <Sidebar />
                    <BranchSettingsPage />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />

            {/* General Admin Routes */}
            <Route 
              path="/general/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <PageTransition>
                    <Sidebar />
                    <GeneralDashboardPage />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/general/branches" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <PageTransition>
                    <Sidebar />
                    <BranchesManagement />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/general/users" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <PageTransition>
                    <Sidebar />
                    <GeneralUsersPage />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/general/orders" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <PageTransition>
                    <Sidebar />
                    <GeneralOrdersPage />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/general/products" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <PageTransition>
                    <Sidebar />
                    <GeneralProductsPage />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/general/audit" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <PageTransition>
                    <Sidebar />
                    <AuditLogPage />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/general/reviews" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <PageTransition>
                    <Sidebar />
                    <ReviewsPage />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/general/categories" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <PageTransition>
                    <Sidebar />
                    <CategoriesPage />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/general/notifications" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <PageTransition>
                    <Sidebar />
                    <NotificationsPage />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/general/ingredients" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <PageTransition>
                    <Sidebar />
                    <IngredientsPage />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
      <Toaster />
    </Router>
  );
}

export default App;
