import { Controller, Post, Body, UseGuards, Req, Get, Query, UnauthorizedException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { TimeInDto } from './dto/time-in.dto';
import { TimeOutDto } from './dto/time-out.dto';
import { Request } from 'express';
import { UserService } from '../user/user.service';

@Controller('attendance')
export class AttendanceController {
  constructor(
    private svc: AttendanceService,
    private userService: UserService,
  ) {}

  @Post('timein')
  @UseGuards(FirebaseAuthGuard)
  async timeIn(@Req() req: Request & { user: { uid: string } }, @Body() body: TimeInDto) {
    const firebaseUid = req.user.uid;
    const user = await this.userService.getUserByFirebaseUid(firebaseUid);
    
    if (!user) {
      throw new UnauthorizedException('User not found. Please create a user profile first.');
    }
    
    return this.svc.timeIn(user.id, body.note);
  }

  @Post('timeout')
  @UseGuards(FirebaseAuthGuard)
  async timeOut(@Req() req: Request & { user: { uid: string } }, @Body() body: TimeOutDto) {
    const firebaseUid = req.user.uid;
    const user = await this.userService.getUserByFirebaseUid(firebaseUid);
    
    if (!user) {
      throw new UnauthorizedException('User not found. Please create a user profile first.');
    }
    
    return this.svc.timeOut(user.id, body.note);
  }

  @Get('hours')
  @UseGuards(FirebaseAuthGuard)
  async hours(@Req() req: Request & { user: { uid: string } }, @Query('date') dateStr?: string) {
    const firebaseUid = req.user.uid;
    const user = await this.userService.getUserByFirebaseUid(firebaseUid);
    
    if (!user) {
      throw new UnauthorizedException('User not found. Please create a user profile first.');
    }
    
    const date = dateStr ? new Date(dateStr) : new Date();
    return this.svc.computeHoursForDay(user.id, date);
  }
}
