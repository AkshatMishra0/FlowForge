import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { format } from 'date-fns';

export const bookingReminderWorker = (prisma: PrismaClient) => {
  return async (job: Job) => {
    const { bookingId } = job.data;

    try {
      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { business: true },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Skip if cancelled or completed
      if (['cancelled', 'completed', 'no_show'].includes(booking.status)) {
        return { skipped: true, reason: `Booking is ${booking.status}` };
      }

      const bookingDate = format(new Date(booking.bookingDate), 'MMMM d, yyyy');
      const message = `Hi ${booking.customerName},\n\nThis is a reminder for your upcoming appointment:\n\nDate: ${bookingDate}\nTime: ${booking.startTime} - ${booking.endTime}\n\nLooking forward to seeing you!\n\n${booking.business.name}`;

      // Send WhatsApp message
      await axios.post(
        `https://graph.facebook.com/v18.0/${booking.business.whatsappPhoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: booking.customerPhone,
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${booking.business.whatsappAccessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Log the message
      await prisma.messageLog.create({
        data: {
          businessId: booking.businessId,
          leadId: booking.leadId,
          phone: booking.customerPhone,
          direction: 'outbound',
          type: 'text',
          content: message,
          status: 'sent',
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Booking reminder worker error:', error);
      throw error;
    }
  };
};
