import { IsNotEmpty, IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateQuoteItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  item_id: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  per_unit_rate: number;
}

export class CreateQuoteDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  vendor_id: string;

  @ApiProperty({ type: [CreateQuoteItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteItemDto)
  items: CreateQuoteItemDto[];
}