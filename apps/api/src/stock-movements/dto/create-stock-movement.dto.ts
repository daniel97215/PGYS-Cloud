import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { StockMovementDirection } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class CreateStockMovementDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  inventoryItemId!: string;

  @ApiProperty({ enum: StockMovementDirection, example: "IN" })
  @IsEnum(StockMovementDirection)
  direction!: StockMovementDirection;

  @ApiProperty({ example: 10.5 })
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 4 })
  @IsPositive()
  quantity!: number;

  @ApiPropertyOptional({ example: "Goods receipt", maxLength: 500 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({ example: "PURCHASE_ORDER", maxLength: 80 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  referenceType?: string;

  @ApiPropertyOptional({ example: "PO-2026-001", maxLength: 160 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(160)
  referenceId?: string;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}
