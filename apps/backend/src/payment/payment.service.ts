import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export interface PaymentLinkOptions {
  amount: number;
  currency?: string;
  description: string;
  customer: {
    name: string;
    email?: string;
    contact: string;
  };
  notify?: {
    sms?: boolean;
    email?: boolean;
  };
  reminder_enable?: boolean;
  callback_url?: string;
  callback_method?: string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private razorpay: Razorpay;

  constructor(private configService: ConfigService) {
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
  }

  async createPaymentLink(options: PaymentLinkOptions): Promise<any> {
    return this.retryWithBackoff(async () => {
      const paymentLink = await this.razorpay.paymentLink.create({
        amount: options.amount * 100, // Convert to paise
        currency: options.currency || 'INR',
        description: options.description,
        customer: options.customer,
        notify: options.notify || { sms: true, email: true },
        reminder_enable: options.reminder_enable !== false,
        callback_url: options.callback_url,
        callback_method: options.callback_method || 'get',
      });

      this.logger.log(`Payment link created: ${paymentLink.id}`);
      return paymentLink;
    });
  }

  async getPaymentLink(paymentLinkId: string): Promise<any> {
    try {
      return await this.razorpay.paymentLink.fetch(paymentLinkId);
    } catch (error) {
      this.logger.error(`Failed to fetch payment link: ${paymentLinkId}`, error);
      throw error;
    }
  }

  async cancelPaymentLink(paymentLinkId: string): Promise<any> {
    try {
      return await this.razorpay.paymentLink.cancel(paymentLinkId);
    } catch (error) {
      this.logger.error(`Failed to cancel payment link: ${paymentLinkId}`, error);
      throw error;
    }
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      this.logger.error('Failed to verify webhook signature', error);
      return false;
    }
  }

  async createOrder(options: {
    amount: number;
    currency?: string;
    receipt?: string;
    notes?: any;
  }): Promise<any> {
    try {
      const order = await this.razorpay.orders.create({
        amount: options.amount * 100,
        currency: options.currency || 'INR',
        receipt: options.receipt,
        notes: options.notes,
      });

      this.logger.log(`Order created: ${order.id}`);
      return order;
    } catch (error) {
      this.logger.error('Failed to create order', error);
      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<any> {
    try {
      return await this.razorpay.payments.fetch(paymentId);
    } catch (error) {
      this.logger.error(`Failed to fetch payment: ${paymentId}`, error);
      throw error;
    }
  }

  async capturePayment(paymentId: string, amount: number, currency: string = 'INR'): Promise<any> {
    try {
      return await this.razorpay.payments.capture(paymentId, amount * 100, currency);
    } catch (error) {
      this.logger.error(`Failed to capture payment: ${paymentId}`, error);
      throw error;
    }
  }

  async refundPayment(
    paymentId: string,
    options?: { amount?: number; notes?: any; speed?: 'normal' | 'optimum' },
  ): Promise<any> {
    try {
      const refundData: any = {};
      if (options?.amount) refundData.amount = options.amount * 100;
      if (options?.notes) refundData.notes = options.notes;
      if (options?.speed) refundData.speed = options.speed;

      const refund = await this.razorpay.payments.refund(paymentId, refundData);
      this.logger.log(`Refund created: ${refund.id} for payment: ${paymentId}`);
      return refund;
    } catch (error) {
      this.logger.error(`Failed to refund payment: ${paymentId}`, error);
      throw error;
    }
  }

  async getRefund(refundId: string): Promise<any> {
    try {
      return await this.razorpay.refunds.fetch(refundId);
    } catch (error) {
      this.logger.error(`Failed to fetch refund: ${refundId}`, error);
      throw error;
    }
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 500,
  ): Promise<T> {
    let lastError: Error;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          this.logger.warn(
            `Payment API attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    this.logger.error(`Payment API failed after ${maxRetries} attempts`);
    throw lastError;
  }
}
