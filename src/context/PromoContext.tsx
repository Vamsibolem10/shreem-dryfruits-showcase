import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Coupon, Banner } from '@/types';

interface PromoContextType {
  coupons: Coupon[];
  banners: Banner[];
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  validateCoupon: (code: string, orderTotal: number) => { valid: boolean; discount: number; message: string };
  addBanner: (banner: Omit<Banner, 'id'>) => void;
  updateBanner: (id: string, banner: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  getActiveBanners: () => Banner[];
}

const PromoContext = createContext<PromoContextType | undefined>(undefined);

const defaultCoupons: Coupon[] = [
  {
    id: '1',
    code: 'WELCOME10',
    discountPercent: 10,
    minOrderAmount: 500,
    maxDiscount: 200,
    validUntil: '2026-03-31T23:59:59Z',
    isActive: true,
  },
  {
    id: '2',
    code: 'SHREEM20',
    discountPercent: 20,
    minOrderAmount: 1000,
    maxDiscount: 500,
    validUntil: '2026-02-28T23:59:59Z',
    isActive: true,
  },
  {
    id: '3',
    code: 'DIWALI25',
    discountPercent: 25,
    minOrderAmount: 1500,
    maxDiscount: 750,
    validUntil: '2026-11-15T23:59:59Z',
    isActive: true,
  },
];

const defaultBanners: Banner[] = [
  {
    id: '1',
    title: '🎉 New Year Sale - 20% OFF!',
    subtitle: 'Use code SHREEM20 on orders above ₹1000',
    image: '',
    link: '/products',
    isActive: true,
  },
  {
    id: '2',
    title: '🥜 Free Shipping on All Orders',
    subtitle: 'No minimum order required. Limited time offer!',
    image: '',
    link: '/products',
    isActive: true,
  },
];

export function PromoProvider({ children }: { children: ReactNode }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    const storedCoupons = localStorage.getItem('shreemCoupons');
    if (storedCoupons) {
      setCoupons(JSON.parse(storedCoupons));
    } else {
      setCoupons(defaultCoupons);
      localStorage.setItem('shreemCoupons', JSON.stringify(defaultCoupons));
    }

    const storedBanners = localStorage.getItem('shreemBanners');
    if (storedBanners) {
      setBanners(JSON.parse(storedBanners));
    } else {
      setBanners(defaultBanners);
      localStorage.setItem('shreemBanners', JSON.stringify(defaultBanners));
    }
  }, []);

  const saveCoupons = (newCoupons: Coupon[]) => {
    setCoupons(newCoupons);
    localStorage.setItem('shreemCoupons', JSON.stringify(newCoupons));
  };

  const saveBanners = (newBanners: Banner[]) => {
    setBanners(newBanners);
    localStorage.setItem('shreemBanners', JSON.stringify(newBanners));
  };

  const addCoupon = (coupon: Omit<Coupon, 'id'>) => {
    const newCoupon = { ...coupon, id: Date.now().toString() };
    saveCoupons([...coupons, newCoupon]);
  };

  const updateCoupon = (id: string, updates: Partial<Coupon>) => {
    saveCoupons(coupons.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCoupon = (id: string) => {
    saveCoupons(coupons.filter(c => c.id !== id));
  };

  const validateCoupon = (code: string, orderTotal: number) => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    
    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid coupon code' };
    }

    if (!coupon.isActive) {
      return { valid: false, discount: 0, message: 'This coupon is no longer active' };
    }

    if (new Date(coupon.validUntil) < new Date()) {
      return { valid: false, discount: 0, message: 'This coupon has expired' };
    }

    if (orderTotal < coupon.minOrderAmount) {
      return { valid: false, discount: 0, message: `Minimum order amount is ₹${coupon.minOrderAmount}` };
    }

    const discount = Math.min(
      (orderTotal * coupon.discountPercent) / 100,
      coupon.maxDiscount
    );

    return { 
      valid: true, 
      discount: Math.round(discount), 
      message: `${coupon.discountPercent}% off applied! You save ₹${Math.round(discount)}` 
    };
  };

  const addBanner = (banner: Omit<Banner, 'id'>) => {
    const newBanner = { ...banner, id: Date.now().toString() };
    saveBanners([...banners, newBanner]);
  };

  const updateBanner = (id: string, updates: Partial<Banner>) => {
    saveBanners(banners.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBanner = (id: string) => {
    saveBanners(banners.filter(b => b.id !== id));
  };

  const getActiveBanners = () => {
    return banners.filter(b => b.isActive);
  };

  return (
    <PromoContext.Provider value={{
      coupons,
      banners,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      validateCoupon,
      addBanner,
      updateBanner,
      deleteBanner,
      getActiveBanners,
    }}>
      {children}
    </PromoContext.Provider>
  );
}

export function usePromo() {
  const context = useContext(PromoContext);
  if (context === undefined) {
    throw new Error('usePromo must be used within a PromoProvider');
  }
  return context;
}
