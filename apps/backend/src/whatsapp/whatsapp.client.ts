import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WhatsappClient {
  private readonly apiVersion: string;
  private readonly phoneNumberId: string;
  private readonly accessToken: string;
  private readonly baseUrl: string;

  constructor(private config: ConfigService) {
    this.apiVersion = config.get('WHATSAPP_API_VERSION') || 'v18.0';
    this.phoneNumberId = config.get('WHATSAPP_PHONE_NUMBER_ID') || '';
    this.accessToken = config.get('WHATSAPP_ACCESS_TOKEN') || '';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`;
  }

  async sendTextMessage(to: string, message: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`WhatsApp API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async sendTemplateMessage(to: string, templateName: string, languageCode: string, components?: any[]) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components: components || [],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`WhatsApp API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async sendImageMessage(to: string, imageUrl: string, caption?: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'image',
          image: {
            link: imageUrl,
            caption,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`WhatsApp API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async sendDocumentMessage(to: string, documentUrl: string, filename: string, caption?: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: 'whatsapp',
          to,
          type: 'document',
          document: {
            link: documentUrl,
            filename,
            caption,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`WhatsApp API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}
