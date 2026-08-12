import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

const normalizeCode = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

export class CreateBillingInvoiceDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  subscriptionId!: string;

  @ApiProperty({ format: "date-time" })
  @Type(() => Date)
  @IsDate()
  periodStart!: Date;

  @ApiProperty({ format: "date-time" })
  @Type(() => Date)
  @IsDate()
  dueAt!: Date;

  @ApiPropertyOptional({ example: "VAT20", maxLength: 80 })
  @Transform(normalizeCode)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  taxCode?: string;

  @ApiPropertyOptional({ example: 10, minimum: 0, maximum: 100, default: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  discountRate?: number;
}
