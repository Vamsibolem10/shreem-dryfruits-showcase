import { Order } from '@/types';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private static instance: EmailService;

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // In a real application, this would make an API call to your backend
      // For now, we'll simulate email sending by logging to console
      console.log('📧 Email sent:', {
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html
      });

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendOrderStatusUpdateEmail(order: Order, userEmail: string, userName: string): Promise<boolean> {
    const statusMessages = {
      pending: 'Your order has been received and is pending confirmation.',
      processing: 'Your order has been accepted and is now being processed.',
      completed: 'Your order has been delivered successfully!',
      cancelled: 'Your order has been cancelled.'
    };

    const subject = `Order ${order.id} - ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #8B4513;">Shreem Nuts N Fruits</h1>
        <h2>Order Status Update</h2>
        <p>Dear ${userName},</p>
        <p>${statusMessages[order.status]}</p>

        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
          <p><strong>Order Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
          <p><strong>Total Amount:</strong> ₹${order.total + Math.round(order.total * 0.18)}</p>

          <h4>Items:</h4>
          <ul>
            ${order.items.map(item => `
              <li>${item.product.name} - ${item.quantity} × ₹${item.product.price}</li>
            `).join('')}
          </ul>

          ${order.deliveryAddress ? `
            <h4>Delivery Address:</h4>
            <p>${order.deliveryAddress.name}<br>
            ${order.deliveryAddress.street}<br>
            ${order.deliveryAddress.city}, ${order.deliveryAddress.state}<br>
            Phone: ${order.deliveryAddress.phone}</p>
          ` : ''}
        </div>

        <p>Thank you for shopping with Shreem Nuts N Fruits!</p>
        <p>If you have any questions, please contact us at support@shreem.com</p>

        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html
    });
  }
}

export const emailService = EmailService.getInstance();