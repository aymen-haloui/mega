// Mock data for development when backend is not available
import { Branch, Dish, Menu, User, Order } from '@/types';

// Initialize mock branches with localStorage persistence
const getMockBranches = (): Branch[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('mockBranches');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Default branches
  const defaultBranches: Branch[] = [
    {
      id: '1',
      name: 'Mega Pizza - Centre Ville',
      address: '123 Rue de la Paix, Alger',
      lat: 36.7538,
      lng: 3.0588,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: '2',
      name: 'Mega Pizza - Hydra',
      address: '456 Avenue des Martyrs, Hydra',
      lat: 36.7448,
      lng: 3.0588,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      updatedBy: 'system',
    },
  ];
  
  localStorage.setItem('mockBranches', JSON.stringify(defaultBranches));
  return defaultBranches;
};

export const mockBranches: Branch[] = getMockBranches();

export const mockMenus: Menu[] = [
  {
    id: '1',
    name: 'Menu Principal',
    branchId: '1',
    branch: mockBranches[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '2',
    updatedBy: '2',
  },
  {
    id: '2',
    name: 'Menu Principal',
    branchId: '2',
    branch: mockBranches[1],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '3',
    updatedBy: '3',
  },
];

export const mockDishes: Dish[] = [
  // Branch 1 (Centre Ville) - Menu 1
  {
    id: '1',
    name: 'Pizza Margherita',
    description: 'Tomate, mozzarella, basilic frais',
    imageUrl: '/images/pizza-margherita.jpg',
    priceCents: 120000, // 1200 DA
    menuId: '1',
    menu: mockMenus[0],
    available: true,
    isAvailable: true,
    category: 'pizza',
    categoryId: 'pizza',
    ingredients: [
      {
        id: 'dish_ing_1',
        dishId: '1',
        dish: {} as Dish, // Will be set after dish creation
        ingredientId: 'ing_1',
        ingredient: { id: 'ing_1', name: 'Tomate', createdAt: new Date().toISOString(), createdBy: 'system' },
        qtyUnit: 1,
        required: true
      },
      {
        id: 'dish_ing_2',
        dishId: '1',
        dish: {} as Dish, // Will be set after dish creation
        ingredientId: 'ing_2',
        ingredient: { id: 'ing_2', name: 'Mozzarella', createdAt: new Date().toISOString(), createdBy: 'system' },
        qtyUnit: 1,
        required: true
      },
      {
        id: 'dish_ing_3',
        dishId: '1',
        dish: {} as Dish, // Will be set after dish creation
        ingredientId: 'ing_3',
        ingredient: { id: 'ing_3', name: 'Basilic', createdAt: new Date().toISOString(), createdBy: 'system' },
        qtyUnit: 1,
        required: true
      },
      {
        id: 'dish_ing_4',
        dishId: '1',
        dish: {} as Dish, // Will be set after dish creation
        ingredientId: 'ing_4',
        ingredient: { id: 'ing_4', name: 'Pâte à Pizza', createdAt: new Date().toISOString(), createdBy: 'system' },
        qtyUnit: 1,
        required: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '2',
    updatedBy: '2',
  },
  {
    id: '2',
    name: 'Pizza Pepperoni',
    description: 'Tomate, mozzarella, pepperoni',
    imageUrl: '/images/pizza-pepperoni.jpg',
    priceCents: 140000, // 1400 DA
    menuId: '1',
    menu: mockMenus[0],
    available: true,
    isAvailable: true,
    category: 'pizza',
    categoryId: 'pizza',
    ingredients: [
      {
        id: 'dish_ing_5',
        dishId: '2',
        dish: {} as Dish, // Will be set after dish creation
        ingredientId: 'ing_1',
        ingredient: { id: 'ing_1', name: 'Tomate', createdAt: new Date().toISOString(), createdBy: 'system' },
        qtyUnit: 1,
        required: true
      },
      {
        id: 'dish_ing_6',
        dishId: '2',
        dish: {} as Dish, // Will be set after dish creation
        ingredientId: 'ing_2',
        ingredient: { id: 'ing_2', name: 'Mozzarella', createdAt: new Date().toISOString(), createdBy: 'system' },
        qtyUnit: 1,
        required: true
      },
      {
        id: 'dish_ing_7',
        dishId: '2',
        dish: {} as Dish, // Will be set after dish creation
        ingredientId: 'ing_4',
        ingredient: { id: 'ing_4', name: 'Pâte à Pizza', createdAt: new Date().toISOString(), createdBy: 'system' },
        qtyUnit: 1,
        required: true
      },
      {
        id: 'dish_ing_8',
        dishId: '2',
        dish: {} as Dish, // Will be set after dish creation
        ingredientId: 'ing_9',
        ingredient: { id: 'ing_9', name: 'Pepperoni', createdAt: new Date().toISOString(), createdBy: 'system' },
        qtyUnit: 1,
        required: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '2',
    updatedBy: '2',
  },
  {
    id: '3',
    name: 'Pizza Quatre Fromages',
    description: 'Mozzarella, gorgonzola, parmesan, chèvre',
    imageUrl: '/images/pizza-quatre-fromages.jpg',
    priceCents: 160000, // 1600 DA
    menuId: '1',
    menu: mockMenus[0],
    available: true,
    isAvailable: true,
    category: 'pizza',
    categoryId: 'pizza',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '2',
    updatedBy: '2',
  },
  {
    id: '4',
    name: 'Spaghetti Carbonara',
    description: 'Pâtes fraîches, lardons, œufs, parmesan',
    imageUrl: '/images/spaghetti-carbonara.jpg',
    priceCents: 100000, // 1000 DA
    menuId: '1',
    menu: mockMenus[0],
    available: true,
    isAvailable: true,
    category: 'pasta',
    categoryId: 'pasta',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '2',
    updatedBy: '2',
  },
  {
    id: '5',
    name: 'Salade César',
    description: 'Salade verte, croûtons, parmesan, sauce césar',
    imageUrl: '/images/salade-cesar.jpg',
    priceCents: 80000, // 800 DA
    menuId: '1',
    menu: mockMenus[0],
    available: true,
    isAvailable: true,
    category: 'salad',
    categoryId: 'salad',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '2',
    updatedBy: '2',
  },
  
  // Branch 2 (Hydra) - Menu 2
  {
    id: '6',
    name: 'Pizza Hawaïenne',
    description: 'Tomate, mozzarella, jambon, ananas',
    imageUrl: '/images/pizza-hawaiienne.jpg',
    priceCents: 130000, // 1300 DA
    menuId: '2',
    menu: mockMenus[1],
    available: true,
    isAvailable: true,
    category: 'pizza',
    categoryId: 'pizza',
    ingredients: [
      {
        id: 'dish_ing_9',
        dishId: '6',
        dish: {} as Dish, // Will be set after dish creation
        ingredientId: 'ing_1',
        ingredient: { id: 'ing_1', name: 'Tomate', createdAt: new Date().toISOString(), createdBy: 'system' },
        qtyUnit: 1,
        required: true
      },
      {
        id: 'dish_ing_10',
        dishId: '6',
        dish: {} as Dish, // Will be set after dish creation
        ingredientId: 'ing_2',
        ingredient: { id: 'ing_2', name: 'Mozzarella', createdAt: new Date().toISOString(), createdBy: 'system' },
        qtyUnit: 1,
        required: true
      },
      {
        id: 'dish_ing_11',
        dishId: '6',
        dish: {} as Dish, // Will be set after dish creation
        ingredientId: 'ing_5',
        ingredient: { id: 'ing_5', name: 'Jambon', createdAt: new Date().toISOString(), createdBy: 'system' },
        qtyUnit: 1,
        required: true
      },
      {
        id: 'dish_ing_12',
        dishId: '6',
        dish: {} as Dish, // Will be set after dish creation
        ingredientId: 'ing_10',
        ingredient: { id: 'ing_10', name: 'Ananas', createdAt: new Date().toISOString(), createdBy: 'system' },
        qtyUnit: 1,
        required: true
      },
      {
        id: 'dish_ing_13',
        dishId: '6',
        dish: {} as Dish, // Will be set after dish creation
        ingredientId: 'ing_4',
        ingredient: { id: 'ing_4', name: 'Pâte à Pizza', createdAt: new Date().toISOString(), createdBy: 'system' },
        qtyUnit: 1,
        required: true
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '3',
    updatedBy: '3',
  },
  {
    id: '7',
    name: 'Pizza BBQ',
    description: 'Sauce BBQ, mozzarella, poulet grillé, oignons',
    imageUrl: '/images/pizza-bbq.jpg',
    priceCents: 150000, // 1500 DA
    menuId: '2',
    menu: mockMenus[1],
    available: true,
    isAvailable: true,
    category: 'pizza',
    categoryId: 'pizza',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '3',
    updatedBy: '3',
  },
  {
    id: '8',
    name: 'Lasagnes Bolognaise',
    description: 'Pâtes, viande hachée, tomates, béchamel',
    imageUrl: '/images/lasagnes-bolognaise.jpg',
    priceCents: 120000, // 1200 DA
    menuId: '2',
    menu: mockMenus[1],
    available: true,
    isAvailable: true,
    category: 'pasta',
    categoryId: 'pasta',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '3',
    updatedBy: '3',
  },
  {
    id: '9',
    name: 'Salade Grecque',
    description: 'Tomates, concombres, olives, feta, huile d\'olive',
    imageUrl: '/images/salade-grecque.jpg',
    priceCents: 90000, // 900 DA
    menuId: '2',
    menu: mockMenus[1],
    available: true,
    isAvailable: true,
    category: 'salad',
    categoryId: 'salad',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '3',
    updatedBy: '3',
  },
  {
    id: '10',
    name: 'Tiramisu',
    description: 'Dessert italien au café et mascarpone',
    imageUrl: '/images/tiramisu.jpg',
    priceCents: 70000, // 700 DA
    menuId: '2',
    menu: mockMenus[1],
    available: true,
    isAvailable: true,
    category: 'dessert',
    categoryId: 'dessert',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '3',
    updatedBy: '3',
  },
  {
    id: '6',
    name: 'Coca Cola',
    description: 'Boisson gazeuse rafraîchissante',
    imageUrl: '/images/coca-cola.jpg',
    priceCents: 30000, // 300 DA
    menuId: '1',
    menu: mockMenus[0],
    available: true,
    isAvailable: true,
    category: 'drink',
    categoryId: 'drink',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: '2',
    updatedBy: '2',
  },
];

// Initialize mock users with localStorage persistence
const getMockUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('mockUsers');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Default users
  const defaultUsers: User[] = [
    {
      id: '1',
      name: 'Admin General',
      phone: '+213555000001',
      role: 'ADMIN',
      branchId: undefined,
      password: 'hashed_admin123', // Added password field
      isBlocked: false,
      notes: 'Administrateur principal du système',
      cancellationCount: 0,
      noShowCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: '2',
      name: 'Admin Branche 1',
      phone: '+213555000002',
      role: 'BRANCH_USER',
      branchId: '1',
      branch: mockBranches[0],
      password: 'hashed_password123', // Added password field
      isBlocked: false,
      notes: 'Gestionnaire de la succursale Centre Ville',
      cancellationCount: 0,
      noShowCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '1',
      updatedBy: '1',
    },
    {
      id: '3',
      name: 'Admin Branche 2',
      phone: '+213555000003',
      role: 'BRANCH_USER',
      branchId: '2',
      branch: mockBranches[1],
      password: 'hashed_password123', // Added password field
      isBlocked: false,
      notes: 'Gestionnaire de la succursale Hydra',
      cancellationCount: 0,
      noShowCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '1',
      updatedBy: '1',
    },
  ];
  
  localStorage.setItem('mockUsers', JSON.stringify(defaultUsers));
  return defaultUsers;
};

export const mockUsers: User[] = getMockUsers();

export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 1001,
    branchId: '1',
    branch: mockBranches[0],
    userName: 'Ahmed Benali',
    userPhone: '+213555123456',
    items: [
      {
        id: 'item_1',
        orderId: '1',
        dishId: '1',
        dish: mockDishes[0],
        qty: 2,
        priceCents: 120000,
        order: {} as Order, // Will be set after order creation
      },
      {
        id: 'item_2',
        orderId: '1',
        dishId: '6',
        dish: mockDishes[5],
        qty: 1,
        priceCents: 30000,
        order: {} as Order, // Will be set after order creation
      },
    ],
    status: 'PENDING',
    totalCents: 270000, // 2 pizzas + 1 drink = 2700 DA
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    canceled: false,
    cancelReason: null,
    createdBy: null,
    updatedBy: null,
  },
  {
    id: '2',
    orderNumber: 1002,
    branchId: '1',
    branch: mockBranches[0],
    userName: 'Fatima Zohra',
    userPhone: '+213555789012',
    items: [
      {
        id: 'item_3',
        orderId: '2',
        dishId: '2',
        dish: mockDishes[1],
        qty: 1,
        priceCents: 140000,
        order: {} as Order, // Will be set after order creation
      },
      {
        id: 'item_4',
        orderId: '2',
        dishId: '5',
        dish: mockDishes[4],
        qty: 1,
        priceCents: 80000,
        order: {} as Order, // Will be set after order creation
      },
    ],
    status: 'PREPARING',
    totalCents: 220000, // 1 pizza + 1 salad = 2200 DA
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    canceled: false,
    cancelReason: null,
    createdBy: null,
    updatedBy: null,
  },
  {
    id: '3',
    orderNumber: 1003,
    branchId: '2',
    branch: mockBranches[1],
    userName: 'Mohamed Khelil',
    userPhone: '+213555345678',
    items: [
      {
        id: 'item_5',
        orderId: '3',
        dishId: '3',
        dish: mockDishes[2],
        qty: 1,
        priceCents: 160000,
        order: {} as Order, // Will be set after order creation
      },
      {
        id: 'item_6',
        orderId: '3',
        dishId: '4',
        dish: mockDishes[3],
        qty: 1,
        priceCents: 100000,
        order: {} as Order, // Will be set after order creation
      },
    ],
    status: 'READY',
    totalCents: 260000, // 1 pizza + 1 pasta = 2600 DA
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    canceled: false,
    cancelReason: null,
    createdBy: null,
    updatedBy: null,
  },
  {
    id: '4',
    orderNumber: 1004,
    branchId: '1',
    branch: mockBranches[0],
    userName: 'Aicha Boudjedra',
    userPhone: '+213555901234',
    items: [
      {
        id: 'item_7',
        orderId: '4',
        dishId: '1',
        dish: mockDishes[0],
        qty: 1,
        priceCents: 120000,
        order: {} as Order, // Will be set after order creation
      },
    ],
    status: 'COMPLETED',
    totalCents: 120000, // 1 pizza = 1200 DA
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), // 1.5 hours ago
    canceled: false,
    cancelReason: null,
    createdBy: null,
    updatedBy: null,
  },
  {
    id: '5',
    orderNumber: 1005,
    branchId: '2',
    branch: mockBranches[1],
    userName: 'Karim Belkacem',
    userPhone: '+213555567890',
    items: [
      {
        id: 'item_8',
        orderId: '5',
        dishId: '2',
        dish: mockDishes[1],
        qty: 2,
        priceCents: 140000,
        order: {} as Order, // Will be set after order creation
      },
      {
        id: 'item_9',
        orderId: '5',
        dishId: '6',
        dish: mockDishes[5],
        qty: 2,
        priceCents: 30000,
        order: {} as Order, // Will be set after order creation
      },
    ],
    status: 'CANCELED',
    totalCents: 340000, // 2 pizzas + 2 drinks = 3400 DA
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(), // 50 minutes ago
    canceled: true,
    cancelReason: 'Client a annulé la commande',
    createdBy: null,
    updatedBy: null,
  },
];

// Helper function to check if we should use mock data
export const shouldUseMockData = (): boolean => {
  // Check environment variable first, fallback to true for development
  const useMockFromEnv = import.meta.env.VITE_USE_MOCK_DATA;
  
  // If environment variable is explicitly set, use it
  if (useMockFromEnv !== undefined) {
    return useMockFromEnv === 'true';
  }
  
  // Default to mock data for development
  return true;
};
