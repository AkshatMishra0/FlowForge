import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface SearchOptions {
  query: string;
  businessId: string;
  types?: ('leads' | 'invoices' | 'bookings' | 'messages')[];
  limit?: number;
}

export interface SearchResult {
  leads: any[];
  invoices: any[];
  bookings: any[];
  messages: any[];
  totalResults: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Global search across all entities
   */
  async globalSearch(options: SearchOptions): Promise<SearchResult> {
    this.logger.log(`Global search for: "${options.query}"`);

    const { query, businessId, types, limit = 10 } = options;
    const searchTypes = types || ['leads', 'invoices', 'bookings', 'messages'];

    const [leads, invoices, bookings, messages] = await Promise.all([
      searchTypes.includes('leads') ? this.searchLeads(query, businessId, limit) : [],
      searchTypes.includes('invoices') ? this.searchInvoices(query, businessId, limit) : [],
      searchTypes.includes('bookings') ? this.searchBookings(query, businessId, limit) : [],
      searchTypes.includes('messages') ? this.searchMessages(query, businessId, limit) : [],
    ]);

    const totalResults = leads.length + invoices.length + bookings.length + messages.length;

    this.logger.log(`Found ${totalResults} results for "${query}"`);

    return {
      leads,
      invoices,
      bookings,
      messages,
      totalResults,
    };
  }

  /**
   * Search leads by name, phone, email, or custom fields
   */
  async searchLeads(query: string, businessId: string, limit: number = 10) {
    return this.prisma.lead.findMany({
      where: {
        businessId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
          { email: { contains: query, mode: 'insensitive' } },
          { notes: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: {
        activities: {
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Search invoices by invoice number, customer name, or description
   */
  async searchInvoices(query: string, businessId: string, limit: number = 10) {
    return this.prisma.invoice.findMany({
      where: {
        businessId,
        OR: [
          { invoiceNumber: { contains: query, mode: 'insensitive' } },
          { lead: { name: { contains: query, mode: 'insensitive' } } },
          { lead: { phone: { contains: query } } },
          { notes: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: {
        lead: true,
        items: true,
      },
    });
  }

  /**
   * Search bookings by customer name, service name, or phone
   */
  async searchBookings(query: string, businessId: string, limit: number = 10) {
    return this.prisma.booking.findMany({
      where: {
        businessId,
        OR: [
          { serviceName: { contains: query, mode: 'insensitive' } },
          { lead: { name: { contains: query, mode: 'insensitive' } } },
          { lead: { phone: { contains: query } } },
          { notes: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: {
        lead: true,
      },
    });
  }

  /**
   * Search messages by content or contact name
   */
  async searchMessages(query: string, businessId: string, limit: number = 10) {
    return this.prisma.messageLog.findMany({
      where: {
        businessId,
        OR: [
          { message: { contains: query, mode: 'insensitive' } },
          { lead: { name: { contains: query, mode: 'insensitive' } } },
          { lead: { phone: { contains: query } } },
        ],
      },
      take: limit,
      include: {
        lead: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Advanced lead search with filters
   */
  async advancedLeadSearch(params: {
    businessId: string;
    query?: string;
    status?: string;
    source?: string;
    dateFrom?: Date;
    dateTo?: Date;
    assignedTo?: string;
    limit?: number;
    offset?: number;
  }) {
    const {
      businessId,
      query,
      status,
      source,
      dateFrom,
      dateTo,
      assignedTo,
      limit = 50,
      offset = 0,
    } = params;

    const where: Prisma.LeadWhereInput = {
      businessId,
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
      ...(source && { source }),
      ...(assignedTo && { assignedTo }),
      ...(dateFrom &&
        dateTo && {
          createdAt: {
            gte: dateFrom,
            lte: dateTo,
          },
        }),
    };

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          activities: {
            take: 3,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data: leads,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(query: string, businessId: string): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const [leadNames, serviceNames] = await Promise.all([
      this.prisma.lead.findMany({
        where: {
          businessId,
          name: { contains: query, mode: 'insensitive' },
        },
        select: { name: true },
        take: 5,
      }),
      this.prisma.booking.findMany({
        where: {
          businessId,
          serviceName: { contains: query, mode: 'insensitive' },
        },
        select: { serviceName: true },
        take: 5,
        distinct: ['serviceName'],
      }),
    ]);

    const suggestions = [
      ...leadNames.map((l) => l.name),
      ...serviceNames.map((s) => s.serviceName),
    ];

    return Array.from(new Set(suggestions)).slice(0, 10);
  }
}
