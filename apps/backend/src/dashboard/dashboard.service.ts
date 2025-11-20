import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(businessId: string) {
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
