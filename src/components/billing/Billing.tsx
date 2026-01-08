import React, { useState, useRef } from 'react';
import { Plus, Minus, Printer, Edit2, Save, X, Receipt, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useProducts } from '@/context/ProductContext';
import { useShop } from '@/context/ShopContext';
import { Product, BillItem } from '@/types';
import { toast } from 'sonner';

interface BillingProps {
  onBillGenerated?: (bill: BillData) => void;
}

interface BillData {
  id: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  customerName?: string;
  customerPhone?: string;
  date: string;
  paymentMethod: 'cash' | 'card' | 'upi';
}

export default function Billing({ onBillGenerated }: BillingProps) {
  const { products } = useProducts();
  const { shopConfig } = useShop();
  const printRef = useRef<HTMLDivElement>(null);

  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [isEditingDiscount, setIsEditingDiscount] = useState<string | null>(null);
  const [discountValue, setDiscountValue] = useState('');

  const addProductToBill = (product: Product) => {
    setBillItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * (item.price - item.discount)
              }
            : item
        );
      } else {
        return [...prev, {
          product,
          quantity: 1,
          price: product.price,
          discount: 0,
          total: product.price
        }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setBillItems(prev => prev.map(item =>
      item.product.id === productId
        ? {
            ...item,
            quantity,
            total: quantity * (item.price - item.discount)
          }
        : item
    ));
  };

  const removeItem = (productId: string) => {
    setBillItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateItemDiscount = (productId: string, discount: number) => {
    setBillItems(prev => prev.map(item =>
      item.product.id === productId
        ? {
            ...item,
            discount: Math.min(discount, item.price), // Discount can't exceed price
            total: item.quantity * (item.price - Math.min(discount, item.price))
          }
        : item
    ));
  };

  const calculateSubtotal = () => {
    return billItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotalDiscount = () => {
    return billItems.reduce((sum, item) => sum + (item.quantity * item.discount), 0);
  };

  const calculateTax = () => {
    if (!shopConfig?.taxSettings) return 0;

    const subtotalAfterDiscount = calculateSubtotal() - calculateTotalDiscount();
    const { cgst, sgst, isInclusive } = shopConfig.taxSettings;

    if (isInclusive) {
      // For inclusive tax, tax is already included in the price
      return 0;
    } else {
      // For exclusive tax, calculate tax on discounted amount
      return subtotalAfterDiscount * ((cgst + sgst) / 100);
    }
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateTotalDiscount() + calculateTax();
  };

  const generateBill = async () => {
    if (billItems.length === 0) {
      toast.error('Please add items to the bill');
      return;
    }

    const bill: BillData = {
      id: `BILL-${Date.now()}`,
      items: billItems,
      subtotal: calculateSubtotal(),
      discount: calculateTotalDiscount(),
      tax: calculateTax(),
      total: calculateTotal(),
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      date: new Date().toISOString(),
      paymentMethod,
    };

    // Store bill for records
    const offlineBills = JSON.parse(localStorage.getItem('offlineBills') || '[]');
    offlineBills.push(bill);
    localStorage.setItem('offlineBills', JSON.stringify(offlineBills));

    if (onBillGenerated) {
      onBillGenerated(bill);
    }

    return bill;
  };

  const printBill = async () => {
    const bill = await generateBill();
    if (!bill) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const billHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - ${bill.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .bill-details { margin-bottom: 20px; }
            .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items th { background-color: #f2f2f2; }
            .totals { text-align: right; margin-top: 20px; }
            .total-row { font-weight: bold; font-size: 18px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <!-- Watermark Logo -->
          <img src="/logo.png" alt="Watermark" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 320px; height: 320px; object-fit: contain; opacity: 0.1; pointer-events: none; z-index: 0;" />
          
          <div style="position: relative; z-index: 1;">
            <div class="header">
              <h1>${shopConfig?.name || 'Store'}</h1>
            <p>${shopConfig?.address || ''}</p>
            <p>Phone: ${shopConfig?.phone || ''}</p>
            ${shopConfig?.gstNumber ? `<p>GST: ${shopConfig.gstNumber}</p>` : ''}
          </div>

          <div class="bill-details">
            <p><strong>Bill No:</strong> ${bill.id}</p>
            <p><strong>Date:</strong> ${new Date(bill.date).toLocaleDateString()}</p>
            ${bill.customerName ? `<p><strong>Customer:</strong> ${bill.customerName}</p>` : ''}
            ${bill.customerPhone ? `<p><strong>Phone:</strong> ${bill.customerPhone}</p>` : ''}
            <p><strong>Payment:</strong> ${bill.paymentMethod.toUpperCase()}</p>
          </div>

          <table class="items">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${bill.items.map(item => `
                <tr>
                  <td>${item.product.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price.toFixed(2)}</td>
                  <td>₹${(item.discount * item.quantity).toFixed(2)}</td>
                  <td>₹${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p>Subtotal: ₹${bill.subtotal.toFixed(2)}</p>
            <p>Discount: ₹${bill.discount.toFixed(2)}</p>
            <p>Tax: ₹${bill.tax.toFixed(2)}</p>
            <p class="total-row">Total: ₹${bill.total.toFixed(2)}</p>
          </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(billHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const clearBill = () => {
    setBillItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setPaymentMethod('cash');
  };

  return (
    <div className="space-y-6">
      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Products to Bill
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.filter(p => p.inStock).map(product => (
              <div key={product.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addProductToBill(product)}
                    className="ml-2"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">₹{product.price.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">{product.weight}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bill Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Current Bill
          </CardTitle>
        </CardHeader>
        <CardContent>
          {billItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No items added to bill</p>
          ) : (
            <div className="space-y-4">
              {/* Customer Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name (Optional)</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Customer Phone (Optional)</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter customer phone"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'upi')}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
              </div>

              <Separator />

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Item</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Discount</th>
                      <th className="text-right py-2">Total</th>
                      <th className="text-center py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billItems.map(item => (
                      <tr key={item.product.id} className="border-b">
                        <td className="py-2">
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">{item.product.weight}</p>
                          </div>
                        </td>
                        <td className="text-center py-2">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="text-right py-2">₹{item.price.toFixed(2)}</td>
                        <td className="text-right py-2">
                          {isEditingDiscount === item.product.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={discountValue}
                                onChange={(e) => setDiscountValue(e.target.value)}
                                className="w-20 h-8"
                                placeholder="0.00"
                              />
                              <Button
                                size="sm"
                                onClick={() => {
                                  updateItemDiscount(item.product.id, parseFloat(discountValue) || 0);
                                  setIsEditingDiscount(null);
                                  setDiscountValue('');
                                }}
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setIsEditingDiscount(null);
                                  setDiscountValue('');
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <span>₹{(item.discount * item.quantity).toFixed(2)}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setIsEditingDiscount(item.product.id);
                                  setDiscountValue(item.discount.toString());
                                }}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </td>
                        <td className="text-right py-2 font-medium">₹{item.total.toFixed(2)}</td>
                        <td className="text-center py-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeItem(item.product.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Separator />

              {/* Bill Summary */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Total Discount:</span>
                  <span>-₹{calculateTotalDiscount().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({shopConfig?.taxSettings ? `${shopConfig.taxSettings.cgst + shopConfig.taxSettings.sgst}%` : '0%'}):</span>
                  <span>₹{calculateTax().toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button onClick={printBill} variant="outline" className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Only
                </Button>
                <Button onClick={clearBill} variant="destructive">
                  Clear Bill
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}