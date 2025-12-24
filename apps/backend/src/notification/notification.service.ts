import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface NotificationPayload {
  type: 'payment_reminder' | 'booking_reminder' | 'lead_followup' | 'custom';
  customerId: string;
  businessId: string;
  templateName?: string;
  message: string;
  metadata?: any;
}

export interface NotificationHistory {
  id: string;
  type: string;
  customerId: string;
  businessId: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt?: Date;
  failureReason?: string;
  metadata?: any;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private prisma: PrismaService) {}

  async logNotification(payload: NotificationPayload, status: 'sent' | 'failed', failureReason?: string) {
    try {
      const notification = await this.prisma.notificationLog.create({
        data: {
          type: payload.type,
          customerId: payload.customerId,
          businessId: payload.businessId,
          message: payload.message,
          status,
          sentAt: status === 'sent' ? new Date() : null,
          failureReason,
          metadata: payload.metadata,
        },
      });

      this.logger.log(`Notification logged: ${notification.id} - Status: ${status}`);
      return notification;
    } catch (error) {
      this.logger.error('Failed to log notification', error);
      throw error;
    }
  }

  async getNotificationHistory(
    businessId: string,
    filters?: {
      customerId?: string;
      type?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<NotificationHistory[]> {
    const where: any = { businessId };

    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return this.prisma.notificationLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getNotificationStats(businessId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const notifications = await this.prisma.notificationLog.findMany({
      where: {
        businessId,
        createdAt: { gte: startDate },
      },
    });

    const total = notifications.length;
    const sent = notifications.filter((n) => n.status === 'sent').length;
    const failed = notifications.filter((n) => n.status === 'failed').length;
    const pending = notifications.filter((n) => n.status === 'pending').length;

    const byType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      sent,
      failed,
      pending,
      successRate: total > 0 ? (sent / total) * 100 : 0,
      byType,
    };
  }

  async markAsSent(notificationId: string) {
    return this.prisma.notificationLog.update({
      where: { id: notificationId },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
    });
  }

  async markAsFailed(notificationId: string, reason: string) {
    return this.prisma.notificationLog.update({
      where: { id: notificationId },
      data: {
        status: 'failed',
        failureReason: reason,
      },
    });
  }

  async retryFailedNotifications(businessId: string, limit: number = 50) {
    const failedNotifications = await this.prisma.notificationLog.findMany({
      where: {
        businessId,
        status: 'failed',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    this.logger.log(`Found ${failedNotifications.length} failed notifications to retry`);
    return failedNotifications;
  }

  async cleanupOldNotifications(daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.notificationLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old notification logs`);
    return result;
  }
}

// Added notification templates - Modified: 2025-12-25 20:07:18
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

// Added email notification templates - Modified: 2025-12-25 20:07:42
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
