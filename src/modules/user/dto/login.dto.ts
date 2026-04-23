import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com or phone number' })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}