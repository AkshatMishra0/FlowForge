import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface ExportOptions {
  format: 'json' | 'csv';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ReportData {
  leads?: any[];
  invoices?: any[];
  bookings?: any[];
  messages?: any[];
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate comprehensive business report
   */
  async generateBusinessReport(
    businessId: string,
    options: ExportOptions
  ): Promise<ReportData> {
    this.logger.log(`Generating report for business: ${businessId}`);

    const dateFilter = options.dateRange
      ? {
          createdAt: {
            gte: options.dateRange.start,
            lte: options.dateRange.end,
          },
        }
      : {};

    const [leads, invoices, bookings, messages] = await Promise.all([
      this.prisma.lead.findMany({
        where: { businessId, ...dateFilter },
        include: { activities: true },
      }),
      this.prisma.invoice.findMany({
        where: { businessId, ...dateFilter },
        include: { items: true, lead: true },
      }),
      this.prisma.booking.findMany({
        where: { businessId, ...dateFilter },
        include: { lead: true },
      }),
      this.prisma.messageLog.findMany({
        where: { businessId, ...dateFilter },
        include: { lead: true },
      }),
    ]);

    return { leads, invoices, bookings, messages };
  }

  /**
   * Export leads data
   */
  async exportLeads(businessId: string, options: ExportOptions): Promise<string> {
    const leads = await this.prisma.lead.findMany({
      where: { businessId },
      include: { activities: true },
    });

    if (options.format === 'csv') {
      return this.convertToCSV(leads, [
        'id',
        'name',
        'phone',
        'email',
        'status',
        'source',
        'createdAt',
      ]);
    }

    return JSON.stringify(leads, null, 2);
  }

  /**
   * Export invoices data
   */
  async exportInvoices(businessId: string, options: ExportOptions): Promise<string> {
    const invoices = await this.prisma.invoice.findMany({
      where: { businessId },
      include: { items: true, lead: true },
    });

    if (options.format === 'csv') {
      return this.convertToCSV(invoices, [
        'id',
        'invoiceNumber',
        'status',
        'total',
        'dueDate',
        'createdAt',
      ]);
    }

    return JSON.stringify(invoices, null, 2);
  }

  /**
   * Generate revenue report
   */
  async getRevenueReport(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        businessId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
    const paidRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const pendingRevenue = totalRevenue - paidRevenue;

    return {
      startDate,
      endDate,
      totalInvoices: invoices.length,
      paidInvoices: paidInvoices.length,
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      averageInvoiceValue: invoices.length > 0 ? totalRevenue / invoices.length : 0,
    };
  }

  /**
   * Generate lead conversion report
   */
  async getLeadConversionReport(businessId: string): Promise<any> {
    const leads = await this.prisma.lead.findMany({
      where: { businessId },
    });

    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const convertedLeads = leads.filter((l) => l.status === 'converted').length;
    const totalLeads = leads.length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    return {
      totalLeads,
      convertedLeads,
      conversionRate: conversionRate.toFixed(2) + '%',
      statusBreakdown: statusCounts,
    };
  }

  /**
   * Generate booking analytics report
   */
  async getBookingAnalytics(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const bookings = await this.prisma.booking.findMany({
      where: {
        businessId,
        bookingDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const statusCounts = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      startDate,
      endDate,
      totalBookings: bookings.length,
      completedBookings: bookings.filter((b) => b.status === 'completed').length,
      cancelledBookings: bookings.filter((b) => b.status === 'cancelled').length,
      statusBreakdown: statusCounts,
      completionRate:
        bookings.length > 0
          ? (
              (bookings.filter((b) => b.status === 'completed').length / bookings.length) *
              100
            ).toFixed(2) + '%'
          : '0%',
    };
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any[], columns: string[]): string {
    const headers = columns.join(',');
    const rows = data.map((item) =>
      columns.map((col) => {
        const value = item[col];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    );

    return [headers, ...rows].join('\n');
  }

  /**
   * Generate monthly summary
   */
  async getMonthlySummary(businessId: string, year: number, month: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [leadsCount, invoicesData, bookingsCount, messagesCount] = await Promise.all([
      this.prisma.lead.count({
        where: {
          businessId,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.invoice.aggregate({
        where: {
          businessId,
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.booking.count({
        where: {
          businessId,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.messageLog.count({
        where: {
          businessId,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    return {
      year,
      month,
      summary: {
        newLeads: leadsCount,
        invoicesIssued: invoicesData._count,
        totalRevenue: invoicesData._sum.total || 0,
        bookingsMade: bookingsCount,
        messagesSent: messagesCount,
      },
    };
  }
}
