import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const normalizeCode = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

export class CreatePriceListDto {
  @ApiProperty({ example: "PUBLIC", maxLength: 80 })
  @Transform(normalizeCode)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  code!: string;

  @ApiProperty({ example: "Public price list", maxLength: 120 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: "Default public prices", maxLength: 500 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: "EUR", minLength: 3, maxLength: 3 })
  @Transform(normalizeCode)
  @IsString()
  @Length(3, 3)
  currencyCode!: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
