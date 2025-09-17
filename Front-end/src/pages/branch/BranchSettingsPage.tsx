import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Building2, 
  Save,
  Edit,
  Camera
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { useAuthStore } from '@/store/authStore';
import { useBranchesStore } from '@/store/branchesStore';
// Removed mock data import - using real data from stores
import { Branch as BranchType } from '@/types';
import { toast } from '@/hooks/use-toast';

export const BranchSettingsPage = () => {
  const { user } = useAuthStore();
  const { branches, update: updateBranch, getById } = useBranchesStore();
  const [branch, setBranch] = useState<BranchType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBranch, setEditedBranch] = useState<Partial<BranchType>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.branchId) {
      const currentBranch = getById(user.branchId);
      if (currentBranch) {
        setBranch(currentBranch);
        setEditedBranch(currentBranch);
      }
    } else if (user?.role === 'branchAdmin') {
      // If branch admin doesn't have a branchId, create a new branch
      const newBranch: BranchType = {
        id: `branch-${user.id}`,
        name: `${user.name}'s Restaurant`,
        city: 'Alger',
        address: 'Adresse à définir',
        phone: '+213 XX XX XX XX',
        contactPhone: user.phone,
        openTime: '08:00',
        closeTime: '22:00',
        lat: 36.7538,
        lng: 3.0588,
        isActive: true,
        adminId: user.id,
        createdAt: new Date().toISOString(),
      };
      setBranch(newBranch);
      setEditedBranch(newBranch);
      setIsEditing(true); // Start in editing mode for new branches
    }
  }, [user, branches, getById]);

  const handleSave = async () => {
    if (!branch || !editedBranch) return;
    
    setIsSaving(true);
    try {
      // Update the branch using the branches service
      const updatedBranch = updateBranch(branch.id, editedBranch);
      
      // Update local state
      setBranch(updatedBranch);
      setEditedBranch(updatedBranch);
      setIsEditing(false);
      
      // Show success message
      toast({
        title: "Modifications sauvegardées",
        description: "Les paramètres de votre branche ont été mis à jour avec succès.",
      });
      
    } catch (error) {
      console.error('Error updating branch:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (branch) {
      setEditedBranch(branch);
      setIsEditing(false);
    }
  };



  const createNewBranch = async () => {
    if (user?.role === 'branchAdmin') {
      setIsSaving(true);
      try {
        const { create } = useBranchesStore.getState();
        const newBranch = create({
          name: `${user.name}'s Restaurant`,
          city: 'Alger',
          address: 'Adresse à définir',
          phone: '+213 XX XX XX XX',
          contactPhone: user.phone,
          openTime: '08:00',
          closeTime: '22:00',
          lat: 36.7538,
          lng: 3.0588,
          isActive: true,
        });
        
        setBranch(newBranch);
        setEditedBranch(newBranch);
        setIsEditing(true);
        
        toast({
          title: "Branche créée",
          description: "Votre nouvelle branche a été créée avec succès.",
        });
      } catch (error) {
        console.error('Error creating branch:', error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la création de la branche.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (!branch) {
    return (
      <div className="ml-64 p-8">
        <div className="text-center max-w-md mx-auto space-y-6">
          <Settings className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Branche non trouvée</h2>
          <p className="text-muted-foreground mb-4">
            {user?.role === 'branchAdmin' 
              ? "Votre compte d'administrateur de branche n'est pas encore configuré."
              : "Vous n'avez pas accès à cette page."
            }
          </p>
          
          
          {user?.role === 'branchAdmin' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Vous pouvez créer votre branche maintenant ou contacter l'administrateur général.
              </p>
              <Button 
                onClick={createNewBranch} 
                className="btn-primary"
                disabled={isSaving}
              >
                <Building2 className="h-4 w-4 mr-2" />
                {isSaving ? 'Création...' : 'Créer ma Branche'}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Paramètres de la Branche</h1>
          <p className="text-muted-foreground">
            {branch.id?.startsWith('branch-') 
              ? "Configurez votre nouveau restaurant"
              : "Configurez les paramètres de votre restaurant"
            }
          </p>
          {branch.id?.startsWith('branch-') && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-sm text-blue-600">
                🆕 Vous créez une nouvelle branche. Remplissez les informations ci-dessous et sauvegardez.
              </p>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button onClick={handleCancel} variant="outline">
                Annuler
              </Button>
              <Button 
                onClick={handleSave} 
                className="btn-primary"
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="btn-primary">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
        </div>
      </motion.div>


      {/* Branch Photo Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-primary" />
              <span>Photo du Restaurant</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoUpload
              currentImage={isEditing ? editedBranch.image : branch.image}
              onImageChange={(imageUrl) => {
                if (isEditing) {
                  setEditedBranch({ ...editedBranch, image: imageUrl || undefined });
                }
              }}
              maxSize={10}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Cette photo sera visible par les clients dans la section "Nos Restaurants"
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Branch Information - Simple Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span>Informations de la Branche</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Nom de la Branche</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedBranch.name || ''}
                      onChange={(e) => setEditedBranch({ ...editedBranch, name: e.target.value })}
                      className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Nom du restaurant"
                    />
                  ) : (
                    <p className="text-foreground font-medium">{branch.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Ville</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedBranch.city || ''}
                      onChange={(e) => setEditedBranch({ ...editedBranch, city: e.target.value })}
                      className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Ville"
                    />
                  ) : (
                    <p className="text-foreground">{branch.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Adresse</label>
                  {isEditing ? (
                    <textarea
                      value={editedBranch.address || ''}
                      onChange={(e) => setEditedBranch({ ...editedBranch, address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Adresse complète"
                    />
                  ) : (
                    <p className="text-foreground">{branch.address}</p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedBranch.phone || ''}
                      onChange={(e) => setEditedBranch({ ...editedBranch, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="+213 XX XX XX XX"
                    />
                  ) : (
                    <p className="text-foreground">{branch.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedBranch.email || ''}
                      onChange={(e) => setEditedBranch({ ...editedBranch, email: e.target.value })}
                      className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  ) : (
                    <p className="text-foreground">{branch.email || 'Non spécifié'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Horaires d'Ouverture</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={editedBranch.openTime || ''}
                        onChange={(e) => setEditedBranch({ ...editedBranch, openTime: e.target.value })}
                        className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <input
                        type="time"
                        value={editedBranch.closeTime || ''}
                        onChange={(e) => setEditedBranch({ ...editedBranch, closeTime: e.target.value })}
                        className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <p className="text-foreground">{branch.openTime} - {branch.closeTime}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
};