import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from '../src/booking/booking.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { SchedulerService } from '../src/scheduler/scheduler.service';
import { GoogleCalendarService } from '../src/booking/google-calendar.service';

describe('BookingService', () => {
  let service: BookingService;
  let prisma: PrismaService;

  const mockPrismaService = {
    booking: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockSchedulerService = {
    scheduleBookingReminder: jest.fn(),
  };

  const mockGoogleCalendarService = {
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SchedulerService,
          useValue: mockSchedulerService,
        },
        {
          provide: GoogleCalendarService,
          useValue: mockGoogleCalendarService,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a booking and schedule reminder', async () => {
      const bookingData = {
        businessId: 'business-1',
        customerId: 'customer-1',
        customerName: 'John Doe',
        customerPhone: '+919876543210',
        customerEmail: 'john@example.com',
        serviceName: 'Haircut',
        bookingDate: new Date('2025-12-15'),
        startTime: '10:00',
        endTime: '11:00',
        status: 'pending' as const,
        notes: 'First time customer',
      };

      const createdBooking = {
        id: 'booking-1',
        ...bookingData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.booking.create.mockResolvedValue(createdBooking);
      mockSchedulerService.scheduleBookingReminder.mockResolvedValue(undefined);
      mockGoogleCalendarService.createEvent.mockResolvedValue({ eventId: 'event-1' });

      const result = await service.create(bookingData);

      expect(result).toEqual(createdBooking);
      expect(mockPrismaService.booking.create).toHaveBeenCalledWith({
        data: bookingData,
      });
      expect(mockSchedulerService.scheduleBookingReminder).toHaveBeenCalledWith(
        createdBooking.id,
      );
    });
  });

  describe('findAll', () => {
    it('should return all bookings for a business', async () => {
      const mockBookings = [
        {
          id: 'booking-1',
          businessId: 'business-1',
          customerName: 'John Doe',
          serviceName: 'Haircut',
          status: 'confirmed',
        },
        {
          id: 'booking-2',
          businessId: 'business-1',
          customerName: 'Jane Smith',
          serviceName: 'Spa',
          status: 'pending',
        },
      ];

      mockPrismaService.booking.findMany.mockResolvedValue(mockBookings);

      const result = await service.findAll('business-1');

      expect(result).toEqual(mockBookings);
      expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith({
        where: { businessId: 'business-1' },
        orderBy: { bookingDate: 'desc' },
      });
    });
  });

  describe('updateStatus', () => {
    it('should update booking status', async () => {
      const bookingId = 'booking-1';
      const newStatus = 'confirmed';

      const updatedBooking = {
        id: bookingId,
        status: newStatus,
        businessId: 'business-1',
        customerName: 'John Doe',
      };

      mockPrismaService.booking.update.mockResolvedValue(updatedBooking);

      const result = await service.updateStatus(bookingId, newStatus);

      expect(result).toEqual(updatedBooking);
      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: { id: bookingId },
        data: { status: newStatus },
      });
    });
  });
});

// Added booking service unit tests - Modified: 2025-12-25 20:07:33
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
