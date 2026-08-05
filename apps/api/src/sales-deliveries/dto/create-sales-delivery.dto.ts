import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const normalizeCode = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

export class CreateSalesDeliveryDto {
  @ApiProperty({ example: "DEL-2026-001", maxLength: 80 })
  @Transform(normalizeCode)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  number!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  salesOrderId!: string;

  @ApiPropertyOptional({ type: "object", additionalProperties: true })
  @IsOptional()
  @IsObject()
  deliveryAddress?: Record<string, unknown>;

  @ApiPropertyOptional({ maxLength: 2000 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
