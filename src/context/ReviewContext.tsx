import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Review } from '@/types';

interface ReviewContextType {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;
  getProductReviews: (productId: string) => Review[];
  getAverageRating: (productId: string) => number;
  hasUserReviewed: (productId: string, userId: string) => boolean;
  deleteReview: (reviewId: string) => void;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

const defaultReviews: Review[] = [
  {
    id: '1',
    productId: '1',
    userId: 'demo1',
    userName: 'Priya S.',
    rating: 5,
    comment: 'Absolutely delicious cashews! Fresh and crunchy. Will order again.',
    date: '2025-12-15T10:30:00Z',
  },
  {
    id: '2',
    productId: '1',
    userId: 'demo2',
    userName: 'Rahul M.',
    rating: 4,
    comment: 'Good quality, fast delivery. Slightly smaller pieces than expected.',
    date: '2025-12-10T14:20:00Z',
  },
  {
    id: '3',
    productId: '2',
    userId: 'demo1',
    userName: 'Priya S.',
    rating: 5,
    comment: 'Best almonds I have ever tasted! Premium quality.',
    date: '2025-12-08T09:15:00Z',
  },
  {
    id: '4',
    productId: '4',
    userId: 'demo3',
    userName: 'Anita D.',
    rating: 5,
    comment: 'These dates are so soft and sweet. Perfect for desserts!',
    date: '2025-12-05T16:45:00Z',
  },
];

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('shreemReviews');
    if (stored) {
      setReviews(JSON.parse(stored));
    } else {
      setReviews(defaultReviews);
      localStorage.setItem('shreemReviews', JSON.stringify(defaultReviews));
    }
  }, []);

  const saveReviews = (newReviews: Review[]) => {
    setReviews(newReviews);
    localStorage.setItem('shreemReviews', JSON.stringify(newReviews));
  };

  const addReview = (review: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    saveReviews([newReview, ...reviews]);
  };

  const getProductReviews = (productId: string) => {
    return reviews.filter(r => r.productId === productId);
  };

  const getAverageRating = (productId: string) => {
    const productReviews = getProductReviews(productId);
    if (productReviews.length === 0) return 0;
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / productReviews.length) * 10) / 10;
  };

  const hasUserReviewed = (productId: string, userId: string) => {
    return reviews.some(r => r.productId === productId && r.userId === userId);
  };

  const deleteReview = (reviewId: string) => {
    saveReviews(reviews.filter(r => r.id !== reviewId));
  };

  return (
    <ReviewContext.Provider value={{
      reviews,
      addReview,
      getProductReviews,
      getAverageRating,
      hasUserReviewed,
      deleteReview,
    }}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
}
