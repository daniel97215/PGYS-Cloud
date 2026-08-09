import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SalesPaymentMethod } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
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

export class CreateSalesPaymentDto {
  @ApiProperty({ example: "PAY-2026-001", maxLength: 80 })
  @Transform(normalizeCode)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  number!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  businessPartnerId!: string;

  @ApiProperty({ enum: SalesPaymentMethod })
  @IsEnum(SalesPaymentMethod)
  method!: SalesPaymentMethod;

  @ApiProperty({ example: 120 })
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 4 })
  @IsPositive()
  amount!: number;

  @ApiProperty({ example: "EUR", minLength: 3, maxLength: 3 })
  @Transform(normalizeCode)
  @IsString()
  @Length(3, 3)
  currencyCode!: string;

  @ApiProperty({ format: "date-time" })
  @IsDateString()
  paymentDate!: string;

  @ApiPropertyOptional({ maxLength: 160 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(160)
  externalReference?: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
