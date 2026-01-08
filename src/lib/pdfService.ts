import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BillItem } from '@/types';

export interface BillData {
  id: string;
  items: BillItem[];
  subtotal: number;
  discount?: number;
  tax: number;
  total: number;
  customerName?: string;
  customerPhone?: string;
  date: string;
  paymentMethod: string;
  shopConfig?: {
    name?: string;
    address?: string;
    phone?: string;
    gstNumber?: string;
  };
}

export class PDFService {
  private static instance: PDFService;

  private constructor() {}

  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  async generateBillPDF(billData: BillData): Promise<Blob> {
    const doc = new jsPDF();

    // Set font
    doc.setFont('helvetica');

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(billData.shopConfig?.name || 'Store Bill', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(billData.shopConfig?.address || '', 105, 30, { align: 'center' });
    doc.text(`Phone: ${billData.shopConfig?.phone || ''}`, 105, 40, { align: 'center' });

    if (billData.shopConfig?.gstNumber) {
      doc.text(`GST: ${billData.shopConfig.gstNumber}`, 105, 50, { align: 'center' });
    }

    // Bill details
    doc.setFontSize(10);
    let yPos = 70;

    // Bill info
    doc.text(`Bill No: ${billData.id}`, 20, yPos);
    doc.text(`Date: ${new Date(billData.date).toLocaleDateString()}`, 150, yPos);
    yPos += 10;

    doc.text(`Payment: ${billData.paymentMethod.toUpperCase()}`, 20, yPos);
    yPos += 10;

    if (billData.customerName) {
      doc.text(`Customer: ${billData.customerName}`, 20, yPos);
      yPos += 10;
    }

    if (billData.customerPhone) {
      doc.text(`Phone: ${billData.customerPhone}`, 20, yPos);
      yPos += 10;
    }

    yPos += 10;

    // Table header
    doc.setFont('helvetica', 'bold');
    doc.text('Item', 20, yPos);
    doc.text('Qty', 120, yPos);
    doc.text('Price', 150, yPos);
    doc.text('Total', 180, yPos);
    yPos += 5;

    // Line
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    // Items
    doc.setFont('helvetica', 'normal');
    billData.items.forEach(item => {
      const itemName = item.product?.name || 'Unknown Item';
      const quantity = item.quantity || 1;
      const price = item.price || item.total / quantity;
      const total = item.total || price * quantity;

      // Handle long item names
      if (itemName.length > 25) {
        doc.text(itemName.substring(0, 25) + '...', 20, yPos);
      } else {
        doc.text(itemName, 20, yPos);
      }

      doc.text(quantity.toString(), 125, yPos);
      doc.text(`₹${price.toFixed(2)}`, 150, yPos);
      doc.text(`₹${total.toFixed(2)}`, 180, yPos);

      yPos += 8;

      // Add weight if available
      const weight = item.product?.weight;
      if (weight) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(weight, 20, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        yPos += 6;
      }
    });

    yPos += 10;

    // Totals
    doc.line(120, yPos, 190, yPos);
    yPos += 10;

    doc.text('Subtotal:', 140, yPos);
    doc.text(`₹${billData.subtotal.toFixed(2)}`, 180, yPos);
    yPos += 8;

    if (billData.discount && billData.discount > 0) {
      doc.text('Discount:', 140, yPos);
      doc.text(`-₹${billData.discount.toFixed(2)}`, 180, yPos);
      yPos += 8;
    }

    doc.text('Tax:', 140, yPos);
    doc.text(`₹${billData.tax.toFixed(2)}`, 180, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.line(120, yPos, 190, yPos);
    yPos += 10;

    doc.text('TOTAL:', 140, yPos);
    doc.text(`₹${billData.total.toFixed(2)}`, 180, yPos);

    // Footer
    yPos = 270;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Thank you for shopping with us!', 105, yPos, { align: 'center' });
    doc.text('Visit again soon.', 105, yPos + 10, { align: 'center' });

    return doc.output('blob');
  }

  async generateBillFromHTML(htmlElement: HTMLElement): Promise<Blob> {
    try {
      const canvas = await html2canvas(htmlElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      return pdf.output('blob');
    } catch (error) {
      console.error('Error generating PDF from HTML:', error);
      throw error;
    }
  }

  downloadPDF(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Store PDF and return a local URL (in a real app, this would upload to a server)
  async storePDF(blob: Blob, filename: string): Promise<string> {
    // In a real application, you would upload this to a server and return the URL
    // For demo purposes, we'll create a local blob URL
    const url = URL.createObjectURL(blob);

    // Store in localStorage for persistence (demo only)
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      localStorage.setItem(`pdf_${filename}`, base64);
    };
    reader.readAsDataURL(blob);

    return url;
  }

  getStoredPDF(filename: string): string | null {
    const base64 = localStorage.getItem(`pdf_${filename}`);
    return base64;
  }
}

export const pdfService = PDFService.getInstance();