import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Testimonial, Feature, HeroContent } from '@/types';

interface ContentContextType {
  testimonials: Testimonial[];
  features: Feature[];
  heroContent: HeroContent | null;
  addTestimonial: (testimonial: Omit<Testimonial, 'id'>) => void;
  updateTestimonial: (id: string, testimonial: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;
  addFeature: (feature: Omit<Feature, 'id'>) => void;
  updateFeature: (id: string, feature: Partial<Feature>) => void;
  deleteFeature: (id: string) => void;
  updateHeroContent: (heroContent: Partial<HeroContent>) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'The quality of cashews is exceptional! I\'ve been ordering from Shreem Nuts N Fruits for over 2 years now. Best dry fruits I\'ve ever had.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    isActive: true,
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    location: 'Delhi',
    rating: 5,
    text: 'Amazing gift boxes! Perfect for festive occasions. The packaging is premium and the taste is unmatched.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    isActive: true,
  },
  {
    id: '3',
    name: 'Anita Desai',
    location: 'Bangalore',
    rating: 5,
    text: 'Fast delivery and fresh products every time. The almonds are so crunchy and flavorful. Highly recommend!',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    isActive: true,
  },
];

const defaultFeatures: Feature[] = [
  {
    id: '1',
    icon: 'Award',
    title: 'Premium Quality',
    description: 'Every product is carefully selected and quality tested to ensure the finest taste.',
    isActive: true,
  },
  {
    id: '2',
    icon: 'Truck',
    title: 'Fast Delivery',
    description: 'Swift and secure delivery to your doorstep with real-time tracking.',
    isActive: true,
  },
  {
    id: '3',
    icon: 'Leaf',
    title: '100% Natural',
    description: 'No preservatives or additives. Just pure, natural goodness from nature.',
    isActive: true,
  },
  {
    id: '4',
    icon: 'Shield',
    title: 'Secure Payment',
    description: 'Safe and encrypted transactions with multiple payment options.',
    isActive: true,
  },
];

const defaultHeroContent: HeroContent = {
  id: '1',
  badge: 'Premium Quality Since 2010',
  heading: 'Nature\'s Finest',
  subheading: 'Dry Fruits',
  description: 'Discover the exquisite taste of hand-picked, premium quality dry fruits sourced from the finest orchards around the world.',
  backgroundImage: 'https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=1920',
  isActive: true,
};

export function ContentProvider({ children }: { children: ReactNode }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [features, setFeatures] = useState<Feature[]>(defaultFeatures);
  const [heroContent, setHeroContent] = useState<HeroContent>(defaultHeroContent);

  // Load from localStorage on mount
  useEffect(() => {
    const savedTestimonials = localStorage.getItem('testimonials');
    const savedFeatures = localStorage.getItem('features');
    const savedHeroContent = localStorage.getItem('heroContent');

    if (savedTestimonials) {
      setTestimonials(JSON.parse(savedTestimonials));
    }
    if (savedFeatures) {
      setFeatures(JSON.parse(savedFeatures));
    }
    if (savedHeroContent) {
      setHeroContent(JSON.parse(savedHeroContent));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem('features', JSON.stringify(features));
  }, [features]);

  useEffect(() => {
    localStorage.setItem('heroContent', JSON.stringify(heroContent));
  }, [heroContent]);

  const addTestimonial = (testimonial: Omit<Testimonial, 'id'>) => {
    const newTestimonial = { ...testimonial, id: Date.now().toString() };
    setTestimonials(prev => [...prev, newTestimonial]);
  };

  const updateTestimonial = (id: string, testimonial: Partial<Testimonial>) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...testimonial } : t));
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  const addFeature = (feature: Omit<Feature, 'id'>) => {
    const newFeature = { ...feature, id: Date.now().toString() };
    setFeatures(prev => [...prev, newFeature]);
  };

  const updateFeature = (id: string, feature: Partial<Feature>) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, ...feature } : f));
  };

  const deleteFeature = (id: string) => {
    setFeatures(prev => prev.filter(f => f.id !== id));
  };

  const updateHeroContent = (heroContentUpdate: Partial<HeroContent>) => {
    setHeroContent(prev => ({ ...prev, ...heroContentUpdate }));
  };

  return (
    <ContentContext.Provider value={{
      testimonials,
      features,
      heroContent,
      addTestimonial,
      updateTestimonial,
      deleteTestimonial,
      addFeature,
      updateFeature,
      deleteFeature,
      updateHeroContent,
    }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}