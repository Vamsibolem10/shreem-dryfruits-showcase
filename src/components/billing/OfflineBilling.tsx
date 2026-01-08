import React, { useState, useRef } from 'react';
import { Plus, Minus, Printer, Calculator, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useProducts } from '@/context/ProductContext';
import { useShop } from '@/context/ShopContext';
import { Product, BillItem } from '@/types';
import { toast } from 'sonner';

interface OfflineBillData {
  id: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  total: number;
  customerName?: string;
  customerPhone?: string;
  date: string;
  paymentMethod: 'cash' | 'card' | 'upi';
}

export default function OfflineBilling() {
  const { products } = useProducts();
  const { shopConfig } = useShop();

  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');

  const addProductToBill = (product: Product) => {
    setBillItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price
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
            total: quantity * item.price
          }
        : item
    ));
  };

  const removeItem = (productId: string) => {
    setBillItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const calculateSubtotal = () => {
    return billItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    if (!shopConfig?.taxSettings) return 0;

    const subtotal = calculateSubtotal();
    const { cgst, sgst, isInclusive } = shopConfig.taxSettings;

    if (isInclusive) {
      // For inclusive tax, tax is already included in the price
      return 0;
    } else {
      // For exclusive tax, calculate tax on subtotal
      return subtotal * ((cgst + sgst) / 100);
    }
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const generateBill = async () => {
    if (billItems.length === 0) {
      toast.error('Please add items to the bill');
      return;
    }

    const billData = {
      customerName: customerName || 'Walk-in Customer',
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      items: billItems.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      discount: 0, // Can be added later
      total: calculateTotal(),
      paymentMethod,
      status: 'completed',
      createdBy: 'employee' // This should come from auth context
    };

    try {
      // Save bill to backend
      const response = await fetch('http://localhost:5002/api/billing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Bill saved successfully! Bill Number: ${result.billNumber}`);

        // Also store locally for offline access
        const offlineBills = JSON.parse(localStorage.getItem('offlineBills') || '[]');
        const localBill = {
          ...billData,
          id: result.billNumber,
          billNumber: result.billNumber,
          date: new Date().toISOString(),
          storage: result.storage,
          pdfGenerated: result.pdfGenerated
        };
        offlineBills.push(localBill);
        localStorage.setItem('offlineBills', JSON.stringify(offlineBills));

        return result;
      } else {
        throw new Error(result.message || 'Failed to save bill');
      }
    } catch (error) {
      console.error('Bill save error:', error);

      // Fallback to localStorage only
      const fallbackBill = {
        id: `OFFLINE-${Date.now()}`,
        billNumber: `OFFLINE-${Date.now()}`,
        ...billData,
        date: new Date().toISOString(),
        storage: 'localStorage',
        fallback: true
      };

      const offlineBills = JSON.parse(localStorage.getItem('offlineBills') || '[]');
      offlineBills.push(fallbackBill);
      localStorage.setItem('offlineBills', JSON.stringify(offlineBills));

      toast.warning('Bill saved locally (backend unavailable)');
      return fallbackBill;
    }
  };

  const printBill = async () => {
    const billResult = await generateBill();
    if (!billResult) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const billHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - ${billResult.billNumber || billResult.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; font-size: 14px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .bill-details { margin-bottom: 20px; }
            .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items th { background-color: #f5f5f5; font-weight: bold; }
            .items .right { text-align: right; }
            .totals { margin-top: 20px; }
            .total-row { font-weight: bold; font-size: 16px; border-top: 2px solid #000; padding-top: 10px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            @media print { body { margin: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <!-- Watermark Logo -->
          <img src="/logo.png" alt="Watermark" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 320px; height: 320px; object-fit: contain; opacity: 0.1; pointer-events: none; z-index: 0;" />
          
          <div style="position: relative; z-index: 1;">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">${shopConfig?.name || 'Store'}</h1>
            <p style="margin: 5px 0;">${shopConfig?.address || ''}</p>
            <p style="margin: 5px 0;">Phone: ${shopConfig?.phone || ''}</p>
            ${shopConfig?.gstNumber ? `<p style="margin: 5px 0;">GST: ${shopConfig.gstNumber}</p>` : ''}
          </div>

          <div class="bill-details">
            <table style="width: 100%; border: none;">
              <tr>
                <td><strong>Bill No:</strong> ${billResult.billNumber || billResult.id}</td>
                <td style="text-align: right;"><strong>Date:</strong> ${new Date(billResult.createdAt || billResult.date).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td><strong>Payment:</strong> ${billResult.paymentMethod.toUpperCase()}</td>
                <td style="text-align: right;">
                  ${billResult.customerName ? `<strong>Customer:</strong> ${billResult.customerName}` : ''}
                </td>
              </tr>
              ${billResult.customerPhone ? `
              <tr>
                <td colspan="2"><strong>Phone:</strong> ${billResult.customerPhone}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <table class="items">
            <thead>
              <tr>
                <th style="width: 50%;">Item</th>
                <th style="width: 15%; text-align: center;">Qty</th>
                <th style="width: 17%; text-align: right;">Price</th>
                <th style="width: 18%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${billResult.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
                  <td style="text-align: right;">₹${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <table style="width: 200px; margin-left: auto; border: none;">
              <tr>
                <td style="text-align: right; padding: 5px;"><strong>Subtotal:</strong></td>
                <td style="text-align: right; padding: 5px;">₹${billResult.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="text-align: right; padding: 5px;"><strong>Tax:</strong></td>
                <td style="text-align: right; padding: 5px;">₹${billResult.tax.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td style="text-align: right; padding: 5px;"><strong>TOTAL:</strong></td>
                <td style="text-align: right; padding: 5px;">₹${billResult.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>Visit again soon.</p>
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
    setCustomerEmail('');
    setCustomerPhone('');
    setPaymentMethod('cash');
  };

  return (
    <div className="space-y-6">
      {/* Quick Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Email Address (Optional)</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Enter email for receipt"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Enter phone number"
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
        </CardContent>
      </Card>

      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Add Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.filter(p => p.inStock).map(product => (
              <div key={product.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.category} • {product.weight}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addProductToBill(product)}
                    className="ml-2 h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">₹{product.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Bill */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Current Bill
          </CardTitle>
        </CardHeader>
        <CardContent>
          {billItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No items added to bill</p>
          ) : (
            <div className="space-y-4">
              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Item</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-right py-2">Price</th>
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
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="text-right py-2">₹{item.price.toFixed(2)}</td>
                        <td className="text-right py-2 font-medium">₹{item.total.toFixed(2)}</td>
                        <td className="text-center py-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeItem(item.product.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Separator />

              {/* Bill Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium ml-2">₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="font-medium ml-2">₹{calculateTax().toFixed(2)}</span>
                  </div>
                  <div className="text-lg font-bold">
                    <span>Total:</span>
                    <span className="ml-2">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={printBill} variant="outline" className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Only
                </Button>
                <Button onClick={clearBill} variant="destructive">
                  Clear
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}