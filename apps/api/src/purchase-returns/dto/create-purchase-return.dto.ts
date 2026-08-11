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

export class CreatePurchaseReturnDto {
  @ApiProperty({ example: "PRET-2026-001", maxLength: 80 })
  @Transform(normalizeCode)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  number!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  purchaseReceiptId!: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
