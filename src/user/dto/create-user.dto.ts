import { IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'Juan Dela Cruz',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'juan.delacruz@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}
