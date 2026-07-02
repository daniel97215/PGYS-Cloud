import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class UpdateFeatureDto {
  @ApiPropertyOptional({ example: "CRM Contacts", maxLength: 120 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: "Manage CRM contacts", maxLength: 500 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: "crm", maxLength: 80 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @ApiPropertyOptional({ example: "active", maxLength: 40 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  status?: string;
}
