import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private whatsappService: WhatsappService
  ) {}

  async createBooking(businessId: string, dto: CreateBookingDto) {
    // Validate booking time is in the future
    if (new Date(dto.bookingTime) < new Date()) {
      throw new BadRequestException('Booking time must be in the future');
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
}
