export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  weight: string;
  inStock: boolean;
  featured?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'customer';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
  paymentId?: string;
}
