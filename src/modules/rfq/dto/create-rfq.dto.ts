import { IsNotEmpty, IsString, IsArray, ValidateNested, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRFQItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  item_id: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}

export class CreateRFQDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  company_id: string;

  @ApiProperty({ type: [CreateRFQItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRFQItemDto)
  items: CreateRFQItemDto[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  vendor_ids?: string[];
}