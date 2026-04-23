import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMIItemDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  item_id: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}

export class CreateMIDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  indent_id?: string;

  @ApiProperty({ type: [CreateMIItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMIItemDto)
  items: CreateMIItemDto[];
}