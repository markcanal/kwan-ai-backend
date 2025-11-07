import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  computeSSSContribution,
  computePhilHealthContribution,
  computePagIbigContribution,
} from './helpers/contribution.helper';
import { startOfMonth, endOfMonth, differenceInHours, isWeekend } from 'date-fns';
import { Attendance, Holiday } from '@prisma/client';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  /**
   * Compute monthly payroll for a user
   * Includes base + bonuses, deductions, overtime, and holidays
   */
  async computeMonthly(userId: number, month: string) {
    const [year, monthNumber] = month.split('-').map(Number);
    const start = startOfMonth(new Date(year, monthNumber - 1));
    const end = endOfMonth(start);

    // --- Fetch user and attendance records
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { attendances: true },
    });
    if (!user) throw new Error('User not found');

    const attendances = user.attendances.filter(
      (a) => a.timestamp >= start && a.timestamp <= end,
    );

    const holidays = await this.prisma.holiday.findMany({
      where: { date: { gte: start, lte: end } },
    });

    // --- Base salary composition
    const totalMonthlySalary =
      user.baseSalary + user.yearlyBonus / 12 + user.clientBonus;

    // --- Compute work hours
    const { totalHours, overtimeHours, nightHours, holidayHours } =
      this.computeWorkHours(attendances, holidays);

    // --- Daily and hourly rate (exclude weekends)
    const workingDays = this.countWorkingDays(year, monthNumber);
    const dailyRate = totalMonthlySalary / workingDays;
    const hourlyRate = dailyRate / 8;

    // --- Overtime rates (DOLE guidelines)
    const overtimeRate = hourlyRate * 1.25; // Regular OT (125%)
    const nightDiffRate = hourlyRate * 0.10; // Night diff 10%
    const holidayRate = hourlyRate * 2.0; // Regular holiday = 200%

    // --- Compute earnings
    const regularPay = totalHours * hourlyRate;
    const overtimePay = overtimeHours * overtimeRate;
    const nightPay = nightHours * nightDiffRate;
    const holidayPay = holidayHours * holidayRate;

    const gross = regularPay + overtimePay + nightPay + holidayPay;

    // --- Compute deductions
    const sss = computeSSSContribution(totalMonthlySalary);
    const philhealth = computePhilHealthContribution(totalMonthlySalary);
    const pagibig = computePagIbigContribution(totalMonthlySalary);
    const deductions = sss.employeeMonthly + philhealth + pagibig;

    const net = gross - deductions;

    // --- Save payroll record
    const record = await this.prisma.payroll.create({
      data: {
        userId,
        month,
        totalHours,
        overtimeHours,
        nightHours,
        gross,
        deductions,
        net,
        sss:sss.employeeMonthly,
        philhealth,
        pagibig,
      },
    });

    return {
      payroll: record,
      summary: {
        user: user.name,
        month,
        totalHours,
        overtimeHours,
        nightHours,
        holidayHours,
        dailyRate,
        hourlyRate,
        gross,
        deductions,
        net,
      },
    };
  }

  /**
   * Compute total, overtime, night diff, and holiday hours
   */
  private computeWorkHours(attendances: Attendance[], holidays: Holiday[]) {
  let totalHours = 0;
  let overtimeHours = 0;
  let nightHours = 0;
  let holidayHours = 0;

  // Sort by timestamp ascending
  const sorted = attendances.sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  );

  // Group entries by date for clarity
  const byDate: Record<string, typeof attendances> = {};
  for (const a of sorted) {
    const key = a.timestamp.toISOString().split('T')[0];
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(a);
  }

  for (const [dateKey, records] of Object.entries(byDate)) {
    const dayRecords = records.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    // Find first "in" and last "out"
    const inRecord = dayRecords.find((r) => r.type === 'in');
    const outRecord = [...dayRecords].reverse().find((r) => r.type === 'out');
    if (!inRecord || !outRecord) continue;

    let workDuration =
      (outRecord.timestamp.getTime() - inRecord.timestamp.getTime()) /
      (1000 * 60 * 60);

    // Subtract break durations
    const breaks: { start: Date; end: Date }[] = [];
    for (let i = 0; i < dayRecords.length; i++) {
      const rec = dayRecords[i];
      if (rec.type === 'break_in' && dayRecords[i + 1]?.type === 'break_out') {
        breaks.push({
          start: rec.timestamp,
          end: dayRecords[i + 1].timestamp,
        });
        i++; // skip the paired break_out
      }
    }

    const breakHours = breaks.reduce(
      (sum, b) => sum + (b.end.getTime() - b.start.getTime()) / (1000 * 60 * 60),
      0,
    );

    workDuration -= breakHours;
    if (workDuration < 0) workDuration = 0;

    const currentDate = new Date(dateKey);
    const isHoliday = holidays.some(
      (h) => h.date.toDateString() === currentDate.toDateString(),
    );
    const isNightShift =
      inRecord.timestamp.getHours() >= 22 ||
      outRecord.timestamp.getHours() <= 6;
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

    totalHours += workDuration;
    if (isNightShift) nightHours += workDuration;
    if (isHoliday) holidayHours += workDuration;
    if (isWeekend) overtimeHours += workDuration;
    else if (workDuration > 8) overtimeHours += workDuration - 8;
  }

  return { totalHours, overtimeHours, nightHours, holidayHours };
}


  /**
   * Count working days in a month (Mon–Fri)
   */
  private countWorkingDays(year: number, month: number) {
    let count = 0;
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(year, month - 1, d).getDay();
      if (day !== 0 && day !== 6) count++;
    }
    return count;
  }

  /**
   * Report all payrolls for a month
   */
  async report(month: string) {
    return this.prisma.payroll.findMany({
      where: { month },
      include: { user: true },
    });
  }
}
