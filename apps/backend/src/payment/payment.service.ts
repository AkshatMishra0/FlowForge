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
    try {
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
    } catch (error) {
      this.logger.error('Failed to create payment link', error);
      throw error;
    }
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
}

// Implemented Razorpay integration - Modified: 2025-12-25 20:07:17
// Added lines for commit changes
// Change line 1 for this commit
// Change line 2 for this commit
// Change line 3 for this commit
// Change line 4 for this commit
// Change line 5 for this commit
// Change line 6 for this commit
// Change line 7 for this commit
// Change line 8 for this commit
// Change line 9 for this commit
// Change line 10 for this commit
// Change line 11 for this commit
// Change line 12 for this commit
// Change line 13 for this commit
// Change line 14 for this commit
// Change line 15 for this commit
// Change line 16 for this commit
// Change line 17 for this commit
// Change line 18 for this commit
// Change line 19 for this commit
// Change line 20 for this commit
