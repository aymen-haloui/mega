// Algeria Eats Hub - Photo Upload Demo Component

import { useState } from 'react';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

export const PhotoUploadDemo = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageChange = (imageUrl: string | null) => {
    setUploadedImage(imageUrl);
  };

  const resetDemo = () => {
    setUploadedImage(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Démonstration - Upload de Photo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PhotoUpload
            currentImage={uploadedImage || undefined}
            onImageChange={handleImageChange}
            maxSize={10}
          />
          
          {uploadedImage && (
            <div className="space-y-2">
              <h3 className="font-semibold">Image uploadée avec succès !</h3>
              <p className="text-sm text-muted-foreground">
                Cette image serait maintenant visible dans la section "Nos Restaurants"
              </p>
              <Button onClick={resetDemo} variant="outline" size="sm">
                Réinitialiser la démo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
