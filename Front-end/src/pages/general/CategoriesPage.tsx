import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Tag, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Palette,
  Save,
  X,
  Hash,
  FileText,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCategoriesStore } from '@/store/categoriesStore';
import { Category } from '@/types';

const colorOptions = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43', '#10AC84',
  '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E'
];

const iconOptions = [
  '🍕', '🍝', '🥗', '🥤', '🍰', '🥖', '🍔', '🌮', '🍜', '🍱',
  '🍣', '🍤', '🥘', '🍲', '🥙', '🌯', '🍳', '🧀', '🥓', '🍖'
];

export const CategoriesPage = () => {
  const { categories, load, loading, error, addCategory, updateCategory, deleteCategory } = useCategoriesStore();
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🍕',
    color: '#FF6B6B'
  });

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let filtered = categories;

    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

  const handleAddCategory = async () => {
    if (!formData.name.trim()) return;

    try {
      await addCategory(formData);
      setFormData({ name: '', description: '', icon: '🍕', color: '#FF6B6B' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !formData.name.trim()) return;

    try {
      await updateCategory(editingCategory.id, formData);
      setEditingCategory(null);
      setFormData({ name: '', description: '', icon: '🍕', color: '#FF6B6B' });
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      try {
        await deleteCategory(id);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color
    });
  };

  const closeModals = () => {
    setShowAddModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', icon: '🍕', color: '#FF6B6B' });
  };

  return (
    <div className="ml-64 p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Gestion des Catégories</h1>
          <p className="text-muted-foreground">
            Organisez vos plats par catégories avec des icônes et couleurs
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Catégorie
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Total Catégories', value: categories.length, icon: Tag, color: 'text-primary' },
          { title: 'Couleurs Uniques', value: new Set(categories.map(cat => cat.color)).size, icon: Sparkles, color: 'text-green-500' },
          { title: 'Icônes Utilisées', value: new Set(categories.map(cat => cat.icon)).size, icon: Hash, color: 'text-purple-500' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="card-gradient hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-muted/20">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher une catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Categories Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Liste des Catégories ({filteredCategories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Catégorie</th>
                    <th className="text-left py-3 px-4 font-medium">Icône</th>
                    <th className="text-left py-3 px-4 font-medium">Couleur</th>
                    <th className="text-left py-3 px-4 font-medium">Description</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category, index) => (
                    <motion.tr
                      key={category.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            {category.icon}
                          </div>
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {category.id.split('_')[1]}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-2xl">{category.icon}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded-full border border-border"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm font-mono text-muted-foreground">
                            {category.color}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-muted-foreground max-w-xs truncate">
                          {category.description || 'Aucune description'}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(category)}
                            className="hover:bg-muted/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="hover:bg-red-500/10 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <Tag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune catégorie trouvée</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingCategory) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={closeModals}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="border-b border-border/20">
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-primary" />
                  <span>{editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom</label>
                    <input
                      type="text"
                      placeholder="Nom de la catégorie"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      placeholder="Description de la catégorie"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full p-3 bg-muted/20 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Icône</label>
                  <div className="grid grid-cols-10 gap-2 p-3 border border-border rounded-lg">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`w-8 h-8 rounded flex items-center justify-center text-lg hover:bg-muted/20 transition-colors ${
                          formData.icon === icon ? 'bg-primary/20 border-2 border-primary' : ''
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Couleur</label>
                  <div className="grid grid-cols-6 gap-2 p-3 border border-border rounded-lg">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.color === color ? 'border-foreground scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-border/20">
                  <Button
                    variant="outline"
                    onClick={closeModals}
                    className="hover:bg-muted/20"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                    className="btn-primary"
                    disabled={!formData.name.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingCategory ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

