import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: {
      item: { create: true, read: true, update: false, delete: false },
      indent: { create: true, read: true, update: true, delete: false },
      mi: { create: false, read: true, update: false, delete: false },
      rfq: { create: false, read: true, update: false, delete: false },
      vendor: { create: false, read: true, update: false, delete: false },
    },
  })
  @IsObject()
  permissions: Record<string, Record<string, boolean>>;
}