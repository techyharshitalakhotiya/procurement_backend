import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateIndentItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  item_id: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateIndentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  company_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ type: [CreateIndentItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIndentItemDto)
  items: CreateIndentItemDto[];
}