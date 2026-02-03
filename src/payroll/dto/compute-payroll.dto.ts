import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ComputePayrollDto {
  @ApiProperty({
    description: 'Month in YYYY-MM format for payroll report',
    example: '2024-02',
    pattern: '^\\d{4}-\\d{2}$',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Month format must be YYYY-MM' })
  month: string;
}
