import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  async getStats(businessId: string) {
    this.logger.log(`Fetching dashboard stats for business: ${businessId}`);
    
    try {
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
    } catch (error) {
      this.logger.error(`Failed to fetch dashboard stats for business ${businessId}`, error);
      throw error;
    }
  }

  async getRecentActivity(businessId: string) {
    this.logger.log(`Fetching recent activity for business: ${businessId}`);
    
    try {
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

      return { 
        leads, 
        invoices, 
        bookings, 
        messages,
        metadata: {
          fetchedAt: new Date(),
          businessId,
        }
      };
    } catch (error) {
      this.logger.error(`Failed to fetch recent activity for business ${businessId}`, error);
      throw error;
    }
  }

  async getPerformanceMetrics(businessId: string, days: number = 30) {
    this.logger.log(`Fetching performance metrics for business: ${businessId} (${days} days)`);
    
    // Validate days parameter
    const validDays = Math.max(1, Math.min(days, 365)); // Limit between 1 and 365 days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - validDays);

    const [newLeads, convertedLeads, totalBookings] = await Promise.all([
      this.prisma.lead.count({
        where: { businessId, createdAt: { gte: startDate } },
      }),
      this.prisma.lead.count({
        where: { businessId, status: 'converted', createdAt: { gte: startDate } },
      }),
      this.prisma.booking.count({
        where: { businessId, createdAt: { gte: startDate } },
      }),
    ]);

    const conversionRate = newLeads > 0 ? (convertedLeads / newLeads) * 100 : 0;

    return {
      period: `${validDays} days`,
      newLeads,
      convertedLeads,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      totalBookings,
    };
  }
}
