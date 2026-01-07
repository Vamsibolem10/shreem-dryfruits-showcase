import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
  categories: string[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Cashews',
    description: 'Hand-picked, roasted cashews with perfect crunch. Rich in nutrients and protein.',
    price: 899,
    originalPrice: 1099,
    image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=500',
    category: 'Nuts',
    weight: '500g',
    inStock: true,
    featured: true,
  },
  {
    id: '2',
    name: 'Organic Almonds',
    description: 'Premium California almonds, rich in Vitamin E and healthy fats.',
    price: 749,
    originalPrice: 899,
    image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500',
    category: 'Nuts',
    weight: '500g',
    inStock: true,
    featured: true,
  },
  {
    id: '3',
    name: 'Golden Raisins',
    description: 'Sweet, golden raisins perfect for snacking or baking.',
    price: 299,
    image: 'https://images.unsplash.com/photo-1596273501048-2e5c667a5c9a?w=500',
    category: 'Dried Fruits',
    weight: '250g',
    inStock: true,
  },
  {
    id: '4',
    name: 'Medjool Dates',
    description: 'Luxuriously soft and sweet dates, nature\'s perfect candy.',
    price: 599,
    image: 'https://images.unsplash.com/photo-1593904308685-9c5c9d1c8a66?w=500',
    category: 'Dried Fruits',
    weight: '400g',
    inStock: true,
    featured: true,
  },
  {
    id: '5',
    name: 'Pistachio Kernels',
    description: 'Premium Iranian pistachios, shelled for convenience.',
    price: 1299,
    originalPrice: 1499,
    image: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=500',
    category: 'Nuts',
    weight: '400g',
    inStock: true,
  },
  {
    id: '6',
    name: 'Dried Apricots',
    description: 'Sun-dried Turkish apricots, naturally sweet and tangy.',
    price: 449,
    image: 'https://images.unsplash.com/photo-1599789197514-47270cd526b4?w=500',
    category: 'Dried Fruits',
    weight: '300g',
    inStock: true,
  },
  {
    id: '7',
    name: 'Walnuts Halves',
    description: 'Premium walnut halves, brain-shaped and brain-healthy.',
    price: 699,
    image: 'https://images.unsplash.com/photo-1563412885-139e4045ec84?w=500',
    category: 'Nuts',
    weight: '400g',
    inStock: true,
  },
  {
    id: '8',
    name: 'Mixed Dry Fruits',
    description: 'Premium assortment of our finest nuts and dried fruits.',
    price: 999,
    originalPrice: 1199,
    image: 'https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=500',
    category: 'Gift Boxes',
    weight: '500g',
    inStock: true,
    featured: true,
  },
];

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('shreemProducts');
    if (stored) {
      setProducts(JSON.parse(stored));
    } else {
      setProducts(defaultProducts);
      localStorage.setItem('shreemProducts', JSON.stringify(defaultProducts));
    }
  }, []);

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('shreemProducts', JSON.stringify(newProducts));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now().toString() };
    saveProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    saveProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    saveProducts(products.filter(p => p.id !== id));
  };

  const getProduct = (id: string) => products.find(p => p.id === id);

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      getProduct,
      categories,
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
