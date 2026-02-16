import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from '../src/search/search.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('SearchService', () => {
  let service: SearchService;
  let prisma: PrismaService;

  const mockPrismaService = {
    lead: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    invoice: {
      findMany: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
    },
    messageLog: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchLeads', () => {
    it('should search leads by name', async () => {
      const mockLeads = [
        { id: '1', name: 'John Doe', phone: '1234567890', email: 'john@example.com' },
      ];
      
      mockPrismaService.lead.findMany.mockResolvedValue(mockLeads);

      const result = await service.searchLeads('John', 'business-1', 10);

      expect(result).toEqual(mockLeads);
      expect(mockPrismaService.lead.findMany).toHaveBeenCalledWith({
        where: {
          businessId: 'business-1',
          OR: expect.any(Array),
        },
        take: 10,
        include: {
          activities: {
            take: 3,
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    });
  });

  describe('globalSearch', () => {
    it('should search across all entities', async () => {
      mockPrismaService.lead.findMany.mockResolvedValue([{ id: '1', name: 'Lead 1' }]);
      mockPrismaService.invoice.findMany.mockResolvedValue([{ id: '2', invoiceNumber: 'INV-001' }]);
      mockPrismaService.booking.findMany.mockResolvedValue([{ id: '3', serviceName: 'Service 1' }]);
      mockPrismaService.messageLog.findMany.mockResolvedValue([{ id: '4', message: 'Hello' }]);

      const result = await service.globalSearch({
        query: 'test',
        businessId: 'business-1',
      });

      expect(result.totalResults).toBe(4);
      expect(result.leads).toHaveLength(1);
      expect(result.invoices).toHaveLength(1);
      expect(result.bookings).toHaveLength(1);
      expect(result.messages).toHaveLength(1);
    });

    it('should filter by entity types', async () => {
      mockPrismaService.lead.findMany.mockResolvedValue([{ id: '1' }]);

      const result = await service.globalSearch({
        query: 'test',
        businessId: 'business-1',
        types: ['leads'],
      });

      expect(result.leads).toHaveLength(1);
      expect(result.invoices).toHaveLength(0);
      expect(result.bookings).toHaveLength(0);
      expect(result.messages).toHaveLength(0);
    });
  });

  describe('advancedLeadSearch', () => {
    it('should search with multiple filters', async () => {
      const mockLeads = [{ id: '1', name: 'John Doe', status: 'new' }];
      
      mockPrismaService.lead.findMany.mockResolvedValue(mockLeads);
      mockPrismaService.lead.count.mockResolvedValue(1);

      const result = await service.advancedLeadSearch({
        businessId: 'business-1',
        query: 'John',
        status: 'new',
        limit: 10,
        offset: 0,
      });

      expect(result.data).toEqual(mockLeads);
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return unique suggestions', async () => {
      mockPrismaService.lead.findMany.mockResolvedValue([
        { name: 'John Doe' },
        { name: 'Jane Doe' },
      ]);
      mockPrismaService.booking.findMany.mockResolvedValue([
        { serviceName: 'Service 1' },
      ]);

      const result = await service.getSearchSuggestions('Jo', 'business-1');

      expect(result).toContain('John Doe');
      expect(result).toContain('Jane Doe');
      expect(result).toContain('Service 1');
    });

    it('should return empty array for short queries', async () => {
      const result = await service.getSearchSuggestions('J', 'business-1');
      expect(result).toEqual([]);
    });
  });
});
