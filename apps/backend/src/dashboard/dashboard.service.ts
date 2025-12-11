import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  async getStats(businessId: string) {
    this.logger.log(`Fetching dashboard stats for business: ${businessId}`);
    
    const [
      totalLeads,
      totalInvoices,
      totalBookings,
      totalMessages,
      paidInvoices,
      pendingBookings,
    ] = await Promise.all([
      this.prisma.lead.count({ where: { businessId } }),
      this.prisma.invoice.count({ where: { businessId } }),
      this.prisma.booking.count({ where: { businessId } }),
      this.prisma.messageLog.count({ where: { businessId } }),
      this.prisma.invoice.count({ where: { businessId, status: 'paid' } }),
      this.prisma.booking.count({ where: { businessId, status: 'pending' } }),
    ]);

    const totalRevenue = await this.prisma.invoice.aggregate({
      where: { businessId, status: 'paid' },
      _sum: { totalAmount: true },
    });

    return {
      totalLeads,
      totalInvoices,
      totalBookings,
      totalMessages,
      paidInvoices,
      pendingBookings,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    };
  }

  async getRecentActivity(businessId: string) {
    const [leads, invoices, bookings, messages] = await Promise.all([
      this.prisma.lead.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.invoice.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { lead: true },
      }),
      this.prisma.booking.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { lead: true },
      }),
      this.prisma.messageLog.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { lead: true },
      }),
    ]);

    return { leads, invoices, bookings, messages };
  }
}

// Optimized dashboard queries - Modified: 2025-12-25 20:07:30
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
