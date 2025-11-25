import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappClient } from './whatsapp.client';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class WhatsappService {
  constructor(
    private prisma: PrismaService,
    private whatsappClient: WhatsappClient
  ) {}

  async sendMessage(businessId: string, dto: SendMessageDto) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Send message via WhatsApp API
    let result;
    if (dto.type === 'template') {
      result = await this.whatsappClient.sendTemplateMessage(
        dto.phone,
        dto.templateName || '',
        dto.languageCode || 'en',
        dto.templateComponents || [],
      );
    } else {
      result = await this.whatsappClient.sendTextMessage(dto.phone, dto.message || '');
    }

    // Log message in database
    const messageLog = await this.prisma.messageLog.create({
      data: {
        businessId,
        phone: dto.phone,
        direction: 'outbound',
        type: dto.type || 'text',
        content: dto.message || '',
        templateName: dto.templateName,
        whatsappId: result.messages?.[0]?.id,
        status: 'sent',
        metadata: result,
      },
    });

    // If leadId provided, link to lead
    if (dto.leadId) {
      await this.prisma.messageLog.update({
        where: { id: messageLog.id },
        data: { leadId: dto.leadId },
      });

      // Create activity
      await this.prisma.activity.create({
        data: {
          leadId: dto.leadId,
          type: 'message',
          title: 'WhatsApp message sent',
          description: dto.message,
          metadata: { messageLogId: messageLog.id },
        },
      });
    }

    return messageLog;
  }

  async handleWebhook(payload: any) {
    // Verify webhook
    if (payload.object !== 'whatsapp_business_account') {
      return;
    }

    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'messages') {
          await this.processIncomingMessage(change.value);
        }
      }
    }
  }

  private async processIncomingMessage(value: any) {
    const message = value.messages?.[0];
    if (!message) return;

    const from = message.from;
    const messageType = message.type;
    const messageId = message.id;

    let content = '';
    if (messageType === 'text') {
      content = message.text.body;
    } else if (messageType === 'image') {
      content = message.image.caption || 'Image received';
    } else if (messageType === 'document') {
      content = message.document.caption || 'Document received';
    }

    // Find business by phone number ID
    const business = await this.prisma.business.findFirst({
      where: { whatsappPhoneNumberId: value.metadata.phone_number_id },
    });

    if (!business) {
      console.error('Business not found for phone number ID:', value.metadata.phone_number_id);
      return;
    }

    // Find or create lead
    let lead = await this.prisma.lead.findFirst({
      where: {
        businessId: business.id,
        phone: from,
      },
    });

    if (!lead) {
      lead = await this.prisma.lead.create({
        data: {
          businessId: business.id,
          phone: from,
          whatsapp: from,
          name: value.contacts?.[0]?.profile?.name || 'Unknown',
          source: 'whatsapp',
          status: 'new',
        },
      });
    }

    // Log incoming message
    await this.prisma.messageLog.create({
      data: {
        businessId: business.id,
        leadId: lead.id,
        phone: from,
        direction: 'inbound',
        type: messageType,
        content,
        whatsappId: messageId,
        status: 'received',
        metadata: message,
      },
    });

    // Create activity
    await this.prisma.activity.create({
      data: {
        leadId: lead.id,
        type: 'message',
        title: 'WhatsApp message received',
        description: content,
        metadata: { messageId },
      },
    });
  }

  async getMessages(businessId: string, filters?: any) {
    return this.prisma.messageLog.findMany({
      where: {
        businessId,
        ...filters,
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMessageById(id: string) {
    return this.prisma.messageLog.findUnique({
      where: { id },
      include: {
        lead: true,
        business: true,
      },
    });
  }
}
