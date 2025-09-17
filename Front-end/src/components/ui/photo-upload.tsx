// Algeria Eats Hub - Photo Upload Component

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
// Removed imageService import - will be replaced with real API

interface PhotoUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string | null) => void;
  className?: string;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
}

export const PhotoUpload = ({
  currentImage,
  onImageChange,
  className = '',
  maxSize = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}: PhotoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      // TODO: Replace with real image upload API
      const result = await Promise.resolve({
        success: true,
        imageUrl: URL.createObjectURL(file)
      });

      if (result.success && result.imageUrl) {
        onImageChange(result.imageUrl);
      } else {
        setError(result.error || 'Erreur lors de l\'upload de l\'image');
      }
    } catch (err) {
      setError('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {currentImage ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative group">
                <img
                  src={currentImage}
                  alt="Branch photo"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={openFileDialog}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Changer
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card
            className={`border-2 border-dashed transition-colors cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={openFileDialog}
          >
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center">
                  {isUploading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </motion.div>
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {isUploading ? 'Upload en cours...' : 'Ajouter une photo'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Glissez-déposez une image ou cliquez pour sélectionner
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Formats acceptés: JPG, PNG, WebP (max {maxSize}MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <p className="text-sm text-red-500">{error}</p>
        </motion.div>
      )}
    </div>
  );
};
