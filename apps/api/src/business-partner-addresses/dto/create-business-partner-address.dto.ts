import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const normalizeCountryCode = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

export class CreateBusinessPartnerAddressDto {
  @ApiProperty({ example: "Head office", maxLength: 80 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  label!: string;

  @ApiProperty({ example: "10 rue de la Paix", maxLength: 180 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(180)
  addressLine1!: string;

  @ApiPropertyOptional({ example: "Batiment A", maxLength: 180 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(180)
  addressLine2?: string;

  @ApiProperty({ example: "75002", maxLength: 20 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  postalCode!: string;

  @ApiProperty({ example: "Paris", maxLength: 120 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  city!: string;

  @ApiPropertyOptional({ example: "Ile-de-France", maxLength: 120 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  state?: string;

  @ApiProperty({ example: "FR", minLength: 2, maxLength: 2 })
  @Transform(normalizeCountryCode)
  @IsString()
  @Matches(/^[A-Z]{2}$/)
  countryCode!: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
