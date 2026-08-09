import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { PurchaseInvoiceLineDto } from "./purchase-invoice-line.dto";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const normalizeCode = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

export class CreatePurchaseInvoiceDto {
  @ApiProperty({ example: "PI-2026-001", maxLength: 80 })
  @Transform(normalizeCode)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  number!: string;

  @ApiProperty({ example: "SUP-INV-42", maxLength: 160 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  supplierInvoiceNumber!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  supplierId!: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  purchaseOrderId?: string;

  @ApiProperty({ example: "EUR", minLength: 3, maxLength: 3 })
  @Transform(normalizeCode)
  @IsString()
  @Length(3, 3)
  currencyCode!: string;

  @ApiProperty({ format: "date-time" })
  @IsDateString()
  invoiceDate!: string;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({ type: [PurchaseInvoiceLineDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseInvoiceLineDto)
  lines?: PurchaseInvoiceLineDto[];
}
