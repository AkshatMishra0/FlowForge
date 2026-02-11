import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface BulkUpdateResult {
  updated: number;
  failed: number;
  errors: string[];
}

@Injectable()
export class BulkOperationsService {
  private readonly logger = new Logger(BulkOperationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Bulk update lead status
   */
  async bulkUpdateLeadStatus(
    leadIds: string[],
    status: string,
    businessId: string
  ): Promise<BulkUpdateResult> {
    this.logger.log(`Bulk updating ${leadIds.length} leads to status: ${status}`);

    const result: BulkUpdateResult = {
      updated: 0,
      failed: 0,
      errors: [],
    };

    for (const leadId of leadIds) {
      try {
        await this.prisma.lead.update({
          where: { id: leadId, businessId },
          data: { status },
        });
        result.updated++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to update lead ${leadId}: ${error.message}`);
      }
    }

    this.logger.log(`Bulk update complete: ${result.updated} updated, ${result.failed} failed`);
    return result;
  }

  /**
   * Bulk delete leads
   */
  async bulkDeleteLeads(leadIds: string[], businessId: string): Promise<BulkUpdateResult> {
    this.logger.log(`Bulk deleting ${leadIds.length} leads`);

    const result: BulkUpdateResult = {
      updated: 0,
      failed: 0,
      errors: [],
    };

    for (const leadId of leadIds) {
      try {
        // Delete related activities first
        await this.prisma.activity.deleteMany({
          where: { leadId },
        });

        // Delete the lead
        await this.prisma.lead.delete({
          where: { id: leadId, businessId },
        });
        
        result.updated++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to delete lead ${leadId}: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Bulk send invoices
   */
  async bulkSendInvoices(invoiceIds: string[], businessId: string): Promise<BulkUpdateResult> {
    this.logger.log(`Bulk sending ${invoiceIds.length} invoices`);

    const result: BulkUpdateResult = {
      updated: 0,
      failed: 0,
      errors: [],
    };

    for (const invoiceId of invoiceIds) {
      try {
        await this.prisma.invoice.update({
          where: { id: invoiceId, businessId },
          data: { status: 'sent', sentAt: new Date() },
        });
        result.updated++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to send invoice ${invoiceId}: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Bulk update invoice status
   */
  async bulkUpdateInvoiceStatus(
    invoiceIds: string[],
    status: string,
    businessId: string
  ): Promise<BulkUpdateResult> {
    this.logger.log(`Bulk updating ${invoiceIds.length} invoices to status: ${status}`);

    const result: BulkUpdateResult = {
      updated: 0,
      failed: 0,
      errors: [],
    };

    for (const invoiceId of invoiceIds) {
      try {
        await this.prisma.invoice.update({
          where: { id: invoiceId, businessId },
          data: { status },
        });
        result.updated++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to update invoice ${invoiceId}: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Bulk assign leads to user
   */
  async bulkAssignLeads(
    leadIds: string[],
    assignedToUserId: string,
    businessId: string
  ): Promise<BulkUpdateResult> {
    this.logger.log(`Bulk assigning ${leadIds.length} leads to user: ${assignedToUserId}`);

    const result: BulkUpdateResult = {
      updated: 0,
      failed: 0,
      errors: [],
    };

    for (const leadId of leadIds) {
      try {
        await this.prisma.lead.update({
          where: { id: leadId, businessId },
          data: { assignedTo: assignedToUserId },
        });
        result.updated++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to assign lead ${leadId}: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Bulk cancel bookings
   */
  async bulkCancelBookings(
    bookingIds: string[],
    businessId: string
  ): Promise<BulkUpdateResult> {
    this.logger.log(`Bulk cancelling ${bookingIds.length} bookings`);

    const result: BulkUpdateResult = {
      updated: 0,
      failed: 0,
      errors: [],
    };

    for (const bookingId of bookingIds) {
      try {
        await this.prisma.booking.update({
          where: { id: bookingId, businessId },
          data: { status: 'cancelled', cancelledAt: new Date() },
        });
        result.updated++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to cancel booking ${bookingId}: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Bulk import leads from CSV data
   */
  async bulkImportLeads(
    data: Array<{ name: string; phone: string; email?: string; source?: string }>,
    businessId: string
  ): Promise<BulkUpdateResult> {
    this.logger.log(`Bulk importing ${data.length} leads`);

    const result: BulkUpdateResult = {
      updated: 0,
      failed: 0,
      errors: [],
    };

    for (const leadData of data) {
      try {
        await this.prisma.lead.create({
          data: {
            ...leadData,
            businessId,
            status: 'new',
          },
        });
        result.updated++;
      } catch (error) {
        result.failed++;
        result.errors.push(`Failed to import lead ${leadData.name}: ${error.message}`);
      }
    }

    this.logger.log(`Import complete: ${result.updated} imported, ${result.failed} failed`);
    return result;
  }
}
