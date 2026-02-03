import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { ComputePayrollDto } from './dto/compute-payroll.dto';
import { ComputePayrollBodyDto } from './dto/compute-payroll-body.dto';

@Controller('payroll')
export class PayrollController {
  constructor(private svc: PayrollService) {}

  @Post('compute')
  async compute(@Body() body: ComputePayrollBodyDto) {
    return this.svc.computeMonthly(body.userId, body.month);
  }

  @Get('report')
  async report(@Query() query: ComputePayrollDto) {
    return this.svc.report(query.month);
  }
}
