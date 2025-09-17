// Algeria Eats Hub - Helper Functions

/**
 * Format money in Algerian Dinars
 */
export const formatMoney = (amount: number): string => {
  return `${amount.toLocaleString('fr-FR')} DA`;
};

/**
 * Format date to French locale
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format time to French locale
 */
export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Find nearest branch to user coordinates
 */
export const findNearestBranch = (
  userLat: number,
  userLng: number,
  branches: Array<{ id: number; lat: number; lng: number; name: string; city: string }>
) => {
  let nearestBranch = branches[0];
  let minDistance = calculateDistance(userLat, userLng, branches[0].lat, branches[0].lng);

  branches.forEach(branch => {
    const distance = calculateDistance(userLat, userLng, branch.lat, branch.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestBranch = branch;
    }
  });

  return { branch: nearestBranch, distance: minDistance };
};

/**
 * Mock geolocation - simulate user location in Algeria
 */
export const getMockUserLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Random coordinates in Algeria (around Algiers region)
      const latitude = 36.7538 + (Math.random() - 0.5) * 0.2;
      const longitude = 3.0588 + (Math.random() - 0.5) * 0.2;
      resolve({ latitude, longitude });
    }, 1000);
  });
};

/**
 * Get order status info with colors and labels
 */
export const getOrderStatusInfo = (status: string) => {
  const statusMap = {
    pending: { label: 'En attente', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' },
    confirmed: { label: 'Confirmée', color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
    preparing: { label: 'En préparation', color: 'text-orange-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' },
    delivering: { label: 'En livraison', color: 'text-purple-500', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
    completed: { label: 'Terminée', color: 'text-green-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20' },
    cancelled: { label: 'Annulée', color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' }
  };
  
  return statusMap[status as keyof typeof statusMap] || statusMap.pending;
};

/**
 * Generate random avatar colors
 */
export const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500'
  ];
  
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

/**
 * Truncate text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Validate phone number (Algerian format)
 */
export const validateAlgerianPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+213|0)[567]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Format phone number display
 */
export const formatPhoneDisplay = (phone: string): string => {
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.startsWith('+213')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
  }
  if (cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  }
  return phone;
};

/**
 * Generate order tracking steps
 */
export const getOrderTrackingSteps = (status: string) => {
  const allSteps = [
    { key: 'pending', label: 'Commande reçue', completed: false },
    { key: 'confirmed', label: 'Confirmée', completed: false },
    { key: 'preparing', label: 'En préparation', completed: false },
    { key: 'delivering', label: 'En livraison', completed: false },
    { key: 'completed', label: 'Livrée', completed: false }
  ];

  const statusOrder = ['pending', 'confirmed', 'preparing', 'delivering', 'completed'];
  const currentIndex = statusOrder.indexOf(status);

  return allSteps.map((step, index) => ({
    ...step,
    completed: index <= currentIndex,
    active: index === currentIndex
  }));
};

/**
 * Calculate estimated delivery time
 */
export const calculateEstimatedDelivery = (preparationTime: number = 20): string => {
  const now = new Date();
  const deliveryTime = new Date(now.getTime() + (preparationTime + 15) * 60000); // prep time + 15min delivery
  return deliveryTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Group array by key
 */
export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Sleep/delay function
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Get random items from array
 */
export const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};