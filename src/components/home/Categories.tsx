import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/context/ProductContext';

const categoryImages: Record<string, string> = {
  'Nuts': 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500',
  'Dried Fruits': 'https://images.unsplash.com/photo-1596273501048-2e5c667a5c9a?w=500',
  'Gift Boxes': 'https://images.unsplash.com/photo-1607897447825-1e73e0d61fdb?w=500',
};

export default function Categories() {
  const { categories } = useProducts();

  return (
    <section className="py-24 bg-cream-dark">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-gold font-medium tracking-widest uppercase mb-4">
            Browse By Category
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our Collections
          </h2>
          <div className="w-24 h-1 bg-gradient-gold mx-auto rounded-full" />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Link
              key={category}
              to={`/products?category=${category}`}
              className="group relative h-80 rounded-2xl overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: `url(${categoryImages[category] || 'https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=500'})`,
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-walnut-dark/90 via-walnut-dark/40 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="font-serif text-3xl font-bold text-cream mb-2 group-hover:text-gold transition-colors">
                  {category}
                </h3>
                <p className="text-cream/70 font-medium">
                  Explore Collection →
                </p>
              </div>

              {/* Hover Border */}
              <div className="absolute inset-0 border-4 border-gold/0 group-hover:border-gold/50 rounded-2xl transition-all duration-500" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
