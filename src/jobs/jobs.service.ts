import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class JobsService {
  private queue: Queue;
  constructor() {
    const connection = new IORedis(process.env.REDIS_URL);
    this.queue = new Queue('emails', { connection });
  }

  async enqueuePayrollEmail(data: any) {
    await this.queue.add('payroll-cutoff', data);
    return { ok: true };
  }
}
