import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { ComputePayrollDto } from './dto/compute-payroll.dto';
import { ComputePayrollBodyDto } from './dto/compute-payroll-body.dto';

@ApiTags('Payroll')
@Controller('payroll')
export class PayrollController {
  constructor(private svc: PayrollService) {}

  @Post('compute')
  @ApiOperation({ 
    summary: 'Compute monthly payroll',
    description: 'Calculates payroll for a specific user and month, including overtime, deductions, and net pay.'
  })
  @ApiBody({ type: ComputePayrollBodyDto })
  @ApiResponse({
    status: 201,
    description: 'Payroll computed successfully',
    schema: {
      example: {
        payroll: {
          id: 1,
          userId: 1,
          month: '2024-02',
          baseSalary: 0,
          yearlyBonus: 0,
          clientBonus: 0,
          holidayPay: 0,
          overtimePay: 0,
          nightDiffPay: 0,
          totalHours: 176,
          overtimeHours: 0,
          nightHours: 0,
          gross: 30000,
          deductions: 2500,
          net: 27500,
          sss: 1125,
          philhealth: 875,
          pagibig: 500,
          isThirteenthMonth: false,
          createdAt: '2024-02-03T10:00:00.000Z',
        },
        summary: {
          user: 'Juan Dela Cruz',
          month: '2024-02',
          totalHours: 176,
          overtimeHours: 0,
          nightHours: 0,
          holidayHours: 0,
          dailyRate: 1363.64,
          hourlyRate: 170.45,
          gross: 30000,
          deductions: 2500,
          net: 27500,
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input - Check month format (YYYY-MM) and userId',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async compute(@Body() body: ComputePayrollBodyDto) {
    return this.svc.computeMonthly(body.userId, body.month);
  }

  @Get('report')
  @ApiOperation({ 
    summary: 'Get payroll report',
    description: 'Retrieves payroll records for all users in a specific month.'
  })
  @ApiQuery({
    name: 'month',
    description: 'Month in YYYY-MM format',
    example: '2024-02',
  })
  @ApiResponse({
    status: 200,
    description: 'Payroll report retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          userId: 1,
          month: '2024-02',
          baseSalary: 0,
          yearlyBonus: 0,
          clientBonus: 0,
          holidayPay: 0,
          overtimePay: 0,
          nightDiffPay: 0,
          totalHours: 176,
          overtimeHours: 0,
          nightHours: 0,
          gross: 30000,
          deductions: 2500,
          net: 27500,
          sss: 1125,
          philhealth: 875,
          pagibig: 500,
          isThirteenthMonth: false,
          createdAt: '2024-02-03T10:00:00.000Z',
          user: {
            id: 1,
            firebaseUid: 'firebase_abc123',
            email: 'juan.delacruz@example.com',
            name: 'Juan Dela Cruz',
            role: 'user',
          }
        }
      ]
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid month format',
  })
  async report(@Query() query: ComputePayrollDto) {
    return this.svc.report(query.month);
  }
}
