import { Test, TestingModule } from '@nestjs/testing';
import { BulkOperationsService } from '../src/bulk-operations/bulk-operations.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('BulkOperationsService', () => {
  let service: BulkOperationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    lead: {
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
    invoice: {
      update: jest.fn(),
    },
    booking: {
      update: jest.fn(),
    },
    activity: {
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkOperationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BulkOperationsService>(BulkOperationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('bulkUpdateLeadStatus', () => {
    it('should update multiple leads successfully', async () => {
      mockPrismaService.lead.update.mockResolvedValue({ id: '1', status: 'qualified' });

      const result = await service.bulkUpdateLeadStatus(
        ['lead-1', 'lead-2'],
        'qualified',
        'business-1'
      );

      expect(result.updated).toBe(2);
      expect(result.failed).toBe(0);
      expect(mockPrismaService.lead.update).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures', async () => {
      mockPrismaService.lead.update
        .mockResolvedValueOnce({ id: '1', status: 'qualified' })
        .mockRejectedValueOnce(new Error('Not found'));

      const result = await service.bulkUpdateLeadStatus(
        ['lead-1', 'lead-2'],
        'qualified',
        'business-1'
      );

      expect(result.updated).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('bulkDeleteLeads', () => {
    it('should delete leads and their activities', async () => {
      mockPrismaService.activity.deleteMany.mockResolvedValue({ count: 3 });
      mockPrismaService.lead.delete.mockResolvedValue({ id: 'lead-1' });

      const result = await service.bulkDeleteLeads(['lead-1', 'lead-2'], 'business-1');

      expect(result.updated).toBe(2);
      expect(result.failed).toBe(0);
      expect(mockPrismaService.activity.deleteMany).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.lead.delete).toHaveBeenCalledTimes(2);
    });
  });

  describe('bulkImportLeads', () => {
    it('should import multiple leads', async () => {
      mockPrismaService.lead.create.mockResolvedValue({ id: 'new-lead' });

      const data = [
        { name: 'John Doe', phone: '1234567890' },
        { name: 'Jane Doe', phone: '0987654321', email: 'jane@example.com' },
      ];

      const result = await service.bulkImportLeads(data, 'business-1');

      expect(result.updated).toBe(2);
      expect(result.failed).toBe(0);
      expect(mockPrismaService.lead.create).toHaveBeenCalledTimes(2);
    });

    it('should handle import errors', async () => {
      mockPrismaService.lead.create
        .mockResolvedValueOnce({ id: 'new-lead-1' })
        .mockRejectedValueOnce(new Error('Duplicate entry'));

      const data = [
        { name: 'John Doe', phone: '1234567890' },
        { name: 'Jane Doe', phone: '1234567890' }, // Duplicate
      ];

      const result = await service.bulkImportLeads(data, 'business-1');

      expect(result.updated).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('bulkSendInvoices', () => {
    it('should update invoice status to sent', async () => {
      mockPrismaService.invoice.update.mockResolvedValue({
        id: 'invoice-1',
        status: 'sent',
      });

      const result = await service.bulkSendInvoices(
        ['invoice-1', 'invoice-2'],
        'business-1'
      );

      expect(result.updated).toBe(2);
      expect(result.failed).toBe(0);
      expect(mockPrismaService.invoice.update).toHaveBeenCalledWith({
        where: expect.objectContaining({ id: expect.any(String) }),
        data: expect.objectContaining({ status: 'sent', sentAt: expect.any(Date) }),
      });
    });
  });

  describe('bulkCancelBookings', () => {
    it('should cancel multiple bookings', async () => {
      mockPrismaService.booking.update.mockResolvedValue({
        id: 'booking-1',
        status: 'cancelled',
      });

      const result = await service.bulkCancelBookings(
        ['booking-1', 'booking-2'],
        'business-1'
      );

      expect(result.updated).toBe(2);
      expect(result.failed).toBe(0);
      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: expect.objectContaining({ id: expect.any(String) }),
        data: expect.objectContaining({
          status: 'cancelled',
          cancelledAt: expect.any(Date),
        }),
      });
    });
  });
});
