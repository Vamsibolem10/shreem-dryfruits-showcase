import React, { useState, useEffect } from 'react';
import { FileText, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { pdfService } from '@/lib/pdfService';
import { useShop } from '@/context/ShopContext';
import { BillItem } from '@/types';

interface OfflineBillData {
  id: string;
  items: BillItem[];
  subtotal: number;
  discount?: number;
  tax: number;
  total: number;
  customerName?: string;
  customerPhone?: string;
  date: string;
  paymentMethod: 'cash' | 'card' | 'upi';
}

export default function OfflineBillsHistory() {
  const [bills, setBills] = useState<OfflineBillData[]>([]);
  const [selectedBill, setSelectedBill] = useState<OfflineBillData | null>(null);
  const { shopConfig } = useShop();

  useEffect(() => {
    const offlineBills = JSON.parse(localStorage.getItem('offlineBills') || '[]');
    setBills(offlineBills.reverse()); // Show latest first
  }, []);

  const downloadPDF = async (bill: OfflineBillData) => {
    try {
      const pdfBlob = await pdfService.generateBillPDF({
        ...bill,
        shopConfig
      });
      pdfService.downloadPDF(pdfBlob, `bill_${bill.id}.pdf`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (bills.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No offline bills generated yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bills.map(bill => (
          <Card key={bill.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{bill.id}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(bill.date).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">{bill.paymentMethod}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {bill.customerName && (
                  <p className="text-sm">
                    <strong>Customer:</strong> {bill.customerName}
                  </p>
                )}
                <p className="text-sm">
                  <strong>Items:</strong> {bill.items.length}
                </p>
                <p className="text-lg font-bold text-primary">
                  ₹{bill.total.toFixed(2)}
                </p>
                <div className="flex gap-2 pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Bill Details - {bill.id}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Date:</strong> {new Date(bill.date).toLocaleString()}
                          </div>
                          <div>
                            <strong>Payment:</strong> {bill.paymentMethod.toUpperCase()}
                          </div>
                          {bill.customerName && (
                            <div>
                              <strong>Customer:</strong> {bill.customerName}
                            </div>
                          )}
                          {bill.customerPhone && (
                            <div>
                              <strong>Phone:</strong> {bill.customerPhone}
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Items</h4>
                          <div className="space-y-2">
                            {bill.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm border-b pb-1">
                                <div>
                                  <span className="font-medium">{item.product.name}</span>
                                  <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                                </div>
                                <span>₹{item.total.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span>₹{bill.subtotal.toFixed(2)}</span>
                          </div>
                          {bill.discount && bill.discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Discount:</span>
                              <span>-₹{bill.discount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span>Tax:</span>
                            <span>₹{bill.tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>₹{bill.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadPDF(bill)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}