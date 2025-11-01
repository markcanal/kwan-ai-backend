import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PayrollService } from './payroll.service';

@Controller('payroll')
export class PayrollController {
  constructor(private svc: PayrollService) {}

  @Post('compute')
  async compute(@Body() body: { userId: number, month: string }) {
    return this.svc.computeMonthly(body.userId, body.month);
  }

  @Get('report')
  async report(@Query('month') month: string) {
    return this.svc.report(month);
  }
}
