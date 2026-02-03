import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { subHours, startOfDay } from 'date-fns';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async timeIn(userId: number, note?: string) {
    // Check if user already has an open "in" record
    const lastRecord = await this.prisma.attendance.findFirst({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });

    if (lastRecord?.type === 'in') {
      throw new BadRequestException('User already clocked in. Please clock out first.');
    }

    return this.prisma.attendance.create({ data: { userId, type: 'in', note } });
  }

  async timeOut(userId: number, note?: string) {
    // Check if user has an open "in" record
    const lastRecord = await this.prisma.attendance.findFirst({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });

    if (!lastRecord || lastRecord.type !== 'in') {
      throw new BadRequestException('Cannot clock out without clocking in first.');
    }

    return this.prisma.attendance.create({ data: { userId, type: 'out', note } });
  }

  // simple example: count todays hours by pairing in/out (naive)
  async computeHoursForDay(userId: number, date: Date) {
    const start = startOfDay(date);
    const end = subHours(start, -24);
    const items = await this.prisma.attendance.findMany({
      where: { userId, timestamp: { gte: start, lt: end } },
      orderBy: { timestamp: 'asc' }
    });
    // naive pairing
    let totalMs = 0;
    for (let i=0;i<items.length;i+=2) {
      const a = items[i];
      const b = items[i+1];
      if (a && b) totalMs += (new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return { hours: totalMs/1000/60/60 };
  }
}
