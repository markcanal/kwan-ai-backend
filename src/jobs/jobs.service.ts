import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

export interface PayrollEmailData {
  to: string;
  name: string;
  daysWorked: number;
  totalHours: number;
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  nightDiff: number;
  sss: number;
  philhealth: number;
  pagibig: number;
}

export interface WelcomeEmailData {
  to: string;
  name: string;
}

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private queue: Queue;
  
  constructor() {
    const connection = new IORedis(process.env.REDIS_URL);
    connection.on('connect', () => this.logger.log('Redis connected successfully'));
    connection.on('error', (err) => this.logger.error('Redis connection error', err.stack));

    this.queue = new Queue('emails', { connection });
  }

  async enqueuePayrollEmail(data: PayrollEmailData) {
    await this.queue.add('payroll-cutoff', data);
    this.logger.log(`Payroll email queued for ${data.to}`);
    return { ok: true };
  }

  async enqueueWelcomeEmail(data: WelcomeEmailData) {
    await this.queue.add('welcome-email', {
      to: data.to,
      name: data.name,
    });
    this.logger.log(`Welcome email queued for ${data.to}`);
    return { ok: true };
  }
}
