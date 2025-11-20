import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayClient {
  private razorpay: Razorpay;

  constructor(private config: ConfigService) {
    this.razorpay = new Razorpay({
      key_id: config.get('RAZORPAY_KEY_ID'),
      key_secret: config.get('RAZORPAY_KEY_SECRET'),
    });
  }

  async createPaymentLink(data: {
    amount: number;
    currency: string;
    description: string;
    customer: {
      name: string;
      email?: string;
      contact: string;
    };
    reference_id: string;
    callback_url?: string;
    callback_method?: string;
  }) {
    try {
      const paymentLink = await this.razorpay.paymentLink.create({
        amount: Math.round(data.amount * 100), // Convert to paise
        currency: data.currency,
        description: data.description,
        customer: data.customer,
        reference_id: data.reference_id,
        callback_url: data.callback_url,
        callback_method: data.callback_method || 'get',
      });
      return paymentLink;
    } catch (error) {
      throw new Error(`Razorpay error: ${error.message}`);
    }
  }

  async fetchPaymentLink(id: string) {
    try {
      return await this.razorpay.paymentLink.fetch(id);
    } catch (error) {
      throw new Error(`Razorpay error: ${error.message}`);
    }
  }

  async cancelPaymentLink(id: string) {
    try {
      return await this.razorpay.paymentLink.cancel(id);
    } catch (error) {
      throw new Error(`Razorpay error: ${error.message}`);
    }
  }

  async fetchPayment(id: string) {
    try {
      return await this.razorpay.payments.fetch(id);
    } catch (error) {
      throw new Error(`Razorpay error: ${error.message}`);
    }
  }
}
