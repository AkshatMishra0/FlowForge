import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addDays, addHours } from 'date-fns';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private paymentReminderQueue: Queue;
  private followUpQueue: Queue;
  private bookingReminderQueue: Queue;
  private connection: Redis;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const redisHost = this.config.get('REDIS_HOST') || 'localhost';
    const redisPort = this.config.get('REDIS_PORT') || 6379;
    
    this.connection = new Redis({
      host: redisHost,
      port: parseInt(redisPort),
      maxRetriesPerRequest: null,
    });

    this.paymentReminderQueue = new Queue('payment-reminder-queue', {
      connection: this.connection,
    });

    this.followUpQueue = new Queue('followup-queue', {
      connection: this.connection,
    });

    this.bookingReminderQueue = new Queue('booking-reminder-queue', {
      connection: this.connection,
    });
  }

  async onModuleInit() {
    console.log('✅ Scheduler Service initialized');
  }

  // Schedule payment reminder
  async schedulePaymentReminder(invoiceId: string, reminderType: string, scheduledFor: Date) {
    await this.paymentReminderQueue.add(
      'send-payment-reminder',
      { invoiceId, reminderType },
      {
        delay: scheduledFor.getTime() - Date.now(),
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );

    // Create payment reminder record
    await this.prisma.paymentReminder.create({
      data: {
        invoiceId,
        reminderType,
        scheduledFor,
        status: 'pending',
      },
    });
  }

  // Schedule follow-up message
  async scheduleFollowUp(leadId: string, businessId: string, message: string, delayHours: number, stepId?: string) {
    const scheduledFor = addHours(new Date(), delayHours);
    
    await this.followUpQueue.add(
      'send-followup',
      { leadId, businessId, message, stepId },
      {
        delay: delayHours * 60 * 60 * 1000,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );

    // Create scheduled job record
    await this.prisma.scheduledJob.create({
      data: {
        businessId,
        jobType: 'followup',
        jobData: { leadId, message, stepId },
        scheduledFor,
        status: 'pending',
      },
    });
  }

  // Schedule booking reminder (1 day before)
  async scheduleBookingReminder(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) return;

    const reminderTime = addDays(new Date(booking.bookingDate), -1);
    const delay = reminderTime.getTime() - Date.now();

    if (delay > 0) {
      await this.bookingReminderQueue.add(
        'send-booking-reminder',
        { bookingId },
        {
          delay,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      );
    }
  }

  // Cron job: Check for overdue invoices and schedule reminders (runs daily at 9 AM)
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkOverdueInvoices() {
    console.log('🔄 Checking for overdue invoices...');

    const invoices = await this.prisma.invoice.findMany({
      where: {
        status: { in: ['sent', 'overdue'] },
        dueDate: { not: null },
      },
      include: {
        paymentReminders: true,
      },
    });

    for (const invoice of invoices) {
      if (!invoice.dueDate) continue;

      const daysOverdue = Math.floor(
        (Date.now() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Same day reminder
      if (daysOverdue === 0) {
        const hasSameDayReminder = invoice.paymentReminders.some(
          (r) => r.reminderType === 'same_day' && r.status === 'sent',
        );
        if (!hasSameDayReminder) {
          await this.schedulePaymentReminder(invoice.id, 'same_day', new Date());
        }
      }

      // Day 1 reminder
      if (daysOverdue === 1) {
        const hasDay1Reminder = invoice.paymentReminders.some(
          (r) => r.reminderType === 'day_1' && r.status === 'sent',
        );
        if (!hasDay1Reminder) {
          await this.schedulePaymentReminder(invoice.id, 'day_1', new Date());
          
          // Update invoice status to overdue
          await this.prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: 'overdue' },
          });
        }
      }

      // Day 7 reminder
      if (daysOverdue === 7) {
        const hasDay7Reminder = invoice.paymentReminders.some(
          (r) => r.reminderType === 'day_7' && r.status === 'sent',
        );
        if (!hasDay7Reminder) {
          await this.schedulePaymentReminder(invoice.id, 'day_7', new Date());
        }
      }
    }

    console.log(`✅ Processed ${invoices.length} invoices`);
  }

  // Cron job: Check upcoming bookings and schedule reminders (runs daily at 8 AM)
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkUpcomingBookings() {
    console.log('🔄 Checking for upcoming bookings...');

    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = addDays(tomorrow, 1);

    const bookings = await this.prisma.booking.findMany({
      where: {
        bookingDate: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
        status: { in: ['pending', 'confirmed'] },
      },
    });

    for (const booking of bookings) {
      await this.scheduleBookingReminder(booking.id);
    }

    console.log(`✅ Scheduled ${bookings.length} booking reminders`);
  }
}

// Enhanced scheduler with retry logic - Modified: 2025-12-25 20:07:28
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
