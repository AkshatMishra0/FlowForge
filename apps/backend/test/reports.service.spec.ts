import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from '../src/reports/reports.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    lead: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    invoice: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    messageLog: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateBusinessReport', () => {
    it('should generate comprehensive report with all data', async () => {
      const mockLeads = [{ id: '1', name: 'Lead 1' }];
      const mockInvoices = [{ id: '2', total: 1000 }];
      const mockBookings = [{ id: '3', serviceName: 'Service 1' }];
      const mockMessages = [{ id: '4', message: 'Hello' }];

      mockPrismaService.lead.findMany.mockResolvedValue(mockLeads);
      mockPrismaService.invoice.findMany.mockResolvedValue(mockInvoices);
      mockPrismaService.booking.findMany.mockResolvedValue(mockBookings);
      mockPrismaService.messageLog.findMany.mockResolvedValue(mockMessages);

      const result = await service.generateBusinessReport('business-1', { format: 'json' });

      expect(result.leads).toEqual(mockLeads);
      expect(result.invoices).toEqual(mockInvoices);
      expect(result.bookings).toEqual(mockBookings);
      expect(result.messages).toEqual(mockMessages);
    });
  });

  describe('getRevenueReport', () => {
    it('should calculate revenue statistics', async () => {
      const mockInvoices = [
        { id: '1', total: 1000, status: 'paid' },
        { id: '2', total: 2000, status: 'paid' },
        { id: '3', total: 1500, status: 'pending' },
      ];

      mockPrismaService.invoice.findMany.mockResolvedValue(mockInvoices);

      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      const result = await service.getRevenueReport('business-1', startDate, endDate);

      expect(result.totalInvoices).toBe(3);
      expect(result.paidInvoices).toBe(2);
      expect(result.totalRevenue).toBe(4500);
      expect(result.paidRevenue).toBe(3000);
      expect(result.pendingRevenue).toBe(1500);
      expect(result.averageInvoiceValue).toBe(1500);
    });
  });

  describe('getLeadConversionReport', () => {
    it('should calculate conversion rate', async () => {
      const mockLeads = [
        { id: '1', status: 'new' },
        { id: '2', status: 'converted' },
        { id: '3', status: 'converted' },
        { id: '4', status: 'lost' },
      ];

      mockPrismaService.lead.findMany.mockResolvedValue(mockLeads);

      const result = await service.getLeadConversionReport('business-1');

      expect(result.totalLeads).toBe(4);
      expect(result.convertedLeads).toBe(2);
      expect(result.conversionRate).toBe('50.00%');
      expect(result.statusBreakdown).toEqual({
        new: 1,
        converted: 2,
        lost: 1,
      });
    });
  });

  describe('getMonthlySummary', () => {
    it('should generate monthly statistics', async () => {
      mockPrismaService.lead.count.mockResolvedValue(10);
      mockPrismaService.invoice.aggregate.mockResolvedValue({
        _count: 5,
        _sum: { total: 5000 },
      });
      mockPrismaService.booking.count.mockResolvedValue(8);
      mockPrismaService.messageLog.count.mockResolvedValue(50);

      const result = await service.getMonthlySummary('business-1', 2026, 2);

      expect(result.year).toBe(2026);
      expect(result.month).toBe(2);
      expect(result.summary.newLeads).toBe(10);
      expect(result.summary.invoicesIssued).toBe(5);
      expect(result.summary.totalRevenue).toBe(5000);
      expect(result.summary.bookingsMade).toBe(8);
      expect(result.summary.messagesSent).toBe(50);
    });
  });

  describe('exportLeads', () => {
    it('should export leads as CSV', async () => {
      const mockLeads = [
        {
          id: '1',
          name: 'John Doe',
          phone: '1234567890',
          email: 'john@example.com',
          status: 'new',
          source: 'website',
          createdAt: new Date('2026-01-01'),
          activities: [],
        },
      ];

      mockPrismaService.lead.findMany.mockResolvedValue(mockLeads);

      const result = await service.exportLeads('business-1', { format: 'csv' });

      expect(result).toContain('id,name,phone,email,status,source,createdAt');
      expect(result).toContain('1,John Doe,1234567890,john@example.com,new,website');
    });

    it('should export leads as JSON', async () => {
      const mockLeads = [{ id: '1', name: 'John Doe' }];
      mockPrismaService.lead.findMany.mockResolvedValue(mockLeads);

      const result = await service.exportLeads('business-1', { format: 'json' });

      const parsed = JSON.parse(result);
      expect(parsed).toEqual(mockLeads);
    });
  });
});
