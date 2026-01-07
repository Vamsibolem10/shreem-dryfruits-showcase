import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import CouponInput from '@/components/promo/CouponInput';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Cart() {
  const { items, removeFromCart, updateQuantity, total, clearCart, addOrder } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

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

    // Load Razorpay script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      const options = {
        key: 'rzp_test_demo', // Demo key - replace with actual key
        amount: finalTotal * 100, // Amount in paise
        currency: 'INR',
        name: 'Shreem Dryfruits',
        description: 'Premium Dry Fruits Order',
        image: '/favicon.ico',
        handler: function (response: { razorpay_payment_id: string }) {
          // Create order
          const order = {
            id: `ORD-${Date.now()}`,
            userId: user.id,
            items: [...items],
            total: subtotal,
            status: 'completed' as const,
            date: new Date().toISOString(),
            paymentId: response.razorpay_payment_id,
            couponCode: appliedCoupon?.code,
            discount: appliedCoupon?.discount,
          };
          addOrder(order);
          toast.success('Payment successful! Order placed.');
          navigate('/orders');
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#5B4636',
        },
        modal: {
          ondismiss: function () {
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    };
    document.body.appendChild(script);
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
                >
                  Proceed to Checkout
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
