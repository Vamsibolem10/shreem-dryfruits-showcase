import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Package, Calendar, CreditCard, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Orders() {
  const { orders } = useCart();
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userOrders = orders.filter(o => o.userId === user.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (userOrders.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <Package className="w-24 h-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
            No Orders Yet
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            You haven't placed any orders yet. Start shopping to see your order history here!
          </p>
          <Link to="/products">
            <Button variant="gold" size="lg">
              Start Shopping
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
            My Orders
          </h1>
          <p className="text-primary-foreground/70 mt-2">
            Track and manage your orders
          </p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            {userOrders.map(order => (
              <div
                key={order.id}
                className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in"
              >
                {/* Order Header */}
                <div className="bg-muted p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 md:gap-8">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-mono font-medium text-foreground">{order.id}</p>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        {new Date(order.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm font-mono">{order.paymentId || 'N/A'}</span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Order Items */}
                <div className="p-4 md:p-6">
                  <div className="space-y-4">
                    {order.items.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-4"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.weight} × {quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-foreground">
                          ₹{product.price * quantity}
                        </p>
                      </div>
                    ))}
                  </div>

                  <hr className="my-4 border-border" />

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="text-2xl font-bold text-foreground">
                      ₹{order.total + Math.round(order.total * 0.18)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
