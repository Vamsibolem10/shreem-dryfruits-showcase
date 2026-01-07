import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <Link to={`/products/${product.id}`} className="group">
      <div className="card-premium bg-card rounded-2xl overflow-hidden border border-border">
        {/* Image Container */}
        <div className="relative aspect-square image-zoom">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          
          {/* Discount Badge */}
          {discount && (
            <div className="absolute top-4 left-4 bg-gradient-gold text-walnut-dark text-sm font-bold px-3 py-1 rounded-full shadow-gold">
              -{discount}%
            </div>
          )}

          {/* Featured Badge */}
          {product.featured && (
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              Featured
            </div>
          )}

          {/* Hover Actions */}
          <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <Button
              size="icon"
              className="rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 bg-[hsl(42,75%,55%)] text-[hsl(25,30%,15%)] hover:bg-[hsl(42,70%,50%)]"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
            >
              <Eye className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-sm text-gold font-medium mb-1">{product.category}</p>
          <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">{product.weight}</p>
          
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xl font-bold text-foreground">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-muted-foreground line-through text-sm">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {!product.inStock && (
            <p className="mt-2 text-destructive text-sm font-medium">Out of Stock</p>
          )}
        </div>
      </div>
    </Link>
  );
}
