import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RazorpayClient } from './razorpay.client';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './dto/invoice.dto';
import { addDays } from 'date-fns';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private prisma: PrismaService,
    private razorpayClient: RazorpayClient,
    private whatsappService: WhatsappService,
    private schedulerService: SchedulerService,
  ) {}

  async createInvoice(businessId: string, dto: CreateInvoiceDto) {
    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(businessId);

    // Calculate totals
    const amount = dto.items.reduce((sum, item) => sum + item.amount, 0);
    const totalAmount = amount + (dto.tax || 0) - (dto.discount || 0);

    // Create invoice
    const invoice = await this.prisma.invoice.create({
      data: {
        businessId,
        invoiceNumber,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        customerAddress: dto.customerAddress,
        amount,
        tax: dto.tax || 0,
        discount: dto.discount || 0,
        totalAmount,
        currency: dto.currency || 'INR',
        status: 'draft',
        dueDate: dto.dueDate,
        notes: dto.notes,
        termsAndConditions: dto.termsAndConditions,
        leadId: dto.leadId,
        items: {
          create: dto.items,
        },
      },
      include: {
        items: true,
      },
    });

    // Create Razorpay payment link
    if (dto.sendPaymentLink) {
      await this.createPaymentLink(invoice.id);
    }

    // Send invoice via WhatsApp
    if (dto.sendWhatsApp) {
      await this.sendInvoiceWhatsApp(invoice.id);
    }

    // Schedule payment reminders if due date is set
    if (dto.dueDate) {
      await this.schedulePaymentReminders(invoice.id, new Date(dto.dueDate));
    }

    // Create activity
    if (dto.leadId) {
      await this.prisma.activity.create({
        data: {
          leadId: dto.leadId,
          type: 'invoice',
          title: 'Invoice created',
          description: `Invoice ${invoiceNumber} created for ${totalAmount} ${dto.currency || 'INR'}`,
          metadata: { invoiceId: invoice.id },
        },
      });
    }

    return invoice;
  }

  private async schedulePaymentReminders(invoiceId: string, dueDate: Date) {
    // Same day reminder (on due date at 9 AM)
    const sameDayTime = new Date(dueDate);
    sameDayTime.setHours(9, 0, 0, 0);
    if (sameDayTime > new Date()) {
      await this.schedulerService.schedulePaymentReminder(invoiceId, 'same_day', sameDayTime);
    }

    // Day 1 after due date
    const day1Time = addDays(dueDate, 1);
    day1Time.setHours(9, 0, 0, 0);
    if (day1Time > new Date()) {
      await this.schedulerService.schedulePaymentReminder(invoiceId, 'day_1', day1Time);
    }

    // Day 7 after due date
    const day7Time = addDays(dueDate, 7);
    day7Time.setHours(9, 0, 0, 0);
    if (day7Time > new Date()) {
      await this.schedulerService.schedulePaymentReminder(invoiceId, 'day_7', day7Time);
    }
  }

  async createPaymentLink(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { business: true },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const paymentLink = await this.razorpayClient.createPaymentLink({
      amount: invoice.totalAmount,
      currency: invoice.currency,
      description: `Invoice ${invoice.invoiceNumber}`,
      customer: {
        name: invoice.customerName,
        email: invoice.customerEmail || undefined,
        contact: invoice.customerPhone,
      },
      reference_id: invoice.id,
      callback_url: `${frontendUrl}/invoice/${invoice.id}/success`,
      callback_method: 'get',
    });

    // Update invoice with payment link
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        razorpayPaymentLinkId: paymentLink.id,
        status: 'sent',
      },
    });

    return paymentLink;
  }

  async sendInvoiceWhatsApp(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { business: true },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const invoiceUrl = `${frontendUrl}/invoice/${invoice.id}`;

    const message = `Hello ${invoice.customerName},

Your invoice #${invoice.invoiceNumber} for ${invoice.currency} ${invoice.totalAmount} is ready.

View and pay online: ${invoiceUrl}

Thank you!
${invoice.business.name}`;

    await this.whatsappService.sendMessage(invoice.businessId, {
      phone: invoice.customerPhone,
      message,
      leadId: invoice.leadId || undefined,
    });
  }

  async updateInvoiceStatus(id: string, dto: UpdateInvoiceStatusDto) {
    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        status: dto.status,
        paidAt: dto.status === 'paid' ? new Date() : null,
        razorpayPaymentId: dto.paymentId,
        razorpayOrderId: dto.orderId,
      },
    });

    // Create activity
    if (invoice.leadId) {
      await this.prisma.activity.create({
        data: {
          leadId: invoice.leadId,
          type: 'invoice',
          title: `Invoice ${dto.status}`,
          description: `Invoice ${invoice.invoiceNumber} marked as ${dto.status}`,
          metadata: { invoiceId: invoice.id },
        },
      });
    }

    return invoice;
  }

  async getInvoices(businessId: string, filters?: any) {
    return this.prisma.invoice.findMany({
      where: {
        businessId,
        ...filters,
      },
      include: {
        items: true,
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

  async getInvoiceById(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        lead: true,
        business: true,
        paymentReminders: true,
      },
    });
  }

  private async generateInvoiceNumber(businessId: string): Promise<string> {
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastInvoice) {
      return 'INV-0001';
    }

    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
    return `INV-${String(lastNumber + 1).padStart(4, '0')}`;
  }
}

// Added payment reminder scheduling - Modified: 2025-12-25 20:07:28
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
