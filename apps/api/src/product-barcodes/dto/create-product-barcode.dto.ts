import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const normalizeType = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

export class CreateProductBarcodeDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  productId?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  productVariantId?: string;

  @ApiProperty({ example: "3760000000000", maxLength: 120 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  barcode!: string;

  @ApiProperty({ example: "EAN13", maxLength: 40 })
  @Transform(normalizeType)
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  barcodeType!: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
