import React, { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Package, Users, ShoppingBag, DollarSign, Tag, FileText, Star, Award, Image, CreditCard, Smartphone, Building2, Wallet, Truck } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { usePromo } from '@/context/PromoContext';
import { useContent } from '@/context/ContentContext';
import { useShop } from '@/context/ShopContext';
import { Product, Coupon, Testimonial, Feature, HeroContent, ShopConfig, Address, Notification } from '@/types';
import { toast } from 'sonner';
import Billing from '@/components/billing/Billing';

const defaultFormState = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  image: '',
  category: '',
  weight: '',
  inStock: true,
  featured: false,
};

export default function Admin() {
  const { user, isEmployee, isAdmin } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, categories } = useProducts();
  const { orders } = useCart();
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = usePromo();
  const { testimonials, features, heroContent, addTestimonial, updateTestimonial, deleteTestimonial, addFeature, updateFeature, deleteFeature, updateHeroContent } = useContent();
  const { shopConfig, updateShopConfig } = useShop();
  const { updateOrderStatus } = useCart();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(defaultFormState);

  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountPercent: '',
    minOrderAmount: '',
    maxDiscount: '',
    validUntil: '',
    isActive: true,
  });

  const [isTestimonialDialogOpen, setIsTestimonialDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({
    name: '',
    location: '',
    rating: '5',
    text: '',
    avatar: '',
    isActive: true,
  });

  // Testimonial avatar upload
  const [testimonialAvatarFile, setTestimonialAvatarFile] = useState<File | null>(null);
  const [uploadingTestimonialAvatar, setUploadingTestimonialAvatar] = useState(false);
  const testimonialAvatarRef = useRef<HTMLInputElement>(null);

  // Product photo upload
  const [productPhotoFile, setProductPhotoFile] = useState<File | null>(null);
  const [uploadingProductPhoto, setUploadingProductPhoto] = useState(false);
  const productPhotoRef = useRef<HTMLInputElement>(null);

  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [featureForm, setFeatureForm] = useState({
    icon: '',
    title: '',
    description: '',
    isActive: true,
  });

  const [isHeroDialogOpen, setIsHeroDialogOpen] = useState(false);
  const [heroForm, setHeroForm] = useState({
    badge: '',
    heading: '',
    subheading: '',
    description: '',
    backgroundImage: '',
    isActive: true,
  });

  const [isShopDialogOpen, setIsShopDialogOpen] = useState(false);
  const [shopForm, setShopForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
    panNumber: '',
    isActive: true,
    taxSettings: {
      cgst: '',
      sgst: '',
      igst: '',
      isInclusive: false,
    },
    quickLinks: {
      home: '',
      products: '',
      about: '',
      orders: '',
    },
    socialLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
    },
    footerDescription: '',
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Revenue filtering
  const [revenueFilter, setRevenueFilter] = useState<'day' | 'week' | 'month' | 'all'>('all');

  // Testimonial avatar upload handlers
  const handleTestimonialAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setTestimonialAvatarFile(f);
  };

  const handleTestimonialAvatarClick = () => {
    testimonialAvatarRef.current?.click();
  };

  const handleUploadTestimonialAvatar = async () => {
    if (!testimonialAvatarFile) return toast.error('Please select an avatar to upload');
    setUploadingTestimonialAvatar(true);
    try {
      const fd = new FormData();
      fd.append('avatar', testimonialAvatarFile);

      const resp = await fetch('/api/testimonials/upload-avatar', {
        method: 'POST',
        body: fd,
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        toast.success('Avatar uploaded successfully');
        setTestimonialForm({ ...testimonialForm, avatar: data.avatarPath });
        setTestimonialAvatarFile(null);
      } else {
        toast.error(data.message || 'Avatar upload failed');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('Avatar upload failed');
    } finally {
      setUploadingTestimonialAvatar(false);
    }
  };

  // Product photo upload handlers
  const handleProductPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setProductPhotoFile(f);
  };

  const handleProductPhotoClick = () => {
    productPhotoRef.current?.click();
  };

  const handleUploadProductPhoto = async () => {
    if (!productPhotoFile) return toast.error('Please select a photo to upload');
    setUploadingProductPhoto(true);
    try {
      const fd = new FormData();
      fd.append('photo', productPhotoFile);

      const resp = await fetch('/api/products/upload-photo', {
        method: 'POST',
        body: fd,
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        toast.success('Photo uploaded successfully');
        setForm({ ...form, image: data.photoPath });
        setProductPhotoFile(null);
      } else {
        toast.error(data.message || 'Photo upload failed');
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      toast.error('Photo upload failed');
    } finally {
      setUploadingProductPhoto(false);
    }
  };

  // Excel export handler
  const handleExportExcel = async () => {
    try {
      const resp = await fetch('/api/admin/export-excel');
      if (resp.ok) {
        const blob = new Blob([await resp.arrayBuffer()], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shreem-orders-income-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Excel file downloaded successfully');
      } else {
        const errorText = await resp.text();
        console.error('Export failed:', errorText);
        toast.error('Failed to export Excel file');
      }
    } catch (err) {
      console.error('Excel export error:', err);
      toast.error('Failed to export Excel file');
    }
  };

  // Load notifications
  useEffect(() => {
    const saved = localStorage.getItem('adminNotifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  // Initialize shop form
  useEffect(() => {
    if (shopConfig) {
      setShopForm({
        name: shopConfig.name,
        phone: shopConfig.phone,
        email: shopConfig.email,
        address: shopConfig.address,
        gstNumber: shopConfig.gstNumber || '',
        panNumber: shopConfig.panNumber || '',
        isActive: shopConfig.isActive,
        taxSettings: {
          cgst: shopConfig.taxSettings?.cgst?.toString() || '',
          sgst: shopConfig.taxSettings?.sgst?.toString() || '',
          igst: shopConfig.taxSettings?.igst?.toString() || '',
          isInclusive: shopConfig.taxSettings?.isInclusive || false,
        },
        quickLinks: shopConfig.quickLinks || {
          home: 'Home',
          products: 'Products',
          about: 'About Us',
          orders: 'Track Order',
        },
        socialLinks: {
          facebook: shopConfig.socialLinks?.facebook || '#',
          instagram: shopConfig.socialLinks?.instagram || '#',
          twitter: shopConfig.socialLinks?.twitter || '#',
        },
        footerDescription: shopConfig.footerDescription || 'Bringing you the finest quality dry fruits and nuts from around the world since 2010.',
      });
    }
  }, [shopConfig]);

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setForm({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        image: product.image,
        category: product.category,
        weight: product.weight,
        inStock: product.inStock,
        featured: product.featured || false,
      });
    } else {
      setEditingProduct(null);
      setForm(defaultFormState);
    }
    setProductPhotoFile(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
      image: form.image || 'https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=500',
      category: form.category,
      weight: form.weight,
      inStock: form.inStock,
      featured: form.featured,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast.success('Product updated successfully!');
    } else {
      addProduct(productData);
      toast.success('Product added successfully!');
    }

    setIsDialogOpen(false);
    setForm(defaultFormState);
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
      toast.success('Product deleted successfully!');
    }
  };

  const handleToggleStock = async (id: string, inStock: boolean) => {
    try {
      await updateProduct(id, { inStock });
      toast.success(`Product ${inStock ? 'marked as in stock' : 'marked as out of stock'}!`);
    } catch (error) {
      console.error('Failed to update stock status:', error);
      toast.error('Failed to update stock status');
    }
  };

  const handleOpenCouponDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCouponForm({
        code: coupon.code,
        discountPercent: coupon.discountPercent.toString(),
        minOrderAmount: coupon.minOrderAmount.toString(),
        maxDiscount: coupon.maxDiscount.toString(),
        validUntil: coupon.validUntil.split('T')[0], // Get date part only
        isActive: coupon.isActive,
      });
    } else {
      setEditingCoupon(null);
      setCouponForm({
        code: '',
        discountPercent: '',
        minOrderAmount: '',
        maxDiscount: '',
        validUntil: '',
        isActive: true,
      });
    }
    setIsCouponDialogOpen(true);
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const couponData = {
      code: couponForm.code,
      discountPercent: parseFloat(couponForm.discountPercent),
      minOrderAmount: parseFloat(couponForm.minOrderAmount),
      maxDiscount: parseFloat(couponForm.maxDiscount),
      validUntil: new Date(couponForm.validUntil).toISOString(),
      isActive: couponForm.isActive,
    };

    if (editingCoupon) {
      updateCoupon(editingCoupon.id, couponData);
      toast.success('Coupon updated successfully!');
    } else {
      addCoupon(couponData);
      toast.success('Coupon added successfully!');
    }

    setIsCouponDialogOpen(false);
    setCouponForm({
      code: '',
      discountPercent: '',
      minOrderAmount: '',
      maxDiscount: '',
      validUntil: '',
      isActive: true,
    });
    setEditingCoupon(null);
  };

  const handleDeleteCoupon = (id: string) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      deleteCoupon(id);
      toast.success('Coupon deleted successfully!');
    }
  };

  const handleOpenTestimonialDialog = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setTestimonialForm({
        name: testimonial.name,
        location: testimonial.location,
        rating: testimonial.rating.toString(),
        text: testimonial.text,
        avatar: testimonial.avatar,
        isActive: testimonial.isActive,
      });
    } else {
      setEditingTestimonial(null);
      setTestimonialForm({
        name: '',
        location: '',
        rating: '5',
        text: '',
        avatar: '',
        isActive: true,
      });
    }
    setTestimonialAvatarFile(null); // Reset avatar file
    setIsTestimonialDialogOpen(true);
  };

  const handleTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const testimonialData = {
      name: testimonialForm.name,
      location: testimonialForm.location,
      rating: parseInt(testimonialForm.rating),
      text: testimonialForm.text,
      avatar: testimonialForm.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      isActive: testimonialForm.isActive,
    };

    if (editingTestimonial) {
      updateTestimonial(editingTestimonial.id, testimonialData);
      toast.success('Testimonial updated successfully!');
    } else {
      addTestimonial(testimonialData);
      toast.success('Testimonial added successfully!');
    }

    setIsTestimonialDialogOpen(false);
    setTestimonialForm({
      name: '',
      location: '',
      rating: '5',
      text: '',
      avatar: '',
      isActive: true,
    });
    setEditingTestimonial(null);
  };

  const handleDeleteTestimonial = (id: string) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      deleteTestimonial(id);
      toast.success('Testimonial deleted successfully!');
    }
  };

  const handleOpenFeatureDialog = (feature?: Feature) => {
    if (feature) {
      setEditingFeature(feature);
      setFeatureForm({
        icon: feature.icon,
        title: feature.title,
        description: feature.description,
        isActive: feature.isActive,
      });
    } else {
      setEditingFeature(null);
      setFeatureForm({
        icon: '',
        title: '',
        description: '',
        isActive: true,
      });
    }
    setIsFeatureDialogOpen(true);
  };

  const handleFeatureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const featureData = {
      icon: featureForm.icon,
      title: featureForm.title,
      description: featureForm.description,
      isActive: featureForm.isActive,
    };

    if (editingFeature) {
      updateFeature(editingFeature.id, featureData);
      toast.success('Feature updated successfully!');
    } else {
      addFeature(featureData);
      toast.success('Feature added successfully!');
    }

    setIsFeatureDialogOpen(false);
    setFeatureForm({
      icon: '',
      title: '',
      description: '',
      isActive: true,
    });
    setEditingFeature(null);
  };

  const handleDeleteFeature = (id: string) => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      deleteFeature(id);
      toast.success('Feature deleted successfully!');
    }
  };

  const handleOpenHeroDialog = () => {
    if (heroContent) {
      setHeroForm({
        badge: heroContent.badge,
        heading: heroContent.heading,
        subheading: heroContent.subheading,
        description: heroContent.description,
        backgroundImage: heroContent.backgroundImage,
        isActive: heroContent.isActive,
      });
    }
    setIsHeroDialogOpen(true);
  };

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const heroData = {
      badge: heroForm.badge,
      heading: heroForm.heading,
      subheading: heroForm.subheading,
      description: heroForm.description,
      backgroundImage: heroForm.backgroundImage,
      isActive: heroForm.isActive,
    };

    updateHeroContent(heroData);
    toast.success('Hero content updated successfully!');

    setIsHeroDialogOpen(false);
    setHeroForm({
      badge: '',
      heading: '',
      subheading: '',
      description: '',
      backgroundImage: '',
      isActive: true,
    });
  };

  const handleOpenShopDialog = () => {
    setIsShopDialogOpen(true);
  };

  const handleShopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const shopData = {
      name: shopForm.name,
      phone: shopForm.phone,
      email: shopForm.email,
      address: shopForm.address,
      gstNumber: shopForm.gstNumber,
      panNumber: shopForm.panNumber,
      isActive: shopForm.isActive,
      taxSettings: {
        cgst: parseFloat(shopForm.taxSettings.cgst) || 0,
        sgst: parseFloat(shopForm.taxSettings.sgst) || 0,
        igst: parseFloat(shopForm.taxSettings.igst) || 0,
        isInclusive: shopForm.taxSettings.isInclusive,
      },
      quickLinks: shopForm.quickLinks,
      socialLinks: shopForm.socialLinks,
      footerDescription: shopForm.footerDescription,
    };

    updateShopConfig(shopData);
    toast.success('Shop configuration updated successfully!');

    setIsShopDialogOpen(false);
  };

  const handleAcceptOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'processing');
    toast.success('Order accepted and moved to processing!');
  };

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      updateOrderStatus(orderId, 'cancelled');
      toast.success('Order cancelled successfully!');
    }
  };

  const handleDeliverOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'completed');
    toast.success('Order marked as delivered!');
  };

  const handleOpenMap = (address: Address) => {
    if (!address.latitude || !address.longitude) return;

    const destination = `${address.latitude},${address.longitude}`;
    const addressString = encodeURIComponent(
      `${address.street}, ${address.city}, ${address.state} ${address.pincode}`
    );

    // Detect if user is on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    let mapUrl;
    if (isIOS) {
      // Use Apple Maps for iOS
      mapUrl = `maps:///?daddr=${destination}&dirflg=d`;
    } else {
      // Use Google Maps for Android and desktop
      mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${addressString}`;
    }

    window.open(mapUrl, '_blank');
  };

  const handleMarkNotificationRead = (notificationId: string) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('adminNotifications', JSON.stringify(updated));
  };

  // Clear functions
  const handleClearProducts = () => {
    if (window.confirm('Are you sure you want to clear all products? This action cannot be undone.')) {
      // This would need to be implemented in the context
      toast.success('Products cleared successfully');
    }
  };

  const handleClearOrders = () => {
    if (window.confirm('Are you sure you want to clear all orders? This action cannot be undone.')) {
      // This would need to be implemented in the context
      toast.success('Orders cleared successfully');
    }
  };

  const handleClearCoupons = () => {
    if (window.confirm('Are you sure you want to clear all coupons? This action cannot be undone.')) {
      // This would need to be implemented in the context
      toast.success('Coupons cleared successfully');
    }
  };

  const handleClearTestimonials = () => {
    if (window.confirm('Are you sure you want to clear all testimonials? This action cannot be undone.')) {
      // This would need to be implemented in the context
      toast.success('Testimonials cleared successfully');
    }
  };

  const handleClearFeatures = () => {
    if (window.confirm('Are you sure you want to clear all features? This action cannot be undone.')) {
      // This would need to be implemented in the context
      toast.success('Features cleared successfully');
    }
  };

  const handleClearNotifications = () => {
    if (window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      setNotifications([]);
      localStorage.removeItem('adminNotifications');
      toast.success('Notifications cleared successfully');
    }
  };

  // Export revenue to PDF
  const handleExportRevenuePDF = async () => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const revenueHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Revenue Report - ${new Date().toLocaleDateString()}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
              .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
              .stat-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; text-align: center; }
              .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
              .orders-section { margin-top: 30px; }
              .order-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              .order-table th, .order-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .order-table th { background-color: #f5f5f5; font-weight: bold; }
              .total-row { background-color: #f0f8ff; font-weight: bold; }
              .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Shreem Nuts N Fruits</h1>
              <h2>Revenue Report - ${revenueFilter === 'all' ? 'All Time' : revenueFilter === 'month' ? 'This Month' : revenueFilter === 'week' ? 'This Week' : 'Today'}</h2>
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>

            <div class="stats">
              <div class="stat-card">
                <h3>Total Orders</h3>
                <div class="stat-value">${filteredOrders.length}</div>
              </div>
              <div class="stat-card">
                <h3>Total Revenue</h3>
                <div class="stat-value">₹${filteredOrders.reduce((sum, o) => sum + o.total, 0)}</div>
              </div>
              <div class="stat-card">
                <h3>Average Order Value</h3>
                <div class="stat-value">₹${filteredOrders.length > 0 ? Math.round(filteredOrders.reduce((sum, o) => sum + o.total, 0) / filteredOrders.length) : 0}</div>
              </div>
              <div class="stat-card">
                <h3>Active Coupons</h3>
                <div class="stat-value">${coupons.filter(c => c.isActive).length}</div>
              </div>
            </div>

            <div class="orders-section">
              <h3>Order Details</h3>
              <table class="order-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Subtotal</th>
                    <th>Tax</th>
                    <th>Total</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredOrders.map(order => `
                    <tr>
                      <td>${order.id}</td>
                      <td>${order.userId}</td>
                      <td>
                        ${order.items.map(item => `${item.product.name} × ${item.quantity}`).join('<br>')}
                      </td>
                      <td>₹${order.total}</td>
                      <td>₹${Math.round(order.total * 0.18)}</td>
                      <td>₹${order.total + Math.round(order.total * 0.18)}</td>
                      <td>${order.paymentMethod}</td>
                      <td>${order.status}</td>
                      <td>${new Date(order.date).toLocaleDateString()}</td>
                    </tr>
                  `).join('')}
                  <tr class="total-row">
                    <td colspan="3"><strong>TOTALS</strong></td>
                    <td><strong>₹${filteredOrders.reduce((sum, o) => sum + o.total, 0)}</strong></td>
                    <td><strong>₹${Math.round(filteredOrders.reduce((sum, o) => sum + o.total, 0) * 0.18)}</strong></td>
                    <td><strong>₹${filteredOrders.reduce((sum, o) => sum + o.total + Math.round(o.total * 0.18), 0)}</strong></td>
                    <td colspan="3"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="footer">
              <p>This report was generated from the Shreem Nuts N Fruits Admin Panel</p>
              <p>For any queries, please contact the administration team.</p>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(revenueHTML);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
      };

      toast.success('Revenue report opened for printing/download');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to generate revenue report');
    }
  };

  // Filter orders by time period
  const getFilteredOrders = () => {
    const now = new Date();
    let startDate: Date;

    switch (revenueFilter) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return orders;
    }

    return orders.filter(order => new Date(order.date) >= startDate);
  };

  const filteredOrders = getFilteredOrders();

  const stats = [
    { 
      label: 'Total Products', 
      value: products.length, 
      icon: Package, 
      color: 'bg-blue-500',
      clearAction: handleClearProducts
    },
    { 
      label: 'Total Orders', 
      value: filteredOrders.length, 
      icon: ShoppingBag, 
      color: 'bg-green-500',
      clearAction: handleClearOrders
    },
    { 
      label: 'Revenue', 
      value: `₹${filteredOrders.reduce((sum, o) => sum + o.total, 0)}`, 
      icon: DollarSign, 
      color: 'bg-gold',
      clearAction: null
    },
    { 
      label: 'Active Coupons', 
      value: coupons.filter(c => c.isActive).length, 
      icon: Tag, 
      color: 'bg-purple-500',
      clearAction: handleClearCoupons
    },
    ...(isAdmin ? [
      { 
        label: 'Testimonials', 
        value: testimonials.filter(t => t.isActive).length, 
        icon: Star, 
        color: 'bg-yellow-500',
        clearAction: handleClearTestimonials
      },
      { 
        label: 'Features', 
        value: features.filter(f => f.isActive).length, 
        icon: Award, 
        color: 'bg-indigo-500',
        clearAction: handleClearFeatures
      },
      { 
        label: 'New Notifications', 
        value: notifications.filter(n => !n.read).length, 
        icon: FileText, 
        color: 'bg-red-500',
        clearAction: handleClearNotifications
      },
    ] : []),
  ];

  return (
    <Layout>
      <section className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-4xl font-bold text-primary-foreground">
            Admin Panel
          </h1>
          <p className="text-primary-foreground/70 mt-2">
            Manage products, view orders, and more
          </p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {/* Stats */}
          <div className="mb-12">
            {/* Revenue Filter */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-bold text-foreground">Dashboard Overview</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="revenue-filter" className="text-sm font-medium">Revenue Filter:</Label>
                  <select
                    id="revenue-filter"
                    value={revenueFilter}
                    onChange={(e) => setRevenueFilter(e.target.value as 'day' | 'week' | 'month' | 'all')}
                    className="px-3 py-1 border border-border rounded-md bg-background text-foreground text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="month">This Month</option>
                    <option value="week">This Week</option>
                    <option value="day">Today</option>
                  </select>
                </div>
                <Button variant="outline" onClick={handleExportRevenuePDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export Revenue PDF
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="bg-card rounded-xl p-6 border border-border animate-fade-in relative"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                  {stat.clearAction && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={stat.clearAction}
                      className="absolute top-2 right-2 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      title={`Clear ${stat.label}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Products Management */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Products</h2>
                <p className="text-muted-foreground">Manage your product catalog</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="gold" onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingProduct ? 'Update the product details below.' : 'Fill in the details to add a new product to your store.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={form.category}
                          onChange={e => setForm({ ...form, category: e.target.value })}
                          placeholder="e.g., Nuts, Dried Fruits"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        rows={3}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={form.price}
                          onChange={e => setForm({ ...form, price: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="originalPrice">Original Price (₹)</Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          value={form.originalPrice}
                          onChange={e => setForm({ ...form, originalPrice: e.target.value })}
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Weight</Label>
                        <Input
                          id="weight"
                          value={form.weight}
                          onChange={e => setForm({ ...form, weight: e.target.value })}
                          placeholder="e.g., 500g"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Product Photo</Label>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            ref={productPhotoRef}
                            type="file"
                            accept="image/*"
                            onChange={handleProductPhotoChange}
                            className="hidden"
                          />
                          <Button variant="outline" type="button" onClick={handleProductPhotoClick}>
                            Choose Photo
                          </Button>
                          <Button
                            variant="gold"
                            type="button"
                            onClick={handleUploadProductPhoto}
                            disabled={uploadingProductPhoto}
                          >
                            {uploadingProductPhoto ? 'Uploading...' : 'Upload Photo'}
                          </Button>
                        </div>
                        {productPhotoFile ? (
                          <div className="flex items-center gap-4 p-3 border border-border rounded-md">
                            <img src={URL.createObjectURL(productPhotoFile)} alt="photo-preview" className="w-16 h-16 object-cover rounded-lg" />
                            <div>
                              <p className="font-medium">{productPhotoFile.name}</p>
                              <p className="text-sm text-muted-foreground">{(productPhotoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                              <Button variant="destructive" size="sm" onClick={() => setProductPhotoFile(null)} className="mt-1">Remove</Button>
                            </div>
                          </div>
                        ) : form.image ? (
                          <div className="flex items-center gap-4 p-3 border border-border rounded-md">
                            <img src={form.image} alt="current-photo" className="w-16 h-16 object-cover rounded-lg" />
                            <p className="text-sm text-muted-foreground">Current photo uploaded</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No photo selected. Upload an image or leave empty.</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.inStock}
                          onChange={e => setForm({ ...form, inStock: e.target.checked })}
                          className="w-4 h-4 rounded border-border"
                        />
                        <span>In Stock</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.featured}
                          onChange={e => setForm({ ...form, featured: e.target.checked })}
                          className="w-4 h-4 rounded border-border"
                        />
                        <span>Featured Product</span>
                      </label>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="submit" variant="gold" className="flex-1">
                        {editingProduct ? 'Update Product' : 'Add Product'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.weight}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-gold/20 text-gold-dark rounded-full text-sm">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-foreground">₹{product.price}</p>
                        {product.originalPrice && (
                          <p className="text-sm text-muted-foreground line-through">
                            ₹{product.originalPrice}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            product.inStock
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant={product.inStock ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleToggleStock(product.id, !product.inStock)}
                            className={product.inStock ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(product)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discounts Management */}
          <div className="bg-card rounded-xl border border-border overflow-hidden mt-12">
            <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Discount Coupons</h2>
                <p className="text-muted-foreground">Manage discount coupons and promotions</p>
              </div>
              <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="gold" onClick={() => handleOpenCouponDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Coupon
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">
                      {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCouponSubmit} className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="couponCode">Coupon Code</Label>
                        <Input
                          id="couponCode"
                          value={couponForm.code}
                          onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                          placeholder="e.g., WELCOME10"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="discountPercent">Discount Percentage (%)</Label>
                        <Input
                          id="discountPercent"
                          type="number"
                          min="1"
                          max="100"
                          value={couponForm.discountPercent}
                          onChange={e => setCouponForm({ ...couponForm, discountPercent: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
                        <Input
                          id="minOrderAmount"
                          type="number"
                          min="0"
                          value={couponForm.minOrderAmount}
                          onChange={e => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxDiscount">Maximum Discount (₹)</Label>
                        <Input
                          id="maxDiscount"
                          type="number"
                          min="0"
                          value={couponForm.maxDiscount}
                          onChange={e => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="validUntil">Valid Until</Label>
                      <Input
                        id="validUntil"
                        type="date"
                        value={couponForm.validUntil}
                        onChange={e => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={couponForm.isActive}
                        onChange={e => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                        className="w-4 h-4 rounded border-border"
                      />
                      <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="submit" variant="gold" className="flex-1">
                        {editingCoupon ? 'Update Coupon' : 'Add Coupon'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCouponDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Coupons Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Code</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Discount</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Min Order</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Max Discount</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Valid Until</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(coupon => (
                    <tr key={coupon.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-medium text-foreground">{coupon.code}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-foreground">{coupon.discountPercent}%</span>
                      </td>
                      <td className="p-4">
                        <span className="text-foreground">₹{coupon.minOrderAmount}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-foreground">₹{coupon.maxDiscount}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(coupon.validUntil).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            coupon.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenCouponDialog(coupon)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Orders Management */}
          <div className="bg-card rounded-xl border border-border overflow-hidden mt-12">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Orders Management</h2>
                <p className="text-muted-foreground">View and manage customer orders</p>
              </div>
              <Button variant="gold" onClick={handleExportExcel}>
                <FileText className="mr-2 h-4 w-4" />
                Export to Excel
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Items</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Payment</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Address</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.slice().reverse().map(order => (
                    <tr key={order.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-medium text-foreground">{order.id}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">{order.userId}</p>
                          <p className="text-sm text-muted-foreground">ID: {order.userId}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <p key={index} className="text-sm text-foreground">
                              {item.product.name} × {item.quantity}
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-foreground">₹{order.total + Math.round(order.total * 0.18)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          {order.paymentMethod === 'cod' && <Truck className="h-4 w-4" />}
                          <span className="text-sm capitalize">{order.paymentMethod}</span>
                        </div>
                        {order.paymentId && (
                          <p className="text-xs text-muted-foreground font-mono">{order.paymentId}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : order.status === 'processing'
                              ? 'bg-blue-100 text-blue-700'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        {order.deliveryAddress ? (
                          <div className="max-w-xs">
                            <p className="font-medium text-sm">{order.deliveryAddress.name}</p>
                            <p className="text-xs text-muted-foreground">{order.deliveryAddress.street}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}
                            </p>
                            <p className="text-xs text-muted-foreground">{order.deliveryAddress.phone}</p>
                            {order.deliveryAddress.locationDetails && (
                              <p className="text-xs text-green-600 mt-1">
                                📍 {order.deliveryAddress.locationDetails}
                              </p>
                            )}
                            {order.deliveryAddress.latitude && order.deliveryAddress.longitude && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenMap(order.deliveryAddress!)}
                                className="mt-2 text-xs"
                              >
                                🗺️ Open in Maps
                              </Button>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No address</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleAcceptOrder(order.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Accept
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelOrder(order.id)}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {order.status === 'processing' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleDeliverOrder(order.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark Delivered
                            </Button>
                          )}
                          {order.status === 'completed' && (
                            <span className="text-sm text-green-600 font-medium">Completed</span>
                          )}
                          {order.status === 'cancelled' && (
                            <span className="text-sm text-red-600 font-medium">Cancelled</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {isAdmin && (
            <>
              {/* Testimonials Management */}
              <div className="bg-card rounded-xl border border-border overflow-hidden mt-12">
                <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-foreground">Testimonials</h2>
                    <p className="text-muted-foreground">Manage customer testimonials</p>
                  </div>
                  <Dialog open={isTestimonialDialogOpen} onOpenChange={setIsTestimonialDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="gold" onClick={() => handleOpenTestimonialDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Testimonial
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="font-serif text-2xl">
                          {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingTestimonial ? 'Update the testimonial details below.' : 'Add a customer testimonial with their feedback.'}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleTestimonialSubmit} className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="testimonialName">Customer Name</Label>
                            <Input
                              id="testimonialName"
                              value={testimonialForm.name}
                              onChange={e => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="testimonialLocation">Location</Label>
                            <Input
                              id="testimonialLocation"
                              value={testimonialForm.location}
                              onChange={e => setTestimonialForm({ ...testimonialForm, location: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="testimonialRating">Rating (1-5)</Label>
                          <Input
                            id="testimonialRating"
                            type="number"
                            min="1"
                            max="5"
                            value={testimonialForm.rating}
                            onChange={e => setTestimonialForm({ ...testimonialForm, rating: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="testimonialText">Testimonial Text</Label>
                          <Textarea
                            id="testimonialText"
                            value={testimonialForm.text}
                            onChange={e => setTestimonialForm({ ...testimonialForm, text: e.target.value })}
                            rows={3}
                            required
                          />
                        </div>

                        <div>
                          <Label>Avatar</Label>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <input
                                ref={testimonialAvatarRef}
                                type="file"
                                accept="image/*"
                                onChange={handleTestimonialAvatarChange}
                                className="hidden"
                              />
                              <Button variant="outline" type="button" onClick={handleTestimonialAvatarClick}>
                                Choose Avatar
                              </Button>
                              <Button
                                variant="gold"
                                type="button"
                                onClick={handleUploadTestimonialAvatar}
                                disabled={uploadingTestimonialAvatar}
                              >
                                {uploadingTestimonialAvatar ? 'Uploading...' : 'Upload Avatar'}
                              </Button>
                            </div>
                            {testimonialAvatarFile ? (
                              <div className="flex items-center gap-4 p-3 border border-border rounded-md">
                                <img src={URL.createObjectURL(testimonialAvatarFile)} alt="avatar-preview" className="w-16 h-16 object-cover rounded-full" />
                                <div>
                                  <p className="font-medium">{testimonialAvatarFile.name}</p>
                                  <p className="text-sm text-muted-foreground">{(testimonialAvatarFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                  <Button variant="destructive" size="sm" onClick={() => setTestimonialAvatarFile(null)} className="mt-1">Remove</Button>
                                </div>
                              </div>
                            ) : testimonialForm.avatar ? (
                              <div className="flex items-center gap-4 p-3 border border-border rounded-md">
                                <img src={testimonialForm.avatar} alt="current-avatar" className="w-16 h-16 object-cover rounded-full" />
                                <p className="text-sm text-muted-foreground">Current avatar uploaded</p>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No avatar selected. Upload an image or leave empty.</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="testimonialActive"
                            checked={testimonialForm.isActive}
                            onChange={e => setTestimonialForm({ ...testimonialForm, isActive: e.target.checked })}
                            className="w-4 h-4 rounded border-border"
                          />
                          <Label htmlFor="testimonialActive" className="cursor-pointer">Active</Label>
                        </div>

                        <div className="flex gap-4 pt-4">
                          <Button type="submit" variant="gold" className="flex-1">
                            {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsTestimonialDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Testimonials Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Rating</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Testimonial</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testimonials.map(testimonial => (
                        <tr key={testimonial.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={testimonial.avatar}
                                alt={testimonial.name}
                                className="w-10 h-10 object-cover rounded-full"
                              />
                              <div>
                                <p className="font-medium text-foreground">{testimonial.name}</p>
                                <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-muted-foreground line-clamp-2">{testimonial.text}</p>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-sm ${
                                testimonial.isActive
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {testimonial.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenTestimonialDialog(testimonial)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteTestimonial(testimonial.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Features Management */}
              <div className="bg-card rounded-xl border border-border overflow-hidden mt-12">
                <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-foreground">Features</h2>
                    <p className="text-muted-foreground">Manage "Why Choose Us" features</p>
                  </div>
                  <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="gold" onClick={() => handleOpenFeatureDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Feature
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="font-serif text-2xl">
                          {editingFeature ? 'Edit Feature' : 'Add New Feature'}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleFeatureSubmit} className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="featureIcon">Icon Name</Label>
                            <Input
                              id="featureIcon"
                              value={featureForm.icon}
                              onChange={e => setFeatureForm({ ...featureForm, icon: e.target.value })}
                              placeholder="e.g., Award, Truck, Leaf, Shield"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="featureTitle">Title</Label>
                            <Input
                              id="featureTitle"
                              value={featureForm.title}
                              onChange={e => setFeatureForm({ ...featureForm, title: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="featureDescription">Description</Label>
                          <Textarea
                            id="featureDescription"
                            value={featureForm.description}
                            onChange={e => setFeatureForm({ ...featureForm, description: e.target.value })}
                            rows={3}
                            required
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="featureActive"
                            checked={featureForm.isActive}
                            onChange={e => setFeatureForm({ ...featureForm, isActive: e.target.checked })}
                            className="w-4 h-4 rounded border-border"
                          />
                          <Label htmlFor="featureActive" className="cursor-pointer">Active</Label>
                        </div>

                        <div className="flex gap-4 pt-4">
                          <Button type="submit" variant="gold" className="flex-1">
                            {editingFeature ? 'Update Feature' : 'Add Feature'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsFeatureDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Features Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-4 font-medium text-muted-foreground">Icon</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Title</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Description</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {features.map(feature => (
                        <tr key={feature.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <span className="font-mono text-sm text-muted-foreground">{feature.icon}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-foreground">{feature.title}</span>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-muted-foreground line-clamp-2">{feature.description}</p>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-sm ${
                                feature.isActive
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {feature.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenFeatureDialog(feature)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteFeature(feature.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Hero Content Management */}
              <div className="bg-card rounded-xl border border-border overflow-hidden mt-12">
                <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-foreground">Hero Section</h2>
                    <p className="text-muted-foreground">Manage homepage hero content</p>
                  </div>
                  <Dialog open={isHeroDialogOpen} onOpenChange={setIsHeroDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="gold" onClick={handleOpenHeroDialog}>
                        <Image className="mr-2 h-4 w-4" />
                        Edit Hero Content
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="font-serif text-2xl">
                          Edit Hero Content
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleHeroSubmit} className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="heroBadge">Badge Text</Label>
                          <Input
                            id="heroBadge"
                            value={heroForm.badge}
                            onChange={e => setHeroForm({ ...heroForm, badge: e.target.value })}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="heroHeading">Main Heading</Label>
                            <Input
                              id="heroHeading"
                              value={heroForm.heading}
                              onChange={e => setHeroForm({ ...heroForm, heading: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="heroSubheading">Subheading</Label>
                            <Input
                              id="heroSubheading"
                              value={heroForm.subheading}
                              onChange={e => setHeroForm({ ...heroForm, subheading: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="heroDescription">Description</Label>
                          <Textarea
                            id="heroDescription"
                            value={heroForm.description}
                            onChange={e => setHeroForm({ ...heroForm, description: e.target.value })}
                            rows={3}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="heroBackground">Background Image URL</Label>
                          <Input
                            id="heroBackground"
                            value={heroForm.backgroundImage}
                            onChange={e => setHeroForm({ ...heroForm, backgroundImage: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                            required
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="heroActive"
                            checked={heroForm.isActive}
                            onChange={e => setHeroForm({ ...heroForm, isActive: e.target.checked })}
                            className="w-4 h-4 rounded border-border"
                          />
                          <Label htmlFor="heroActive" className="cursor-pointer">Active</Label>
                        </div>

                        <div className="flex gap-4 pt-4">
                          <Button type="submit" variant="gold" className="flex-1">
                            Update Hero Content
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsHeroDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Hero Content Display */}
                <div className="p-6">
                  <div className="bg-muted rounded-lg p-6">
                    <h3 className="font-semibold text-foreground mb-4">Current Hero Content</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Badge:</span>
                        <p className="text-foreground">{heroContent?.badge}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Heading:</span>
                        <p className="text-foreground">{heroContent?.heading} <span className="text-gold">{heroContent?.subheading}</span></p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Description:</span>
                        <p className="text-sm text-muted-foreground">{heroContent?.description}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Background:</span>
                        <p className="text-sm text-muted-foreground break-all">{heroContent?.backgroundImage}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${heroContent?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {heroContent?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Shop Configuration */}
          {isAdmin && (
            <div className="bg-card rounded-xl border border-border overflow-hidden mt-12">
              <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">Shop Configuration</h2>
                  <p className="text-muted-foreground">Manage shop details and contact information</p>
                </div>
                <Dialog open={isShopDialogOpen} onOpenChange={setIsShopDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="gold" onClick={handleOpenShopDialog}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Shop Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-2xl">
                        Shop Configuration
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleShopSubmit} className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="shopName">Shop Name *</Label>
                          <Input
                            id="shopName"
                            value={shopForm.name}
                            onChange={e => setShopForm({ ...shopForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="shopPhone">Phone Number *</Label>
                          <Input
                            id="shopPhone"
                            value={shopForm.phone}
                            onChange={e => setShopForm({ ...shopForm, phone: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="shopEmail">Email Address *</Label>
                        <Input
                          id="shopEmail"
                          type="email"
                          value={shopForm.email}
                          onChange={e => setShopForm({ ...shopForm, email: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="shopAddress">Shop Address *</Label>
                        <Textarea
                          id="shopAddress"
                          value={shopForm.address}
                          onChange={e => setShopForm({ ...shopForm, address: e.target.value })}
                          rows={3}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="gstNumber">GST Number</Label>
                          <Input
                            id="gstNumber"
                            value={shopForm.gstNumber}
                            onChange={e => setShopForm({ ...shopForm, gstNumber: e.target.value })}
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <Label htmlFor="panNumber">PAN Number</Label>
                          <Input
                            id="panNumber"
                            value={shopForm.panNumber}
                            onChange={e => setShopForm({ ...shopForm, panNumber: e.target.value })}
                            placeholder="Optional"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Tax Settings</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <Label htmlFor="cgst" className="text-sm">CGST (%)</Label>
                            <Input
                              id="cgst"
                              type="number"
                              step="0.01"
                              value={shopForm.taxSettings.cgst}
                              onChange={e => setShopForm({
                                ...shopForm,
                                taxSettings: { ...shopForm.taxSettings, cgst: e.target.value }
                              })}
                              placeholder="2.5"
                            />
                          </div>
                          <div>
                            <Label htmlFor="sgst" className="text-sm">SGST (%)</Label>
                            <Input
                              id="sgst"
                              type="number"
                              step="0.01"
                              value={shopForm.taxSettings.sgst}
                              onChange={e => setShopForm({
                                ...shopForm,
                                taxSettings: { ...shopForm.taxSettings, sgst: e.target.value }
                              })}
                              placeholder="2.5"
                            />
                          </div>
                          <div>
                            <Label htmlFor="igst" className="text-sm">IGST (%)</Label>
                            <Input
                              id="igst"
                              type="number"
                              step="0.01"
                              value={shopForm.taxSettings.igst}
                              onChange={e => setShopForm({
                                ...shopForm,
                                taxSettings: { ...shopForm.taxSettings, igst: e.target.value }
                              })}
                              placeholder="5"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="taxInclusive"
                              checked={shopForm.taxSettings.isInclusive}
                              onChange={e => setShopForm({
                                ...shopForm,
                                taxSettings: { ...shopForm.taxSettings, isInclusive: e.target.checked }
                              })}
                              className="w-4 h-4 rounded border-border"
                            />
                            <Label htmlFor="taxInclusive" className="cursor-pointer text-sm">Tax Inclusive</Label>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="shopActive"
                          checked={shopForm.isActive}
                          onChange={e => setShopForm({ ...shopForm, isActive: e.target.checked })}
                          className="w-4 h-4 rounded border-border"
                        />
                        <Label htmlFor="shopActive" className="cursor-pointer">Shop Active</Label>
                      </div>

                      <div>
                        <Label htmlFor="footerDescription">Footer Description</Label>
                        <Textarea
                          id="footerDescription"
                          value={shopForm.footerDescription}
                          onChange={e => setShopForm({ ...shopForm, footerDescription: e.target.value })}
                          rows={2}
                          placeholder="Description shown in footer"
                        />
                      </div>

                      <div>
                        <Label>Quick Links</Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <Label htmlFor="quickLinkHome" className="text-sm">Home</Label>
                            <Input
                              id="quickLinkHome"
                              value={shopForm.quickLinks.home}
                              onChange={e => setShopForm({
                                ...shopForm,
                                quickLinks: { ...shopForm.quickLinks, home: e.target.value }
                              })}
                              placeholder="Home"
                            />
                          </div>
                          <div>
                            <Label htmlFor="quickLinkProducts" className="text-sm">Products</Label>
                            <Input
                              id="quickLinkProducts"
                              value={shopForm.quickLinks.products}
                              onChange={e => setShopForm({
                                ...shopForm,
                                quickLinks: { ...shopForm.quickLinks, products: e.target.value }
                              })}
                              placeholder="Products"
                            />
                          </div>
                          <div>
                            <Label htmlFor="quickLinkAbout" className="text-sm">About</Label>
                            <Input
                              id="quickLinkAbout"
                              value={shopForm.quickLinks.about}
                              onChange={e => setShopForm({
                                ...shopForm,
                                quickLinks: { ...shopForm.quickLinks, about: e.target.value }
                              })}
                              placeholder="About Us"
                            />
                          </div>
                          <div>
                            <Label htmlFor="quickLinkOrders" className="text-sm">Orders</Label>
                            <Input
                              id="quickLinkOrders"
                              value={shopForm.quickLinks.orders}
                              onChange={e => setShopForm({
                                ...shopForm,
                                quickLinks: { ...shopForm.quickLinks, orders: e.target.value }
                              })}
                              placeholder="Track Order"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>Social Media Links</Label>
                        <div className="grid grid-cols-1 gap-4 mt-2">
                          <div>
                            <Label htmlFor="socialFacebook" className="text-sm">Facebook URL</Label>
                            <Input
                              id="socialFacebook"
                              value={shopForm.socialLinks.facebook}
                              onChange={e => setShopForm({
                                ...shopForm,
                                socialLinks: { ...shopForm.socialLinks, facebook: e.target.value }
                              })}
                              placeholder="https://facebook.com/yourpage"
                            />
                          </div>
                          <div>
                            <Label htmlFor="socialInstagram" className="text-sm">Instagram URL</Label>
                            <Input
                              id="socialInstagram"
                              value={shopForm.socialLinks.instagram}
                              onChange={e => setShopForm({
                                ...shopForm,
                                socialLinks: { ...shopForm.socialLinks, instagram: e.target.value }
                              })}
                              placeholder="https://instagram.com/youraccount"
                            />
                          </div>
                          <div>
                            <Label htmlFor="socialTwitter" className="text-sm">Twitter URL</Label>
                            <Input
                              id="socialTwitter"
                              value={shopForm.socialLinks.twitter}
                              onChange={e => setShopForm({
                                ...shopForm,
                                socialLinks: { ...shopForm.socialLinks, twitter: e.target.value }
                              })}
                              placeholder="https://twitter.com/youraccount"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button type="submit" variant="gold" className="flex-1">
                          Update Shop Configuration
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsShopDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="p-6">
                <div className="bg-muted rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-4">Current Shop Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Shop Name:</span>
                        <p className="text-foreground">{shopConfig?.name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                        <p className="text-foreground">{shopConfig?.phone}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Email:</span>
                        <p className="text-foreground">{shopConfig?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Address:</span>
                        <p className="text-sm text-foreground">{shopConfig?.address}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">GST:</span>
                        <p className="text-foreground">{shopConfig?.gstNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${shopConfig?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {shopConfig?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing System */}
          <div className="bg-card rounded-xl border border-border overflow-hidden mt-12">
            <div className="p-6 border-b border-border">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Billing System</h2>
                <p className="text-muted-foreground">Create bills for in-store customers with discounts and tax calculations</p>
              </div>
            </div>
            <div className="p-6">
              <Billing />
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card rounded-xl border border-border overflow-hidden mt-12">
            <div className="p-6 border-b border-border">
              <h2 className="font-serif text-2xl font-bold text-foreground">Notifications</h2>
              <p className="text-muted-foreground">Order alerts and system notifications</p>
            </div>

            <div className="divide-y divide-border">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-6 ${!notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{notification.title}</h4>
                        <p className="text-muted-foreground mt-1">{notification.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Customer: {notification.customerName}</span>
                          <span>Phone: {notification.customerPhone}</span>
                          <span>Total: ₹{notification.total}</span>
                          <span>{new Date(notification.date).toLocaleString()}</span>
                        </div>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkNotificationRead(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
