import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AnalyticsMetrics {
  leadConversion: {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
    averageConversionTime: number; // in days
  };
  revenueMetrics: {
    totalRevenue: number;
    averageInvoiceValue: number;
    totalInvoices: number;
    paidInvoices: number;
    paymentSuccessRate: number;
  };
  customerMetrics: {
    totalCustomers: number;
    activeCustomers: number;
    repeatCustomers: number;
    customerRetentionRate: number;
  };
  bookingMetrics: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    cancellationRate: number;
    averageBookingValue: number;
  };
  messageMetrics: {
    totalMessages: number;
    responseRate: number;
    averageResponseTime: number; // in minutes
  };
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  async getBusinessAnalytics(
    businessId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AnalyticsMetrics> {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    try {
      const [leadMetrics, revenueMetrics, customerMetrics, bookingMetrics, messageMetrics] =
        await Promise.all([
          this.getLeadConversionMetrics(businessId, dateFilter),
          this.getRevenueMetrics(businessId, dateFilter),
          this.getCustomerMetrics(businessId, dateFilter),
          this.getBookingMetrics(businessId, dateFilter),
          this.getMessageMetrics(businessId, dateFilter),
        ]);

      return {
        leadConversion: leadMetrics,
        revenueMetrics,
        customerMetrics,
        bookingMetrics,
        messageMetrics,
      };
    } catch (error) {
      this.logger.error('Failed to fetch analytics', error);
      throw error;
    }
  }

  private buildDateFilter(startDate?: Date, endDate?: Date) {
    if (!startDate && !endDate) return {};
    const filter: any = {};
    if (startDate) filter.gte = startDate;
    if (endDate) filter.lte = endDate;
    return { createdAt: filter };
  }

  private async getLeadConversionMetrics(businessId: string, dateFilter: any) {
    const leads = await this.prisma.lead.findMany({
      where: { businessId, ...dateFilter },
      select: {
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalLeads = leads.length;
    const convertedLeads = leads.filter((l) => l.status === 'converted').length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Calculate average conversion time
    const convertedLeadTimes = leads
      .filter((l) => l.status === 'converted')
      .map((l) => {
        const diffMs = l.updatedAt.getTime() - l.createdAt.getTime();
        return diffMs / (1000 * 60 * 60 * 24); // Convert to days
      });

    const averageConversionTime =
      convertedLeadTimes.length > 0
        ? convertedLeadTimes.reduce((a, b) => a + b, 0) / convertedLeadTimes.length
        : 0;

    return {
      totalLeads,
      convertedLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageConversionTime: Math.round(averageConversionTime * 10) / 10,
    };
  }

  private async getRevenueMetrics(businessId: string, dateFilter: any) {
    const invoices = await this.prisma.invoice.findMany({
      where: { businessId, ...dateFilter },
      select: {
        totalAmount: true,
        status: true,
      },
    });

    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((i) => i.status === 'paid').length;
    const totalRevenue = invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const averageInvoiceValue = paidInvoices > 0 ? totalRevenue / paidInvoices : 0;
    const paymentSuccessRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageInvoiceValue: Math.round(averageInvoiceValue * 100) / 100,
      totalInvoices,
      paidInvoices,
      paymentSuccessRate: Math.round(paymentSuccessRate * 100) / 100,
    };
  }

  private async getCustomerMetrics(businessId: string, dateFilter: any) {
    const customers = await this.prisma.customer.findMany({
      where: { businessId, ...dateFilter },
      include: {
        invoices: true,
        bookings: true,
      },
    });

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(
      (c) => c.invoices.length > 0 || c.bookings.length > 0,
    ).length;
    const repeatCustomers = customers.filter(
      (c) => c.invoices.length > 1 || c.bookings.length > 1,
    ).length;
    const customerRetentionRate =
      totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    return {
      totalCustomers,
      activeCustomers,
      repeatCustomers,
      customerRetentionRate: Math.round(customerRetentionRate * 100) / 100,
    };
  }

  private async getBookingMetrics(businessId: string, dateFilter: any) {
    const bookings = await this.prisma.booking.findMany({
      where: { businessId, ...dateFilter },
      include: {
        invoice: true,
      },
    });

    const totalBookings = bookings.length;
    const completedBookings = bookings.filter((b) => b.status === 'completed').length;
    const cancelledBookings = bookings.filter((b) => b.status === 'cancelled').length;
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;

    const totalBookingValue = bookings
      .filter((b) => b.invoice)
      .reduce((sum, b) => sum + (b.invoice?.totalAmount || 0), 0);
    const averageBookingValue = completedBookings > 0 ? totalBookingValue / completedBookings : 0;

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      cancellationRate: Math.round(cancellationRate * 100) / 100,
      averageBookingValue: Math.round(averageBookingValue * 100) / 100,
    };
  }

  private async getMessageMetrics(businessId: string, dateFilter: any) {
    const messages = await this.prisma.message.findMany({
      where: { businessId, ...dateFilter },
      orderBy: { createdAt: 'asc' },
    });

    const totalMessages = messages.length;
    const inboundMessages = messages.filter((m) => m.direction === 'inbound');
    const outboundMessages = messages.filter((m) => m.direction === 'outbound');

    // Calculate response rate
    let respondedCount = 0;
    for (let i = 0; i < inboundMessages.length; i++) {
      const inbound = inboundMessages[i];
      const hasResponse = outboundMessages.some(
        (out) => out.createdAt > inbound.createdAt && out.customerId === inbound.customerId,
      );
      if (hasResponse) respondedCount++;
    }

    const responseRate = inboundMessages.length > 0 ? (respondedCount / inboundMessages.length) * 100 : 0;

    // Calculate average response time
    const responseTimes: number[] = [];
    for (const inbound of inboundMessages) {
      const response = outboundMessages.find(
        (out) => out.createdAt > inbound.createdAt && out.customerId === inbound.customerId,
      );
      if (response) {
        const diffMs = response.createdAt.getTime() - inbound.createdAt.getTime();
        responseTimes.push(diffMs / (1000 * 60)); // Convert to minutes
      }
    }

    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    return {
      totalMessages,
      responseRate: Math.round(responseRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime * 10) / 10,
    };
  }

  async getTopPerformingServices(businessId: string, limit: number = 10) {
    const bookings = await this.prisma.booking.groupBy({
      by: ['serviceName'],
      where: {
        businessId,
        status: 'completed',
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    return bookings.map((b) => ({
      serviceName: b.serviceName,
      bookingCount: b._count.id,
    }));
  }

  async getRevenueByMonth(businessId: string, months: number = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        businessId,
        status: 'paid',
        paidAt: { gte: startDate },
      },
      select: {
        totalAmount: true,
        paidAt: true,
      },
      orderBy: { paidAt: 'asc' },
    });

    const monthlyRevenue: { [key: string]: number } = {};
    invoices.forEach((inv) => {
      if (inv.paidAt) {
        const monthKey = `${inv.paidAt.getFullYear()}-${String(inv.paidAt.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + inv.totalAmount;
      }
    });

    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue * 100) / 100,
    }));
  }
}
