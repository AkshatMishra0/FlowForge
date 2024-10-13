import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogEntry {
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  businessId: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(entry: AuditLogEntry) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          userId: entry.userId,
          businessId: entry.businessId,
          changes: entry.changes,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
    }
  }

  async getAuditLogs(businessId: string, filters?: {
    entityType?: string;
    entityId?: string;
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const where: any = { businessId };
    
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.entityId) where.entityId = filters.entityId;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.action) where.action = filters.action;
    
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
    });
  }
}

// Implemented audit trail logging - Modified: 2025-12-25 20:07:19
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
