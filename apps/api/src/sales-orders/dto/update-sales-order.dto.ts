import { ApiPropertyOptional } from "@nestjs/swagger";
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

export class UpdateSalesOrderDto {
  @ApiPropertyOptional({ example: "SO-2026-001", maxLength: 80 })
  @Transform(normalizeCode)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  number?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  businessPartnerId?: string;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsDateString()
  orderDate?: string;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsDateString()
  requestedDate?: string;

  @ApiPropertyOptional({ example: "EUR", minLength: 3, maxLength: 3 })
  @Transform(normalizeCode)
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currencyCode?: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
