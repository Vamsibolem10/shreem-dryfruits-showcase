import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { useShop } from '@/context/ShopContext';

export default function Footer() {
  const { shopConfig } = useShop();

  if (!shopConfig) return null;

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="/logo.png" 
                alt="Shreem Nuts N Fruits" 
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-serif text-2xl font-bold">{shopConfig.name}</h3>
                <p className="text-xs text-primary-foreground/70 tracking-widest uppercase">
                  Premium Dryfruits
                </p>
              </div>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed">
              {shopConfig.footerDescription || 'Bringing you the finest quality dry fruits and nuts from around the world since 2010.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 text-gold">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-gold transition-colors">
                  {shopConfig.quickLinks?.home || 'Home'}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-primary-foreground/80 hover:text-gold transition-colors">
                  {shopConfig.quickLinks?.products || 'Products'}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-gold transition-colors">
                  {shopConfig.quickLinks?.about || 'About Us'}
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-primary-foreground/80 hover:text-gold transition-colors">
                  {shopConfig.quickLinks?.orders || 'Track Order'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 text-gold">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gold" />
                <span className="text-primary-foreground/80">
                  {shopConfig.address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gold" />
                <a href={`tel:${shopConfig.phone}`} className="text-primary-foreground/80 hover:text-gold transition-colors">
                  {shopConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gold" />
                <a href={`mailto:${shopConfig.email}`} className="text-primary-foreground/80 hover:text-gold transition-colors">
                  {shopConfig.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-6 text-gold">Follow Us</h4>
            <div className="flex gap-4">
              {shopConfig.socialLinks?.facebook && (
                <a
                  href={shopConfig.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-walnut-dark transition-all duration-300"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {shopConfig.socialLinks?.instagram && (
                <a
                  href={shopConfig.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-walnut-dark transition-all duration-300"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {shopConfig.socialLinks?.twitter && (
                <a
                  href={shopConfig.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-walnut-dark transition-all duration-300"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
            <div className="mt-6">
              <p className="text-sm text-primary-foreground/60">
                Subscribe to our newsletter for exclusive offers
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
          <p className="text-primary-foreground/60 text-sm">
            © {new Date().getFullYear()} {shopConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
