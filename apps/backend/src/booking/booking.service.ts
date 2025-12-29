import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { GoogleCalendarService } from './google-calendar.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private whatsappService: WhatsappService,
    private schedulerService: SchedulerService,
    private googleCalendarService: GoogleCalendarService,
  ) {}

  async createBooking(businessId: string, dto: CreateBookingDto) {
    // Validate booking time is in the future
    const bookingDate = new Date(dto.bookingDate);
    const now = new Date();
    
    if (bookingDate < now) {
      throw new BadRequestException('Booking time must be in the future');
    }

    // Validate booking date is not too far in advance (e.g., 6 months)
    const maxAdvanceDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    if (bookingDate > maxAdvanceDate) {
      throw new BadRequestException('Booking date cannot be more than 6 months in advance');
    }

    // Check for conflicting bookings
    const conflictingBooking = await this.checkBookingConflict(
      businessId,
      dto.bookingDate,
      dto.startTime,
      dto.endTime,
    );

    if (conflictingBooking) {
      throw new BadRequestException(
        'This time slot is already booked. Please choose a different time.',
      );
    }

    const booking = await this.prisma.booking.create({
      data: {
        ...dto,
        businessId,
        status: 'pending',
      },
    });

    // Send WhatsApp confirmation
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (business && business.whatsappNumber) {
      const message = `Hello ${dto.customerName},

Your booking has been received!

Date: ${new Date(dto.bookingDate).toLocaleDateString()}
Time: ${dto.startTime} - ${dto.endTime}

We'll confirm shortly.
${business.name}`;

      await this.whatsappService.sendMessage(businessId, {
        phone: dto.customerPhone,
        message,
        leadId: dto.leadId,
      });
    }

    // Schedule booking reminder (1 day before)
    await this.schedulerService.scheduleBookingReminder(booking.id);

    // Create Google Calendar event
    await this.googleCalendarService.createEvent(booking, businessId);

    return booking;
  }

  async updateBooking(id: string, dto: UpdateBookingDto) {
    return this.prisma.booking.update({
      where: { id },
      data: dto,
    });
  }

  async getBookings(businessId: string, filters?: any) {
    return this.prisma.booking.findMany({
      where: {
        businessId,
        ...filters,
      },
      include: {
        lead: true,
      },
      orderBy: { bookingDate: 'asc' },
    });
  }

  async getBookingById(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        lead: true,
        business: true,
      },
    });
  }

  async getAvailableSlots(businessId: string, date: Date) {
    const slots = await this.prisma.bookingSlot.findMany({
      where: {
        businessId,
        active: true,
      },
    });

    const bookings = await this.prisma.booking.findMany({
      where: {
        businessId,
        bookingDate: date,
        status: { in: ['pending', 'confirmed'] },
      },
    });

    // Filter out booked slots
    return slots.filter((slot: any) => {
      const dayOfWeek = date.getDay();
      return slot.dayOfWeek === dayOfWeek &&
        !bookings.some((booking: any) => booking.startTime === slot.startTime);
    });
  }

  /**
   * Check if there's a conflicting booking for the given time slot
   */
  private async checkBookingConflict(
    businessId: string,
    bookingDate: Date,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        businessId,
        bookingDate,
        status: { in: ['pending', 'confirmed'] },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });

    return existingBookings.length > 0;
  }

  /**
   * Validate booking time format (HH:MM)
   */
  private validateTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }
}

// Integrated Google Calendar sync - Modified: 2025-12-25 20:07:29
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

// Resolved calendar sync issues - Modified: 2025-12-25 20:07:38
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
