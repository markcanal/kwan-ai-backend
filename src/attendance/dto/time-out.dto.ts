import { IsOptional, IsString } from 'class-validator';

export class TimeOutDto {
  @IsOptional()
  @IsString()
  note?: string;
}
