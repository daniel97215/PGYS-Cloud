import { ApiPropertyOptional } from "@nestjs/swagger";
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

export class UpdateProductMediumDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  productId?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  productVariantId?: string;

  @ApiPropertyOptional({ example: "Main product image", maxLength: 160 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional({ example: "IMAGE", maxLength: 40 })
  @Transform(normalizeType)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  mediaType?: string;

  @ApiPropertyOptional({ example: "product-main.jpg", maxLength: 255 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  fileName?: string;

  @ApiPropertyOptional({ example: "image/jpeg", maxLength: 120 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  mimeType?: string;

  @ApiPropertyOptional({ example: 245760 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ example: "products/PROD-001/main.jpg", maxLength: 500 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  storageKey?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
