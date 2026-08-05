import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
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

export class CreateInventoryCountDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  warehouseId!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  storageLocationId!: string;

  @ApiProperty({ example: "COUNT-2026-001", maxLength: 80 })
  @Transform(normalizeCode)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  code!: string;

  @ApiPropertyOptional({ example: "Monthly physical count", maxLength: 500 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
