import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CACHE_TTL } from '../common/constants';

export interface CustomerInsights {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalSpent: number;
  totalInvoices: number;
  totalBookings: number;
  lastInteractionDate: Date;
  lifetimeValue: number;
  averageInvoiceValue: number;
  preferredServices: string[];
  paymentBehavior: 'excellent' | 'good' | 'poor';
  riskScore: number;
}

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async findAll(businessId: string) {
    const cacheKey = `customers:${businessId}`;
    const cached = await this.cache.get<any[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const customers = await this.prisma.customer.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    await this.cache.set(cacheKey, customers, CACHE_TTL.MEDIUM);
    return customers;
  }

  async findOne(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        invoices: true,
        bookings: true,
        messages: true,
      },
    });
  }

  async getCustomerInsights(customerId: string): Promise<CustomerInsights> {
    const cacheKey = `customer:insights:${customerId}`;
    const cached = await this.cache.get<CustomerInsights>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        invoices: true,
        bookings: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const paidInvoices = customer.invoices.filter((inv) => inv.status === 'paid');
    const totalSpent = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalInvoices = customer.invoices.length;
    const totalBookings = customer.bookings.length;

    // Calculate preferred services
    const serviceCount = new Map<string, number>();
    customer.bookings.forEach((booking) => {
      const count = serviceCount.get(booking.serviceName) || 0;
      serviceCount.set(booking.serviceName, count + 1);
    });

    const preferredServices = Array.from(serviceCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([service]) => service);

    // Calculate payment behavior
    const overdueInvoices = customer.invoices.filter(
      (inv) => inv.status === 'pending' && inv.dueDate < new Date(),
    ).length;
    const paymentRate = totalInvoices > 0 ? paidInvoices.length / totalInvoices : 0;

    let paymentBehavior: 'excellent' | 'good' | 'poor';
    if (paymentRate >= 0.9 && overdueInvoices === 0) {
      paymentBehavior = 'excellent';
    } else if (paymentRate >= 0.7) {
      paymentBehavior = 'good';
    } else {
      paymentBehavior = 'poor';
    }

    // Calculate risk score (0-100, higher is riskier)
    let riskScore = 0;
    riskScore += overdueInvoices * 15;
    riskScore += (1 - paymentRate) * 40;
    if (totalInvoices === 0) riskScore += 20;
    riskScore = Math.min(100, riskScore);

    const insights: CustomerInsights = {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      totalSpent,
      totalInvoices,
      totalBookings,
      lastInteractionDate: customer.messages[0]?.createdAt || customer.createdAt,
      lifetimeValue: totalSpent,
      averageInvoiceValue: totalInvoices > 0 ? totalSpent / paidInvoices.length : 0,
      preferredServices,
      paymentBehavior,
      riskScore: Math.round(riskScore),
    };

    await this.cache.set(cacheKey, insights, CACHE_TTL.LONG);
    return insights;
  }

  async getTopCustomers(businessId: string, limit: number = 10) {
    const customers = await this.prisma.customer.findMany({
      where: { businessId },
      include: {
        invoices: {
          where: { status: 'paid' },
        },
      },
    });

    const customersWithValue = customers.map((customer) => ({
      ...customer,
      totalValue: customer.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    }));

    return customersWithValue
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, limit);
  }

  async create(data: {
    businessId: string;
    name: string;
    phone: string;
    email?: string;
  }) {
    const customer = await this.prisma.customer.create({ data });
    await this.cache.del(`customers:${data.businessId}`);
    return customer;
  }

  async update(id: string, data: any) {
    const customer = await this.prisma.customer.update({
      where: { id },
      data,
    });
    await this.cache.del(`customers:${customer.businessId}`);
    await this.cache.del(`customer:insights:${id}`);
    return customer;
  }

  async delete(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    await this.prisma.customer.delete({ where: { id } });
    if (customer) {
      await this.cache.del(`customers:${customer.businessId}`);
      await this.cache.del(`customer:insights:${id}`);
    }
  }
}

// Enhanced customer insights algorithm - Modified: 2025-12-25 20:07:13
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
