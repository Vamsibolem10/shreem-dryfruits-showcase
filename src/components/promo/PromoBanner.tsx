import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { usePromo } from '@/context/PromoContext';

export default function PromoBanner() {
  const { getActiveBanners } = usePromo();
  const banners = getActiveBanners();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0 || isDismissed) return null;

  const currentBanner = banners[currentIndex];

  return (
    <div className="bg-gradient-to-r from-[hsl(25,45%,25%)] via-[hsl(25,50%,20%)] to-[hsl(25,45%,25%)] text-[hsl(38,35%,95%)] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-32 h-32 rounded-full bg-[hsl(42,75%,55%)] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 rounded-full bg-[hsl(42,75%,55%)] blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-3 relative">
        <div className="flex items-center justify-center gap-4">
          {/* Previous Button */}
          {banners.length > 1 && (
            <button
              onClick={() => setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors hidden sm:block"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Banner Content */}
          <Link
            to={currentBanner.link}
            className="flex items-center gap-3 text-center group"
          >
            <Sparkles className="w-5 h-5 text-[hsl(42,75%,55%)] animate-pulse hidden sm:block" />
            <div>
              <span className="font-semibold group-hover:text-[hsl(42,75%,55%)] transition-colors">
                {currentBanner.title}
              </span>
              {currentBanner.subtitle && (
                <span className="text-[hsl(38,35%,95%)]/70 ml-2 hidden md:inline">
                  {currentBanner.subtitle}
                </span>
              )}
            </div>
            <Sparkles className="w-5 h-5 text-[hsl(42,75%,55%)] animate-pulse hidden sm:block" />
          </Link>

          {/* Next Button */}
          {banners.length > 1 && (
            <button
              onClick={() => setCurrentIndex(prev => (prev + 1) % banners.length)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors hidden sm:block"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dots Indicator */}
        {banners.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-[hsl(42,75%,55%)] w-4'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
