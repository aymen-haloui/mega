// Algeria Eats Hub - Branch Sync Demo Component

import { useBranchesStore } from '@/store/branchesStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Clock, Phone } from 'lucide-react';

export const BranchSyncDemo = () => {
  const { branches } = useBranchesStore();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Démonstration - Synchronisation des Branches</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Cette liste montre toutes les branches en temps réel. 
            Les modifications apportées dans les paramètres de branche seront automatiquement 
            reflétées ici et dans toutes les autres vues (admin général, clients).
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branches.map((branch) => (
              <Card key={branch.id} className="overflow-hidden">
                <div className="relative h-32">
                  {branch.image ? (
                    <img
                      src={branch.image}
                      alt={branch.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={branch.isActive ? "default" : "secondary"}>
                      {branch.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{branch.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3" />
                      <span>{branch.city}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3" />
                      <span>{branch.openTime} - {branch.closeTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3" />
                      <span>{branch.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {branches.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune branche trouvée</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
