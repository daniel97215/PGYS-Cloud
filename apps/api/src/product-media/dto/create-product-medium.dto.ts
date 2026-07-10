import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const normalizeType = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

export class CreateProductMediumDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  productId?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  productVariantId?: string;

  @ApiProperty({ example: "Main product image", maxLength: 160 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @ApiProperty({ example: "IMAGE", maxLength: 40 })
  @Transform(normalizeType)
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  mediaType!: string;

  @ApiProperty({ example: "product-main.jpg", maxLength: 255 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  fileName!: string;

  @ApiProperty({ example: "image/jpeg", maxLength: 120 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  mimeType!: string;

  @ApiProperty({ example: 245760 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  fileSize!: number;

  @ApiProperty({ example: "products/PROD-001/main.jpg", maxLength: 500 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  storageKey!: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
