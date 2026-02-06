import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { GoogleCalendarService } from './google-calendar.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private prisma: PrismaService,
    private whatsappService: WhatsappService,
    private schedulerService: SchedulerService,
    private googleCalendarService: GoogleCalendarService,
  ) {}

  async createBooking(businessId: string, dto: CreateBookingDto) {
    this.logger.log(`Creating booking for business ${businessId} - Customer: ${dto.customerName}`);
    
    // Validate inputs
    if (!dto.customerPhone || dto.customerPhone.length < 10) {
      this.logger.warn(`Invalid phone number provided: ${dto.customerPhone}`);
      throw new BadRequestException('Valid customer phone number is required');
    }

    // Validate customer name
    if (!dto.customerName || dto.customerName.trim().length < 2) {
      this.logger.warn(`Invalid customer name provided: ${dto.customerName}`);
      throw new BadRequestException('Customer name must be at least 2 characters');
    }

    // Validate booking time is in the future
    const bookingDate = new Date(dto.bookingDate);
    const now = new Date();
    
    // Set time to start of day for date comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
    
    if (bookingDay < today) {
      this.logger.warn(`Booking rejected: Date ${dto.bookingDate} is in the past`);
      throw new BadRequestException('Booking date must be today or in the future');
    }

    // Validate booking date is not too far in advance (e.g., 6 months)
    const maxAdvanceDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    if (bookingDate > maxAdvanceDate) {
      this.logger.warn(`Booking rejected: Date too far in advance`);
      throw new BadRequestException('Booking date cannot be more than 6 months in advance');
    }
    
    // Validate time format
    if (!this.isValidTimeFormat(dto.startTime) || !this.isValidTimeFormat(dto.endTime)) {
      this.logger.error(`Invalid time format - Start: ${dto.startTime}, End: ${dto.endTime}`);
      throw new BadRequestException('Invalid time format. Use HH:MM format');
    }
    
    // Validate end time is after start time
    if (!this.isEndTimeAfterStartTime(dto.startTime, dto.endTime)) {
      this.logger.warn(`End time before start time - Start: ${dto.startTime}, End: ${dto.endTime}`);
      throw new BadRequestException('End time must be after start time');
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
  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Check if end time is after start time
   */
  private isEndTimeAfterStartTime(startTime: string, endTime: string): boolean {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    if (endHour > startHour) return true;
    if (endHour === startHour && endMinute > startMinute) return true;
    
    return false;
  }
}
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
