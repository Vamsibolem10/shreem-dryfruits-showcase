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

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  name: string;
  address?: string;
  role: 'admin' | 'employee' | 'customer';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface BillItem {
  product: Product;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
  paymentId?: string;
  paymentMethod: 'cod';
  couponCode?: string;
  discount?: number;
  deliveryAddress?: Address;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  locationDetails?: string;
  isDefault: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  minOrderAmount: number;
  maxDiscount: number;
  validUntil: string;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  isActive: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
  isActive: boolean;
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
  isActive: boolean;
}

export interface HeroContent {
  id: string;
  badge: string;
  heading: string;
  subheading: string;
  description: string;
  backgroundImage: string;
  isActive: boolean;
}

export interface ShopConfig {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  gstNumber?: string;
  panNumber?: string;
  isActive: boolean;
  // Tax configuration
  taxSettings?: {
    cgst: number;
    sgst: number;
    igst: number;
    isInclusive: boolean;
  };
  // Footer configuration
  quickLinks?: {
    home: string;
    products: string;
    about: string;
    orders: string;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  footerDescription?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  customerName: string;
  customerPhone: string;
  total: number;
  date: string;
  read: boolean;
}
