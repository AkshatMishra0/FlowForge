import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

export const paymentReminderWorker = (prisma: PrismaClient) => {
  return async (job: Job) => {
    const { invoiceId, reminderType } = job.data;

    try {
      // Get invoice details
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { business: true },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Skip if already paid
      if (invoice.status === 'paid') {
        return { skipped: true, reason: 'Already paid' };
      }

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const invoiceUrl = `${frontendUrl}/invoice/${invoice.id}`;

      const messages = {
        same_day: `Hi ${invoice.customerName},\n\nReminder: Your invoice #${invoice.invoiceNumber} for ${invoice.currency} ${invoice.totalAmount} is due today.\n\nPay now: ${invoiceUrl}\n\nThank you!`,
        day_1: `Hi ${invoice.customerName},\n\nYour invoice #${invoice.invoiceNumber} is now 1 day overdue. Please make payment at your earliest convenience.\n\nAmount: ${invoice.currency} ${invoice.totalAmount}\nPay now: ${invoiceUrl}`,
        day_7: `Hi ${invoice.customerName},\n\nFinal reminder: Your invoice #${invoice.invoiceNumber} is 7 days overdue.\n\nAmount: ${invoice.currency} ${invoice.totalAmount}\nPay now: ${invoiceUrl}\n\nPlease contact us if you have any questions.`,
      };

      const message = messages[reminderType as keyof typeof messages] || messages.same_day;

      // Send WhatsApp message
      await axios.post(
        `https://graph.facebook.com/v18.0/${invoice.business.whatsappPhoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: invoice.customerPhone,
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${invoice.business.whatsappAccessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update payment reminder status
      await prisma.paymentReminder.updateMany({
        where: {
          invoiceId,
          reminderType,
          status: 'pending',
        },
        data: {
          status: 'sent',
          sentAt: new Date(),
        },
      });

      // Update invoice status to overdue if applicable
      if (invoice.status === 'sent' && invoice.dueDate && new Date() > invoice.dueDate) {
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: 'overdue' },
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Payment reminder worker error:', error);
      throw error;
    }
  };
};
