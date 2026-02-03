import { IsOptional, IsString } from 'class-validator';

export class TimeInDto {
  @IsOptional()
  @IsString()
  note?: string;
}
