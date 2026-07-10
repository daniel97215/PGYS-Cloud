import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class UpdateManufacturerDto {
  @ApiPropertyOptional({ example: "Acme Manufacturing", maxLength: 120 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: "Acme product manufacturer", maxLength: 500 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: "https://example.com", maxLength: 2048 })
  @Transform(normalizeText)
  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  websiteUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
