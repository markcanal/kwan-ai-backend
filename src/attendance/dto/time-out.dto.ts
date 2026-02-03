import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TimeOutDto {
  @ApiProperty({
    description: 'Optional note for clock-out',
    example: 'End of workday',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}
