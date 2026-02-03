import { IsNumber, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ComputePayrollBodyDto {
  @ApiProperty({
    description: 'User ID for payroll computation',
    example: 1,
  })
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Month in YYYY-MM format',
    example: '2024-02',
    pattern: '^\\d{4}-\\d{2}$',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Month format must be YYYY-MM' })
  month: string;
}
