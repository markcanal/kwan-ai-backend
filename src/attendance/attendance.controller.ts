import { Controller, Post, Body, UseGuards, Req, Get, Query, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { TimeInDto } from './dto/time-in.dto';
import { TimeOutDto } from './dto/time-out.dto';
import { Request } from 'express';
import { UserService } from '../user/user.service';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(
    private svc: AttendanceService,
    private userService: UserService,
  ) {}

  @Post('timein')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Clock in',
    description: 'Records employee clock-in time. Prevents duplicate clock-ins.'
  })
  @ApiBody({ type: TimeInDto })
  @ApiResponse({
    status: 201,
    description: 'Successfully clocked in',
    schema: {
      example: {
        id: 123,
        userId: 1,
        type: 'in',
        timestamp: '2024-02-03T09:00:00.000Z',
        note: 'Starting work for the day',
        holidayId: null,
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'User already clocked in. Please clock out first.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid Firebase token or user not found',
  })
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
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Clock out',
    description: 'Records employee clock-out time. Requires prior clock-in.'
  })
  @ApiBody({ type: TimeOutDto })
  @ApiResponse({
    status: 201,
    description: 'Successfully clocked out',
    schema: {
      example: {
        id: 124,
        userId: 1,
        type: 'out',
        timestamp: '2024-02-03T17:00:00.000Z',
        note: 'End of workday',
        holidayId: null,
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot clock out without clocking in first.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid Firebase token or user not found',
  })
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
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get hours worked',
    description: 'Calculate total hours worked for a specific date. Defaults to today.'
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date in ISO format (YYYY-MM-DD). Defaults to today.',
    example: '2024-02-03',
  })
  @ApiResponse({
    status: 200,
    description: 'Hours calculated successfully',
    schema: {
      example: {
        hours: 8.0,
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid Firebase token or user not found',
  })
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
