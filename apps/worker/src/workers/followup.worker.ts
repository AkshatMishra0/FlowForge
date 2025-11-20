import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

export const followUpWorker = (prisma: PrismaClient) => {
  return async (job: Job) => {
    const { leadId, businessId, message, stepId } = job.data;

    try {
      // Get business and lead details
      const [business, lead] = await Promise.all([
        prisma.business.findUnique({ where: { id: businessId } }),
        prisma.lead.findUnique({ where: { id: leadId } }),
      ]);

      if (!business || !lead) {
        throw new Error('Business or Lead not found');
      }

      // Send WhatsApp message
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${business.whatsappPhoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: lead.phone,
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${business.whatsappAccessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Log the message
      await prisma.messageLog.create({
        data: {
          businessId,
          leadId,
          phone: lead.phone,
          direction: 'outbound',
          type: 'text',
          content: message,
          whatsappId: response.data.messages?.[0]?.id,
          status: 'sent',
          metadata: response.data,
        },
      });

      // Create activity
      await prisma.activity.create({
        data: {
          leadId,
          type: 'message',
          title: 'Follow-up message sent',
          description: message,
          metadata: { stepId },
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Follow-up worker error:', error);
      throw error;
    }
  };
};
