import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  MinLength,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const normalizeCode = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

export class CreateSalesQuoteDto {
  @ApiProperty({ example: "Q-2026-001", maxLength: 80 })
  @Transform(normalizeCode)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  number!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  businessPartnerId!: string;

  @ApiProperty({ format: "date-time" })
  @IsDateString()
  issueDate!: string;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiProperty({ example: "EUR", minLength: 3, maxLength: 3 })
  @Transform(normalizeCode)
  @IsString()
  @Length(3, 3)
  currencyCode!: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
