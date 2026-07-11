import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ProductAttributeValueType } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const normalizeCode = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

export class CreateProductAttributeDto {
  @ApiProperty({ example: "COLOR", maxLength: 80 })
  @Transform(normalizeCode)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  code!: string;

  @ApiProperty({ example: "Color", maxLength: 120 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ enum: ProductAttributeValueType, example: ProductAttributeValueType.TEXT })
  @IsEnum(ProductAttributeValueType)
  valueType!: ProductAttributeValueType;

  @ApiPropertyOptional({ example: "Product color", maxLength: 500 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isVariantAxis?: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
