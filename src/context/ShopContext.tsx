import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ShopConfig } from '@/types';

interface ShopContextType {
  shopConfig: ShopConfig | null;
  updateShopConfig: (config: Partial<ShopConfig>) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const defaultShopConfig: ShopConfig = {
  id: '1',
  name: 'Shreem Nuts N Fruits',
  phone: '+91 9876543210',
  email: 'contact@shreemnutsnfruits.com',
  address: '123 Main Street, Mumbai, Maharashtra 400001',
  gstNumber: '',
  panNumber: '',
  isActive: true,
  taxSettings: {
    cgst: 2.5,
    sgst: 2.5,
    igst: 5,
    isInclusive: false,
  },
  quickLinks: {
    home: 'Home',
    products: 'Products',
    about: 'About Us',
    orders: 'Track Order',
  },
  socialLinks: {
    facebook: '#',
    instagram: '#',
    twitter: '#',
  },
  footerDescription: 'Bringing you the finest quality dry fruits and nuts from around the world since 2010.',
};

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [shopConfig, setShopConfig] = useState<ShopConfig | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('shopConfig');
    if (saved) {
      setShopConfig(JSON.parse(saved));
    } else {
      setShopConfig(defaultShopConfig);
      localStorage.setItem('shopConfig', JSON.stringify(defaultShopConfig));
    }
  }, []);

  const updateShopConfig = (config: Partial<ShopConfig>) => {
    if (shopConfig) {
      const updated = { ...shopConfig, ...config };
      setShopConfig(updated);
      localStorage.setItem('shopConfig', JSON.stringify(updated));
    }
  };

  return (
    <ShopContext.Provider value={{ shopConfig, updateShopConfig }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};