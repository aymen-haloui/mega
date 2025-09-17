// Simple ID generator with monotonic increment per entity key, persisted in localStorage

const COUNTERS_KEY = "aeh:id_counters";

type EntityKey = "users" | "branches" | "products" | "orders" | "categories" | "payments" | "notifications";

type Counters = Record<EntityKey, number>;

const getCounters = (): Counters => {
  try {
    const raw = localStorage.getItem(COUNTERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial: Counters = {
    users: 5,
    branches: 3,
    products: 7,
    orders: 0,
    categories: 6,
    payments: 0,
    notifications: 0,
  };
  localStorage.setItem(COUNTERS_KEY, JSON.stringify(initial));
  return initial;
};

const setCounters = (counters: Counters) => {
  localStorage.setItem(COUNTERS_KEY, JSON.stringify(counters));
};

export const generateId = (key: EntityKey): number => {
  const counters = getCounters();
  const next = (counters[key] || 0) + 1;
  counters[key] = next;
  setCounters(counters);
  return next;
};


