import React from 'react';
import { Award, Truck, Leaf, Shield } from 'lucide-react';

const features = [
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Every product is carefully selected and quality tested to ensure the finest taste.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Swift and secure delivery to your doorstep with real-time tracking.',
  },
  {
    icon: Leaf,
    title: '100% Natural',
    description: 'No preservatives or additives. Just pure, natural goodness from nature.',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: 'Safe and encrypted transactions with multiple payment options.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-gold font-medium tracking-widest uppercase mb-4">
            Why Choose Us
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            The Shreem Difference
          </h2>
          <div className="w-24 h-1 bg-gradient-gold mx-auto rounded-full" />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group text-center p-8 rounded-2xl bg-card border border-border hover:border-gold/50 transition-all duration-500 hover:shadow-gold animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-gold flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-gold">
                <feature.icon className="h-8 w-8 text-walnut-dark" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
