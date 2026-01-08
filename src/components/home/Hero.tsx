import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContent } from '@/context/ContentContext';

export default function Hero() {
  const { heroContent } = useContent();

  if (!heroContent) return null;

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroContent.backgroundImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-gold/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-40 left-20 w-48 h-48 rounded-full bg-gold/10 blur-3xl animate-pulse delay-1000" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gold/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-gold text-sm font-medium">{heroContent.badge}</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-cream leading-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {heroContent.heading}
            <span className="block text-shimmer">{heroContent.subheading}</span>
          </h1>

          {/* Description */}
          <p className="text-cream/80 text-lg md:text-xl max-w-xl mb-10 leading-relaxed animate-fade-in font-body" style={{ animationDelay: '0.2s' }}>
            {heroContent.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/products">
              <Button className="h-14 px-10 text-lg rounded-xl bg-[hsl(42,75%,55%)] text-[hsl(25,30%,15%)] font-semibold hover:bg-[hsl(42,70%,50%)] hover:scale-105 group">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/about">
              <Button 
                variant="outline" 
                className="h-14 px-10 text-lg rounded-xl border-cream/50 text-cream hover:bg-cream hover:text-[hsl(25,30%,15%)]"
              >
                Our Story
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div>
              <p className="text-4xl font-serif font-bold text-gold">15+</p>
              <p className="text-cream/60 text-sm">Years Experience</p>
            </div>
            <div>
              <p className="text-4xl font-serif font-bold text-gold">50K+</p>
              <p className="text-cream/60 text-sm">Happy Customers</p>
            </div>
            <div>
              <p className="text-4xl font-serif font-bold text-gold">100+</p>
              <p className="text-cream/60 text-sm">Premium Products</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
