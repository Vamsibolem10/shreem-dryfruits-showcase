import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Order } from '@/types';
import { useAuth } from './AuthContext';
import { emailService } from '@/lib/emailService';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const storedCart = localStorage.getItem('shreemCart');
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }

    const storedOrders = localStorage.getItem('shreemOrders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('shreemCart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('shreemOrders', JSON.stringify(orders));
  }, [orders]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const addOrder = async (order: Order) => {
    setOrders(prev => [order, ...prev]);
    clearCart();
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status } : o
    ));

    // Send email notification
    try {
      const emailSent = await emailService.sendOrderStatusUpdateEmail(
        { ...order, status },
        order.userEmail,
        order.userName
      );
      if (emailSent) {
        toast.success(`Order status updated and email sent to ${order.userEmail}`);
      } else {
        toast.warning('Order status updated but email failed to send');
      }
    } catch (error) {
      console.error('Failed to send email notification:', error);
      toast.warning('Order status updated but email notification failed');
    }
  };

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      itemCount,
      orders,
      addOrder,
      updateOrderStatus,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
