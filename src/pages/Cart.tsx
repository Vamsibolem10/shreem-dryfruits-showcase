import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useShop } from '@/context/ShopContext';
import CouponInput from '@/components/promo/CouponInput';
import { toast } from 'sonner';
import { Order, Address } from '@/types';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total, clearCart, addOrder } = useCart();
  const { user } = useAuth();
  const { shopConfig } = useShop();
  const navigate = useNavigate();
  
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const paymentMethod = 'cod' as const;

  const subtotal = total;
  const discount = appliedCoupon?.discount || 0;
  const tax = Math.round((subtotal - discount) * 0.18);
  const finalTotal = subtotal - discount + tax;

  const handleApplyCoupon = (discountAmount: number, code: string) => {
    setAppliedCoupon({ code, discount: discountAmount });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const sendOrderNotification = (order: Order) => {
    // In a real application, this would send an email/SMS to admin
    // For now, we'll store notifications in localStorage for admin to see
    const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    const notification = {
      id: `NOTIF-${Date.now()}`,
      type: 'new_order',
      title: 'New Order Received',
      message: `Order ${order.id} placed by ${user?.name || 'Customer'} for ₹${order.total}`,
      orderId: order.id,
      customerName: user?.name || 'Unknown',
      customerPhone: deliveryAddress?.phone || 'N/A',
      total: order.total,
      paymentMethod: order.paymentMethod,
      items: order.items.length,
      date: new Date().toISOString(),
      read: false,
    };
    notifications.unshift(notification);
    localStorage.setItem('adminNotifications', JSON.stringify(notifications));
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // For COD, we need delivery address
    if (!deliveryAddress) {
      toast.error('Please add a delivery address for COD orders');
      setShowAddressForm(true);
      return;
    }

    // COD order - no payment required
    const order = {
      id: `ORD-${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      items: [...items],
      total: subtotal,
      status: 'pending' as const,
      date: new Date().toISOString(),
      paymentMethod: 'cod',
      couponCode: appliedCoupon?.code,
      discount: appliedCoupon?.discount,
      deliveryAddress: deliveryAddress,
    };
    addOrder(order);
    sendOrderNotification(order);
    toast.success('Order placed successfully! Pay on delivery.');
    navigate('/orders');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Looks like you have not added any products yet. Start shopping to fill your cart with premium dry fruits!
          </p>
          <Link to="/products">
            <Button size="lg" className="bg-[hsl(42,75%,55%)] text-[hsl(25,30%,15%)] hover:bg-[hsl(42,70%,50%)]">
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-4xl font-bold text-primary-foreground">
            Shopping Cart
          </h1>
          <p className="text-primary-foreground/70 mt-2">
            {items.length} item{items.length > 1 ? 's' : ''} in your cart
          </p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="bg-card rounded-xl p-4 md:p-6 border border-border flex flex-col md:flex-row gap-4 animate-fade-in"
                >
                  {/* Image */}
                  <Link to={`/products/${product.id}`} className="shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full md:w-32 h-32 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-[hsl(42,75%,55%)] font-medium">{product.category}</p>
                        <Link to={`/products/${product.id}`}>
                          <h3 className="font-serif text-xl font-semibold text-foreground hover:text-[hsl(42,75%,55%)] transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-muted-foreground text-sm">{product.weight}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-2"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-2 hover:bg-muted transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center font-medium">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-2 hover:bg-muted transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-xl font-bold text-foreground">
                          ₹{product.price * quantity}
                        </p>
                        {quantity > 1 && (
                          <p className="text-sm text-muted-foreground">
                            ₹{product.price} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart */}
              <div className="text-right">
                <Button variant="ghost" className="text-destructive" onClick={clearCart}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl p-6 border border-border sticky top-24">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                  Order Summary
                </h2>

                {/* Coupon Input */}
                <div className="mb-6">
                  <CouponInput
                    orderTotal={subtotal}
                    onApply={handleApplyCoupon}
                    onRemove={handleRemoveCoupon}
                    appliedCode={appliedCoupon?.code}
                    appliedDiscount={appliedCoupon?.discount}
                  />
                </div>

                {/* Payment Method - COD Only */}
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-3">Payment Method</h3>
                  <div className="p-4 bg-[hsl(42,75%,55%)]/10 border border-[hsl(42,75%,55%)] rounded-lg">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-[hsl(42,75%,55%)]" />
                      <span className="font-medium text-foreground">Cash on Delivery</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Pay when you receive your order</p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-foreground">Delivery Address</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddressForm(!showAddressForm)}
                    >
                      {deliveryAddress ? 'Change Address' : 'Add Address'}
                    </Button>
                  </div>

                  {deliveryAddress ? (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="font-medium">{deliveryAddress.name}</p>
                      <p className="text-sm text-muted-foreground">{deliveryAddress.street}</p>
                      <p className="text-sm text-muted-foreground">
                        {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
                      </p>
                      <p className="text-sm text-muted-foreground">{deliveryAddress.phone}</p>
                      {deliveryAddress.locationDetails && (
                        <p className="text-xs text-muted-foreground mt-2">
                          📍 {deliveryAddress.locationDetails}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">No delivery address added</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Required for {paymentMethod === 'cod' ? 'COD orders' : 'delivery'}
                      </p>
                    </div>
                  )}

                  {showAddressForm && <AddressForm onAddressAdd={setDeliveryAddress} onClose={() => setShowAddressForm(false)} />}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (GST 18%)</span>
                    <span>₹{tax}</span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between text-xl font-bold text-foreground">
                    <span>Total</span>
                    <span>₹{finalTotal}</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full mb-4 h-14 text-lg bg-[hsl(42,75%,55%)] text-[hsl(25,30%,15%)] hover:bg-[hsl(42,70%,50%)]"
                  onClick={handleCheckout}
                  disabled={!deliveryAddress}
                >
                  Place Order - Pay on Delivery ₹{finalTotal}
                </Button>

                <Link to="/products" className="block text-center">
                  <Button variant="ghost" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>

                <div className="mt-6 p-4 bg-[hsl(42,75%,55%)]/10 rounded-lg">
                  <p className="text-sm text-[hsl(42,80%,35%)] font-medium">
                    🎉 Free shipping on all orders!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

// Address Form Component
function AddressForm({ onAddressAdd, onClose }: { onAddressAdd: (address: Address) => void; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationDetails, setLocationDetails] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding using a free API (you can replace with Google Maps API)
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          const locationString = `${data.city}, ${data.principalSubdivision}, ${data.countryName}`;
          setLocationDetails(`📍 ${locationString} (Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)})`);
          
          // Auto-fill city and state if available
          if (data.city && !formData.city) {
            setFormData(prev => ({ ...prev, city: data.city }));
          }
          if (data.principalSubdivision && !formData.state) {
            setFormData(prev => ({ ...prev, state: data.principalSubdivision }));
          }
          
          toast.success('Location detected successfully!');
        } catch (error) {
          setLocationDetails(`📍 Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          toast.info('Location coordinates captured, but address details unavailable');
        }
        
        setIsLoadingLocation(false);
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location access denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out.');
            break;
          default:
            toast.error('An unknown error occurred.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.street || !formData.city || !formData.state || !formData.pincode) {
      toast.error('Please fill all required fields');
      return;
    }

    const address = {
      id: `ADDR-${Date.now()}`,
      userId: 'current-user', // This should come from auth context
      ...formData,
      latitude: locationDetails.includes('Lat:') ? parseFloat(locationDetails.split('Lat: ')[1].split(',')[0]) : undefined,
      longitude: locationDetails.includes('Lng:') ? parseFloat(locationDetails.split('Lng: ')[1].split(')')[0]) : undefined,
      locationDetails,
      isDefault: false,
    };

    onAddressAdd(address);
    onClose();
    toast.success('Delivery address added successfully!');
  };

  return (
    <div className="mt-4 p-4 border border-border rounded-lg bg-card">
      <h4 className="font-medium mb-4">Add Delivery Address</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border border-border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full p-2 border border-border rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Street Address *</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            className="w-full p-2 border border-border rounded-md"
            placeholder="House number, street name"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full p-2 border border-border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State *</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="w-full p-2 border border-border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pincode *</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              className="w-full p-2 border border-border rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Landmark (Optional)</label>
          <input
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={handleInputChange}
            className="w-full p-2 border border-border rounded-md"
            placeholder="Near landmark"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Location</label>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              className="text-sm text-[hsl(42,75%,55%)] hover:text-[hsl(42,70%,50%)] disabled:opacity-50"
            >
              {isLoadingLocation ? 'Getting location...' : '📍 Use current location'}
            </button>
          </div>
          {locationDetails && (
            <div className="p-2 bg-muted rounded text-sm">
              {locationDetails}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            Save Address
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}


