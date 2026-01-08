import React from 'react';
import { Award, Leaf, Heart, Users } from 'lucide-react';
import Layout from '@/components/layout/Layout';

const values = [
  {
    icon: Leaf,
    title: '100% Natural',
    description: 'We source only natural, additive-free dry fruits directly from trusted farmers.',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Every product undergoes rigorous quality testing to ensure the best taste and nutrition.',
  },
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Your satisfaction is our priority. We go above and beyond to serve you better.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'We work closely with local farmers, supporting sustainable farming practices.',
  },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-24 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-gold blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <p className="text-gold font-medium tracking-widest uppercase mb-4">
            Our Story
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-primary-foreground mb-6">
            About Shreem Nuts N Fruits
          </h1>
          <div className="w-24 h-1 bg-gradient-gold mx-auto rounded-full" />
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in">
              <p className="text-gold font-medium tracking-widest uppercase mb-4">
                Since 2010
              </p>
              <h2 className="font-serif text-4xl font-bold text-foreground mb-6">
                A Legacy of Excellence
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed font-body">
                <p>
                  Shreem Nuts N Fruits began with a simple vision: to bring the finest quality 
                  dry fruits and nuts directly from farms to your table. What started as a 
                  small family business has grown into a trusted name in premium dry fruits.
                </p>
                <p>
                  Our founder, inspired by his grandfather's tradition of selecting only 
                  the best produce, established direct relationships with farmers across 
                  India, Iran, and California. This ensures that every product we sell 
                  meets our exacting standards of quality and freshness.
                </p>
                <p>
                  Today, Shreem Nuts N Fruits serves over 50,000 happy customers, continuing 
                  the legacy of quality that our family has upheld for generations.
                </p>
              </div>
            </div>
            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1599789197514-47270cd526b4?w=800"
                  alt="Premium dry fruits"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-gold/20 rounded-2xl -z-10" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/20 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-cream-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-gold font-medium tracking-widest uppercase mb-4">
              What We Believe
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Core Values
            </h2>
            <div className="w-24 h-1 bg-gradient-gold mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="text-center p-8 bg-card rounded-2xl border border-border hover:shadow-gold hover:border-gold/30 transition-all duration-500 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold">
                  <value.icon className="h-8 w-8 text-walnut-dark" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <p className="text-5xl md:text-6xl font-serif font-bold text-gold mb-2">15+</p>
              <p className="text-primary-foreground/70">Years Experience</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <p className="text-5xl md:text-6xl font-serif font-bold text-gold mb-2">50K+</p>
              <p className="text-primary-foreground/70">Happy Customers</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <p className="text-5xl md:text-6xl font-serif font-bold text-gold mb-2">100+</p>
              <p className="text-primary-foreground/70">Premium Products</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <p className="text-5xl md:text-6xl font-serif font-bold text-gold mb-2">500+</p>
              <p className="text-primary-foreground/70">Cities Served</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
