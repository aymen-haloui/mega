import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Review } from '@/types';

interface ReviewsStoreState {
  reviews: Review[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<Review>;
  getReviewsByDish: (dishId: string) => Review[];
  getReviewsByUser: (userPhone: string) => Review[];
  getAverageRating: (dishId: string) => number;
  getReviewStats: (dishId: string) => {
    total: number;
    average: number;
    distribution: { [key: number]: number };
  };
  deleteReview: (id: string) => Promise<void>;
}

export const useReviewsStore = create<ReviewsStoreState>()(
  persist(
    (set, get) => ({
      reviews: [],
      loaded: false,
      loading: false,
      error: null,

      load: async () => {
        set({ loading: true, error: null });
        try {
          const stored = localStorage.getItem('reviews');
          if (stored) {
            const reviews = JSON.parse(stored);
            set({ reviews, loaded: true, loading: false });
          } else {
            set({ reviews: [], loaded: true, loading: false });
          }
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      addReview: async (reviewData) => {
        const newReview: Review = {
          ...reviewData,
          id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const updatedReviews = [newReview, ...state.reviews];
          localStorage.setItem('reviews', JSON.stringify(updatedReviews));
          return { reviews: updatedReviews };
        });

        return newReview;
      },

      getReviewsByDish: (dishId: string) => {
        const { reviews } = get();
        return reviews.filter(review => review.dishId === dishId);
      },

      getReviewsByUser: (userPhone: string) => {
        const { reviews } = get();
        return reviews.filter(review => review.userPhone === userPhone);
      },

      getAverageRating: (dishId: string) => {
        const { reviews } = get();
        const dishReviews = reviews.filter(review => review.dishId === dishId);
        if (dishReviews.length === 0) return 0;
        
        const sum = dishReviews.reduce((acc, review) => acc + review.rating, 0);
        return Math.round((sum / dishReviews.length) * 10) / 10;
      },

      getReviewStats: (dishId: string) => {
        const { reviews } = get();
        const dishReviews = reviews.filter(review => review.dishId === dishId);
        
        if (dishReviews.length === 0) {
          return { total: 0, average: 0, distribution: {} };
        }

        const sum = dishReviews.reduce((acc, review) => acc + review.rating, 0);
        const average = Math.round((sum / dishReviews.length) * 10) / 10;
        
        const distribution = dishReviews.reduce((acc, review) => {
          acc[review.rating] = (acc[review.rating] || 0) + 1;
          return acc;
        }, {} as { [key: number]: number });

        return { total: dishReviews.length, average, distribution };
      },

      deleteReview: async (id: string) => {
        set((state) => {
          const updatedReviews = state.reviews.filter(review => review.id !== id);
          localStorage.setItem('reviews', JSON.stringify(updatedReviews));
          return { reviews: updatedReviews };
        });
      },
    }),
    {
      name: 'reviews-storage',
      partialize: (state) => ({ reviews: state.reviews }),
    }
  )
);

