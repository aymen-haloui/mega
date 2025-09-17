// Category utilities for dishes (since categories are not in Prisma schema)

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// Define categories based on dish types
export const DISH_CATEGORIES: Category[] = [
  {
    id: 'pizza',
    name: 'Pizza',
    description: 'Délicieuses pizzas artisanales',
    icon: '🍕',
    color: 'red',
  },
  {
    id: 'pasta',
    name: 'Pâtes',
    description: 'Pâtes fraîches et sauces maison',
    icon: '🍝',
    color: 'orange',
  },
  {
    id: 'salad',
    name: 'Salades',
    description: 'Salades fraîches et équilibrées',
    icon: '🥗',
    color: 'green',
  },
  {
    id: 'drink',
    name: 'Boissons',
    description: 'Boissons fraîches et chaudes',
    icon: '🥤',
    color: 'blue',
  },
  {
    id: 'dessert',
    name: 'Desserts',
    description: 'Desserts sucrés et gourmands',
    icon: '🍰',
    color: 'purple',
  },
  {
    id: 'other',
    name: 'Autres',
    description: 'Autres plats et spécialités',
    icon: '🍽️',
    color: 'gray',
  },
];

// Function to determine category from dish name
export const getDishCategory = (dishName: string): string => {
  const name = dishName.toLowerCase();
  
  if (name.includes('pizza')) return 'pizza';
  if (name.includes('pasta') || name.includes('spaghetti') || name.includes('penne')) return 'pasta';
  if (name.includes('salad') || name.includes('salade')) return 'salad';
  if (name.includes('drink') || name.includes('boisson') || name.includes('coca') || name.includes('jus')) return 'drink';
  if (name.includes('dessert') || name.includes('cake') || name.includes('gâteau')) return 'dessert';
  
  return 'other';
};

// Function to get category by ID
export const getCategoryById = (categoryId: string): Category | undefined => {
  return DISH_CATEGORIES.find(cat => cat.id === categoryId);
};

// Function to get category name
export const getCategoryName = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.name || 'Autres';
};

// Function to get category color
export const getCategoryColor = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.color || 'gray';
};

// Function to get category icon
export const getCategoryIcon = (categoryId: string): string => {
  const category = getCategoryById(categoryId);
  return category?.icon || '🍽️';
};

// Function to get all categories
export const getAllCategories = (): Category[] => {
  return DISH_CATEGORIES;
};
