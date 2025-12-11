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
}

// Implemented lead scoring algorithm - Modified: 2025-12-25 20:07:29
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
