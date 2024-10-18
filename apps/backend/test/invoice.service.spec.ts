import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from '../src/invoice/invoice.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { SchedulerService } from '../src/scheduler/scheduler.service';
import { ConfigService } from '@nestjs/config';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let prisma: PrismaService;

  const mockPrismaService = {
    invoice: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockSchedulerService = {
    schedulePaymentReminders: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        RAZORPAY_KEY_ID: 'rzp_test_key',
        RAZORPAY_KEY_SECRET: 'test_secret',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SchedulerService,
          useValue: mockSchedulerService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an invoice and schedule payment reminders', async () => {
      mockPrismaService.invoice.count.mockResolvedValue(5);

      const invoiceData = {
        businessId: 'business-1',
        customerId: 'customer-1',
        customerName: 'John Doe',
        customerPhone: '+919876543210',
        customerEmail: 'john@example.com',
        items: [
          {
            description: 'Service A',
            quantity: 1,
            unitPrice: 1000,
            amount: 1000,
          },
        ],
        subtotal: 1000,
        tax: 180,
        totalAmount: 1180,
        dueDate: new Date('2025-12-20'),
        status: 'pending' as const,
        notes: 'Payment due in 7 days',
      };

      const createdInvoice = {
        id: 'invoice-1',
        invoiceNumber: 'INV-006',
        ...invoiceData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.invoice.create.mockResolvedValue(createdInvoice);
      mockSchedulerService.schedulePaymentReminders.mockResolvedValue(undefined);

      const result = await service.create(invoiceData);

      expect(result).toEqual(createdInvoice);
      expect(mockPrismaService.invoice.create).toHaveBeenCalled();
      expect(mockSchedulerService.schedulePaymentReminders).toHaveBeenCalledWith(
        createdInvoice.id,
      );
    });
  });

  describe('findAll', () => {
    it('should return all invoices for a business', async () => {
      const mockInvoices = [
        {
          id: 'invoice-1',
          invoiceNumber: 'INV-001',
          businessId: 'business-1',
          totalAmount: 1180,
          status: 'paid',
        },
        {
          id: 'invoice-2',
          invoiceNumber: 'INV-002',
          businessId: 'business-1',
          totalAmount: 2500,
          status: 'pending',
        },
      ];

      mockPrismaService.invoice.findMany.mockResolvedValue(mockInvoices);

      const result = await service.findAll('business-1');

      expect(result).toEqual(mockInvoices);
      expect(mockPrismaService.invoice.findMany).toHaveBeenCalledWith({
        where: { businessId: 'business-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('updateStatus', () => {
    it('should update invoice status to paid', async () => {
      const invoiceId = 'invoice-1';
      const paidAt = new Date();

      const updatedInvoice = {
        id: invoiceId,
        status: 'paid',
        paidAt,
        businessId: 'business-1',
        invoiceNumber: 'INV-001',
      };

      mockPrismaService.invoice.update.mockResolvedValue(updatedInvoice);

      const result = await service.updateStatus(invoiceId, 'paid');

      expect(result).toEqual(updatedInvoice);
      expect(mockPrismaService.invoice.update).toHaveBeenCalledWith({
        where: { id: invoiceId },
        data: expect.objectContaining({
          status: 'paid',
          paidAt: expect.any(Date),
        }),
      });
    });
  });
});
