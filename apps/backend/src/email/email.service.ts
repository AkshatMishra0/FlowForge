import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface InvoiceEmailData {
  customerName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
  paymentLink?: string;
}

interface BookingEmailData {
  customerName: string;
  serviceName: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Send email (mock implementation - integrate with SendGrid/AWS SES in production)
   */
  private async send(options: EmailOptions): Promise<boolean> {
    this.logger.log(`Sending email to ${options.to}: ${options.subject}`);
    
    // TODO: Integrate with email provider (SendGrid, AWS SES, etc.)
    // For now, just log the email
    this.logger.debug(`Email content: ${options.html}`);
    
    return true;
  }

  /**
   * Send invoice email
   */
  async sendInvoiceEmail(to: string, data: InvoiceEmailData): Promise<boolean> {
    const html = this.generateInvoiceEmailHTML(data);
    
    return this.send({
      to,
      subject: `Invoice ${data.invoiceNumber} from FlowForge`,
      html,
      text: `Dear ${data.customerName}, your invoice ${data.invoiceNumber} for ₹${data.amount} is ready.`,
    });
  }

  /**
   * Send payment reminder email
   */
  async sendPaymentReminderEmail(
    to: string,
    data: InvoiceEmailData,
    daysOverdue: number
  ): Promise<boolean> {
    const html = this.generatePaymentReminderHTML(data, daysOverdue);
    
    return this.send({
      to,
      subject: `Payment Reminder: Invoice ${data.invoiceNumber}`,
      html,
      text: `Payment reminder for invoice ${data.invoiceNumber}. Amount due: ₹${data.amount}`,
    });
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmationEmail(to: string, data: BookingEmailData): Promise<boolean> {
    const html = this.generateBookingConfirmationHTML(data);
    
    return this.send({
      to,
      subject: `Booking Confirmed - ${data.serviceName}`,
      html,
      text: `Your booking for ${data.serviceName} on ${data.bookingDate} has been confirmed.`,
    });
  }

  /**
   * Send booking reminder email
   */
  async sendBookingReminderEmail(to: string, data: BookingEmailData): Promise<boolean> {
    const html = this.generateBookingReminderHTML(data);
    
    return this.send({
      to,
      subject: `Reminder: Upcoming booking for ${data.serviceName}`,
      html,
      text: `Reminder: Your booking is tomorrow at ${data.startTime}.`,
    });
  }

  /**
   * Generate invoice email HTML
   */
  private generateInvoiceEmailHTML(data: InvoiceEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Invoice ${data.invoiceNumber}</h1>
            </div>
            <div class="content">
              <p>Dear ${data.customerName},</p>
              <p>Your invoice is ready and waiting for payment.</p>
              <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
              <p><strong>Amount Due:</strong> ₹${data.amount.toFixed(2)}</p>
              <p><strong>Due Date:</strong> ${data.dueDate.toLocaleDateString()}</p>
              ${data.paymentLink ? `<p style="text-align: center;"><a href="${data.paymentLink}" class="button">Pay Now</a></p>` : ''}
            </div>
            <div class="footer">
              <p>Powered by FlowForge - Business Management Platform</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate payment reminder HTML
   */
  private generatePaymentReminderHTML(data: InvoiceEmailData, daysOverdue: number): string {
    const urgency = daysOverdue === 0 ? 'due today' : `${daysOverdue} days overdue`;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .button { display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Reminder</h1>
            </div>
            <div class="content">
              <p>Dear ${data.customerName},</p>
              <p>This is a friendly reminder that your invoice is <strong>${urgency}</strong>.</p>
              <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
              <p><strong>Amount Due:</strong> ₹${data.amount.toFixed(2)}</p>
              <p><strong>Original Due Date:</strong> ${data.dueDate.toLocaleDateString()}</p>
              ${data.paymentLink ? `<p style="text-align: center;"><a href="${data.paymentLink}" class="button">Pay Now</a></p>` : ''}
              <p>Please settle this invoice at your earliest convenience.</p>
            </div>
            <div class="footer">
              <p>Powered by FlowForge - Business Management Platform</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate booking confirmation HTML
   */
  private generateBookingConfirmationHTML(data: BookingEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmed</h1>
            </div>
            <div class="content">
              <p>Dear ${data.customerName},</p>
              <p>Your booking has been confirmed!</p>
              <p><strong>Service:</strong> ${data.serviceName}</p>
              <p><strong>Date:</strong> ${data.bookingDate.toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
              <p>We look forward to seeing you!</p>
            </div>
            <div class="footer">
              <p>Powered by FlowForge - Business Management Platform</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate booking reminder HTML
   */
  private generateBookingReminderHTML(data: BookingEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Reminder</h1>
            </div>
            <div class="content">
              <p>Dear ${data.customerName},</p>
              <p>This is a reminder about your upcoming booking tomorrow:</p>
              <p><strong>Service:</strong> ${data.serviceName}</p>
              <p><strong>Date:</strong> ${data.bookingDate.toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
              <p>We look forward to seeing you!</p>
            </div>
            <div class="footer">
              <p>Powered by FlowForge - Business Management Platform</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
