import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  item_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  company_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  item_code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  unit: string;

  @ApiProperty()
  @IsNumber()
  price: number;
}