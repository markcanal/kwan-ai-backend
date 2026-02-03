import { IsNumber, IsString, Matches } from 'class-validator';

export class ComputePayrollBodyDto {
  @IsNumber()
  userId: number;

  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: 'Month format must be YYYY-MM' })
  month: string;
}
