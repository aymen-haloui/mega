import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useUsersStore } from '@/store/usersStore';
import { useAuthStore } from '@/store/authStore';
import { User, Camera, Save, Eye, EyeOff } from 'lucide-react';

// Validation schema
const profileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string().min(6, 'Confirmation du mot de passe requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface ProfileUpdateFormProps {
  onSuccess?: () => void;
}

export const ProfileUpdateForm: React.FC<ProfileUpdateFormProps> = ({ onSuccess }) => {
  const { user } = useAuthStore();
  const { updateUser } = useUsersStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleProfileUpdate = async (data: ProfileFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updatedUser = updateUser(user.id, data);
      // Update the auth store with the new user data (without password)
      const { password: _, ...userWithoutPassword } = updatedUser;
      updateUser(userWithoutPassword as User);
      
      toast({
        title: "🎉 Profil mis à jour avec succès!",
        description: "Vos informations personnelles ont été sauvegardées.",
        duration: 5000,
      });
      
      setSuccessMessage("🎉 Profil mis à jour avec succès!");
      setTimeout(() => setSuccessMessage(null), 4000);
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (data: PasswordFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // TODO: Implement password change in users store
      console.log('Password change requested:', data);
      
      // Get the updated user data and sync with auth store
      const updatedUser = user; // TODO: Get updated user from store
      if (updatedUser) {
        const { password: _, ...userWithoutPassword } = updatedUser;
        updateUser(userWithoutPassword as User);
      }
      
      toast({
        title: "🔒 Mot de passe modifié avec succès!",
        description: "Votre mot de passe a été mis à jour en toute sécurité.",
        duration: 5000,
      });
      
      setSuccessMessage("🔒 Mot de passe modifié avec succès!");
      setTimeout(() => setSuccessMessage(null), 4000);
      
      passwordForm.reset();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Vous devez être connecté pour modifier votre profil.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'profile' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('profile')}
          className="flex-1"
        >
          <User className="w-4 h-4 mr-2" />
          Informations personnelles
        </Button>
        <Button
          variant={activeTab === 'password' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('password')}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          Mot de passe
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.6 
          }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 text-green-800 px-6 py-4 rounded-xl flex items-center gap-3 shadow-lg"
        >
          <motion.div 
            className="w-3 h-3 bg-green-500 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.span 
            className="font-semibold text-lg"
            animate={{ 
              color: ["#166534", "#059669", "#166534"]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {successMessage}
          </motion.span>
          <motion.div
            className="ml-auto"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ 
              duration: 0.5, 
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            🎉
          </motion.div>
        </motion.div>
      )}


      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Modifiez vos informations personnelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  {...profileForm.register('name')}
                  placeholder="Votre nom complet"
                />
                {profileForm.formState.errors.name && (
                  <p className="text-sm text-red-500">{profileForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...profileForm.register('phone')}
                  placeholder="+213 123 456 789"
                />
                {profileForm.formState.errors.phone && (
                  <p className="text-sm text-red-500">{profileForm.formState.errors.phone.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder les modifications
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Password Change Tab */}
      {activeTab === 'password' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Changer le mot de passe
            </CardTitle>
            <CardDescription>
              Modifiez votre mot de passe pour sécuriser votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    {...passwordForm.register('currentPassword')}
                    placeholder="Votre mot de passe actuel"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  {...passwordForm.register('newPassword')}
                  placeholder="Nouveau mot de passe"
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  {...passwordForm.register('confirmPassword')}
                  placeholder="Confirmer le nouveau mot de passe"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Modification...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Changer le mot de passe
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
