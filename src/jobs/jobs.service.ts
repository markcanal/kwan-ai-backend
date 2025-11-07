import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class JobsService {
  private queue: Queue;
  constructor() {
    const connection = new IORedis(process.env.REDIS_URL);
    connection.on('connect', () => console.log('✅ Redis connected'));
    connection.on('error', (err) => console.error('❌ Redis connection error:', err));

    this.queue = new Queue('emails', { connection });
  }

  async enqueuePayrollEmail(data: {
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
  }) {
    await this.queue.add('payroll-cutoff', data);
    return { ok: true };
  }

  async enqueueWelcomeEmail(data: any) {
    await this.queue.add('welcome-email', {
      to: data.to,
      name: data.name,
    });
    return { ok: true };
  }
}
