import { Controller, Post, Body, UseGuards, Req, Get, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';

@Controller('attendance')
export class AttendanceController {
  constructor(private svc: AttendanceService) {}

  @Post('timein')
  @UseGuards(FirebaseAuthGuard)
  async timeIn(@Req() req, @Body() body: { note?: string }) {
    const firebaseUid = req.user.uid;
    // find user by firebaseUid
    // naive: assume mapping exists and user id provided
    const userId = Number(req.body.userId) || req.user.uid; // placeholder
    return this.svc.timeIn(userId, body.note);
  }

  @Post('timeout')
  @UseGuards(FirebaseAuthGuard)
  async timeOut(@Req() req, @Body() body: { note?: string }) {
    const userId = Number(req.body.userId) || req.user.uid;
    return this.svc.timeOut(userId, body.note);
  }

  @Get('hours')
  @UseGuards(FirebaseAuthGuard)
  async hours(@Req() req, @Query('date') dateStr: string) {
    const userId = Number(req.query.userId) || req.user.uid;
    const date = dateStr ? new Date(dateStr) : new Date();
    return this.svc.computeHoursForDay(userId, date);
  }
}
