import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { followUpWorker } from './workers/followup.worker';
import { paymentReminderWorker } from './workers/payment-reminder.worker';
import { bookingReminderWorker } from './workers/booking-reminder.worker';
import dotenv from 'dotenv';

dotenv.config();

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const prisma = new PrismaClient();

// Follow-up Worker
const followUpQueue = new Worker('followup-queue', followUpWorker(prisma), {
  connection,
});

// Payment Reminder Worker
const paymentReminderQueue = new Worker('payment-reminder-queue', paymentReminderWorker(prisma), {
  connection,
});

// Booking Reminder Worker
const bookingReminderQueue = new Worker('booking-reminder-queue', bookingReminderWorker(prisma), {
  connection,
});

followUpQueue.on('completed', (job) => {
  console.log(`✅ Follow-up job ${job.id} completed`);
});

followUpQueue.on('failed', (job, err) => {
  console.error(`❌ Follow-up job ${job?.id} failed:`, err.message);
});

paymentReminderQueue.on('completed', (job) => {
  console.log(`✅ Payment reminder job ${job.id} completed`);
});

paymentReminderQueue.on('failed', (job, err) => {
  console.error(`❌ Payment reminder job ${job?.id} failed:`, err.message);
});

bookingReminderQueue.on('completed', (job) => {
  console.log(`✅ Booking reminder job ${job.id} completed`);
});

bookingReminderQueue.on('failed', (job, err) => {
  console.error(`❌ Booking reminder job ${job?.id} failed:`, err.message);
});

console.log('🚀 FlowForge Workers started successfully');
console.log('📊 Queues:');
console.log('  - followup-queue');
console.log('  - payment-reminder-queue');
console.log('  - booking-reminder-queue');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down workers...');
  await followUpQueue.close();
  await paymentReminderQueue.close();
  await bookingReminderQueue.close();
  await prisma.$disconnect();
  process.exit(0);
});
