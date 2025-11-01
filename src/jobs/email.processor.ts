/**
 * This file is an example processor for BullMQ. In production you'd run a worker process
 * that consumes jobs from the 'emails' queue and sends emails via Resend / Nodemailer / or Firebase extension trigger.
 */
import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL);
const worker = new Worker('emails', async job => {
  console.log('Processing job', job.name, job.data);
  // Implement email sending here (e.g., call Resend or Firebase mail extension)
}, { connection });

worker.on('completed', job => console.log('Job completed', job.id));
worker.on('failed', (job, err) => console.error('Job failed', err));
