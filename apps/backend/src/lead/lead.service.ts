import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';

@Injectable()
export class LeadService {
  constructor(private prisma: PrismaService) {}

  async createLead(businessId: string, dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: {
        ...dto,
        businessId,
      },
    });
  }

  async updateLead(id: string, dto: UpdateLeadDto) {
    return this.prisma.lead.update({
      where: { id },
      data: dto,
    });
  }

  async getLeads(businessId: string, filters?: any) {
    return this.prisma.lead.findMany({
      where: {
        businessId,
        ...filters,
      },
      include: {
        _count: {
          select: {
            messageLogs: true,
            invoices: true,
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLeadById(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: {
        messageLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
        bookings: {
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
  }

  async deleteLead(id: string) {
    return this.prisma.lead.delete({
      where: { id },
    });
  }

  async searchLeads(
    businessId: string,
    query: string,
    pagination?: { page?: number; limit?: number },
  ) {
    const { page = 1, limit = 20 } = pagination || {};
    const skip = (page - 1) * limit;

    const where = {
      businessId,
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
        { phone: { contains: query } },
        { company: { contains: query, mode: 'insensitive' as const } },
        { notes: { contains: query, mode: 'insensitive' as const } },
      ],
    };

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { messageLogs: true, invoices: true, bookings: true },
          },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  }

  async bulkCreateLeads(businessId: string, leads: CreateLeadDto[]) {
    const results = { created: 0, skipped: 0, errors: [] as string[] };

    for (const dto of leads) {
      try {
        const existing = await this.prisma.lead.findFirst({
          where: { businessId, phone: dto.phone },
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        await this.prisma.lead.create({ data: { ...dto, businessId } });
        results.created++;
      } catch (err) {
        results.errors.push(`Failed to create lead ${dto.name}: ${err.message}`);
      }
    }

    return results;
  }
}
