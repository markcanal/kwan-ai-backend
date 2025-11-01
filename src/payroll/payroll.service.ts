import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  // simple monthly payroll computation: hours * rate - deductions
  async computeMonthly(userId: number, month: string) {
    // placeholder logic: fetch attendances, compute hours, apply fixed rate
    const ratePerHour = 100; // example
    // naive: assume 160 hours work month
    const gross = 160 * ratePerHour;
    const deductions = 0;
    const net = gross - deductions;
    const record = await this.prisma.payroll.create({
      data: { userId, month, gross, deductions, net }
    });
    return record;
  }

  async report(month: string) {
    return this.prisma.payroll.findMany({ where: { month } });
  }
}
