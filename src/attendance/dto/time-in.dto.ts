import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TimeInDto {
  @ApiProperty({
    description: 'Optional note for clock-in',
    example: 'Starting work for the day',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}
