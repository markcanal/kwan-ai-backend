import { IsString, Matches } from 'class-validator';

export class ComputePayrollDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Month format must be YYYY-MM' })
  month: string;
}
