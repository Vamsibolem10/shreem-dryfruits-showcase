import React from 'react';
import { Star, Quote } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

export default function Testimonials() {
  const { testimonials } = useContent();

  const activeTestimonials = testimonials.filter(t => t.isActive);

  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-gold/5 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-gold/5 translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-gold font-medium tracking-widest uppercase mb-4">
            Customer Love
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            What Our Customers Say
          </h2>
          <div className="w-24 h-1 bg-gradient-gold mx-auto rounded-full" />
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activeTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="bg-primary-foreground/10 backdrop-blur-sm p-8 rounded-2xl border border-primary-foreground/10 hover:border-gold/30 transition-all duration-500 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-gold/50 mb-4" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-gold text-gold" />
                ))}
              </div>

              {/* Text */}
              <p className="text-primary-foreground/80 leading-relaxed mb-6 font-body">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gold"
                />
                <div>
                  <p className="font-semibold text-primary-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-primary-foreground/60">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
