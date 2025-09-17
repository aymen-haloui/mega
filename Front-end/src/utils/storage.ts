// Storage utilities with cross-tab broadcast via storage events

export type StorageEventName =
  | "users:changed"
  | "branches:changed"
  | "products:changed"
  | "orders:changed"
  | "categories:changed"
  | "payments:changed"
  | "notifications:changed"
  | "auth:changed";

const CHANNEL_KEY = "aeh:broadcast";

export const saveJSON = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const loadJSON = <T>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const broadcast = (eventName: StorageEventName, payload?: unknown) => {
  const message = {
    id: Date.now() + Math.random(),
    event: eventName,
    payload: payload ?? null,
    ts: Date.now(),
  };
  localStorage.setItem(CHANNEL_KEY, JSON.stringify(message));
  // Clean up to avoid growing localStorage
  setTimeout(() => {
    localStorage.removeItem(CHANNEL_KEY);
  }, 0);
};

export const subscribe = (handler: (event: StorageEventName, payload: unknown) => void) => {
  const listener = (e: StorageEvent) => {
    if (e.key !== CHANNEL_KEY || !e.newValue) return;
    try {
      const msg = JSON.parse(e.newValue) as { event: StorageEventName; payload: unknown };
      handler(msg.event, msg.payload);
    } catch {}
  };
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
};


