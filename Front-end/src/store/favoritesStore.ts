import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStoreState {
  dishIds: string[];
  add: (dishId: string) => void;
  remove: (dishId: string) => void;
  toggle: (dishId: string) => void;
  isFavorite: (dishId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStoreState>()(
  persist(
    (set, get) => ({
      dishIds: [],
      add: (dishId) => {
        const ids = Array.from(new Set([...get().dishIds, dishId]));
        set({ dishIds: ids });
      },
      remove: (dishId) => {
        set({ dishIds: get().dishIds.filter(id => id !== dishId) });
      },
      toggle: (dishId) => {
        const isFav = get().dishIds.includes(dishId);
        if (isFav) {
          set({ dishIds: get().dishIds.filter(id => id !== dishId) });
        } else {
          set({ dishIds: [...get().dishIds, dishId] });
        }
      },
      isFavorite: (dishId) => get().dishIds.includes(dishId),
    }),
    { name: 'favorites-store' }
  )
);


