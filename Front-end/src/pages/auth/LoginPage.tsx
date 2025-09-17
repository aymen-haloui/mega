// Mega Pizza Hub - Login Page

import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Phone, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MegaPizzaLogo } from '@/components/ui/MegaPizzaLogo';
import { LogoBackground } from '@/components/ui/LogoBackground';
import { useAuthStore } from '@/store/authStore';

export const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login({ phone, password });
    
    if (result.success) {
        // Redirect based on role or returnUrl
      const user = useAuthStore.getState().user;
        if (returnUrl && returnUrl !== '/') {
          navigate(returnUrl);
        } else if (user?.role === 'ADMIN') {
        navigate('/general/dashboard');
        } else if (user?.role === 'BRANCH_USER') {
        navigate('/branch/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message || 'Erreur de connexion');
      }
    } catch (error: any) {
      setError(error.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { phone: '+213555000001', password: 'admin123', role: 'Admin Général' },
    { phone: '+213555000002', password: 'admin123', role: 'Admin Branche 1' },
    { phone: '+213555000003', password: 'admin123', role: 'Admin Branche 2' },
  ];

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-4">
      <LogoBackground intensity="low" speed="slow" />
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <MegaPizzaLogo size="lg" animate={true} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-4">
              Mega Pizza
            </h1>
            <p className="text-muted-foreground mt-2">Connexion à votre compte</p>
          </div>

          {/* Login Form */}
          <Card className="card-gradient">
            <CardHeader className="text-center">
              <CardTitle>Connexion</CardTitle>
              <CardDescription>
                Entrez vos identifiants pour accéder à votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="+213 5XX XX XX XX"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 bg-muted border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Accès réservé aux administrateurs et gestionnaires de succursales
                </p>
              </div>

              {/* Demo Accounts */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h3 className="text-sm font-medium text-center mb-3">
                  Comptes de démonstration
                </h3>
                <div className="space-y-2 text-xs">
                  {demoAccounts.map((account, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-muted-foreground">{account.role}:</span>
                      <span className="font-mono">{account.phone}</span>
                    </div>
                  ))}
                  <div className="text-center text-muted-foreground mt-2">
                    <div>Mot de passe: <span className="font-mono">admin123</span> (Tous les comptes)</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};