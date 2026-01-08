import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Edit2, Package, ShoppingBag, DollarSign, Truck } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { Product, Address } from '@/types';
import { toast } from 'sonner';
import Billing from '@/components/billing/Billing';
import OfflineBilling from '@/components/billing/OfflineBilling';
import OfflineBillsHistory from '@/components/billing/OfflineBillsHistory';

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

export default function Employee() {
  const { user, isEmployee } = useAuth();
  const { products, addProduct, updateProduct, categories } = useProducts();
  const { orders, updateOrderStatus } = useCart();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(defaultFormState);

  // Load form data when editing
  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price.toString(),
        originalPrice: editingProduct.originalPrice?.toString() || '',
        image: editingProduct.image,
        category: editingProduct.category,
        weight: editingProduct.weight,
        inStock: editingProduct.inStock,
        featured: editingProduct.featured || false,
      });
    } else {
      setForm(defaultFormState);
    }
  }, [editingProduct]);

  if (!user || !isEmployee) {
    return <Navigate to="/login" replace />;
  }

  const handleOpenDialog = (product?: Product) => {
    setEditingProduct(product || null);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productData: Omit<Product, 'id'> = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
      image: form.image,
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
    setEditingProduct(null);
    setForm(defaultFormState);
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

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'bg-blue-500' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'bg-green-500' },
    { label: 'Revenue', value: `₹${orders.reduce((sum, o) => sum + o.total, 0)}`, icon: DollarSign, color: 'bg-gold' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Employee Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}! Manage products and orders.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Product Management */}
        <div className="bg-card rounded-xl border border-border overflow-hidden mb-8">
          <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">Product Management</h2>
              <p className="text-muted-foreground">Add and manage products</p>
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
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <select
                        id="category"
                        value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
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
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
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
                        step="0.01"
                        value={form.originalPrice}
                        onChange={e => setForm({ ...form, originalPrice: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight *</Label>
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
                    <Label htmlFor="image">Image URL *</Label>
                    <Input
                      id="image"
                      type="url"
                      value={form.image}
                      onChange={e => setForm({ ...form, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.inStock}
                        onChange={e => setForm({ ...form, inStock: e.target.checked })}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span className="text-sm">In Stock</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={e => setForm({ ...form, featured: e.target.checked })}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span className="text-sm">Featured Product</span>
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
                {products.slice().reverse().map(product => (
                  <tr key={product.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.weight}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">{product.category}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="font-medium text-foreground">₹{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(product)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders Management */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="font-serif text-2xl font-bold text-foreground">Orders Management</h2>
            <p className="text-muted-foreground">View and manage customer orders</p>
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
                {orders.slice().reverse().map(order => (
                  <tr key={order.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-medium text-foreground">{order.id}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{order.userName}</p>
                        <p className="text-sm text-muted-foreground">{order.userEmail}</p>
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
                        <span className="text-sm capitalize">{order.paymentMethod}</span>
                      </div>
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

        {/* Offline Customer Billing */}
        <div className="bg-card rounded-xl border border-border overflow-hidden mt-8">
          <div className="p-6 border-b border-border">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">Offline Customer Billing</h2>
              <p className="text-muted-foreground">Create bills for walk-in customers with quick product selection</p>
            </div>
          </div>
          <div className="p-6">
            <OfflineBilling />
          </div>
        </div>

        {/* Billing System */}
        <div className="bg-card rounded-xl border border-border overflow-hidden mt-8">
          <div className="p-6 border-b border-border">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">Advanced Billing System</h2>
              <p className="text-muted-foreground">Create bills for in-store customers with discounts and tax calculations</p>
            </div>
          </div>
          <div className="p-6">
            <Billing />
          </div>
        </div>

        {/* Offline Bills History */}
        <div className="bg-card rounded-xl border border-border overflow-hidden mt-8">
          <div className="p-6 border-b border-border">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">Offline Bills History</h2>
              <p className="text-muted-foreground">View and reprint previously generated offline bills</p>
            </div>
          </div>
          <div className="p-6">
            <OfflineBillsHistory />
          </div>
        </div>
      </div>
    </Layout>
  );
}