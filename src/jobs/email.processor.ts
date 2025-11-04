/**
 * This file is an example processor for BullMQ. In production you'd run a worker process
 * that consumes jobs from the 'emails' queue and sends emails via Resend / Nodemailer / or Firebase extension trigger.
 */
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { Resend } from 'resend';
import { EmailService } from './email.service';

const connection = new IORedis(process.env.REDIS_URL);
const emailService = new EmailService();

const worker = new Worker(
  'emails', 
  async job => {
  console.log('Processing job', job.name, job.data);

    switch (job.name) {
       case 'payroll-cutoff': {
        const {
          to,
          name,
          daysWorked,
          totalHours,
          baseSalary,
          overtimeHours,
          overtimeRate,
          nightDiff,
          sss,
          philhealth,
          pagibig,
        } = job.data;

        // 🧮 Payroll computation
        const overtimePay = overtimeHours * overtimeRate;
        const totalDeductions = sss + philhealth + pagibig;
        const netPay =
          baseSalary + overtimePay + nightDiff - totalDeductions;

        await emailService.sendEmail({
          to,
          subject: 'Payroll Cutoff Summary',
          template: 'payroll-cutoff',
          context: {
            name,
            daysWorked,
            totalHours,
            baseSalary: baseSalary.toLocaleString(),
            overtimeHours,
            overtimePay: overtimePay.toLocaleString(),
            nightDiff: nightDiff.toLocaleString(),
            sss: sss.toLocaleString(),
            philhealth: philhealth.toLocaleString(),
            pagibig: pagibig.toLocaleString(),
            netPay: netPay.toLocaleString(),
          },
        });
        break;
      }

      case 'welcome-email':
        await emailService.sendEmail({
          to: job.data.to,
          subject: 'Welcome to Kwan.ai!',
          template: 'welcome-email',
          context: { name: job.data.name },
        });
        break;

      default:
        console.warn('⚠️ Unknown job name:', job.name);
        break;
    }
}, { connection });

worker.on('completed', job => console.log('Job completed', job.id));
worker.on('failed', (job, err) => console.error('Job failed', err));
