import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const normalizeDocumentType = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

export class UpdateBusinessPartnerDocumentDto {
  @ApiPropertyOptional({ example: "Signed contract", maxLength: 160 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional({ example: "CONTRACT", maxLength: 80 })
  @Transform(normalizeDocumentType)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(/^[A-Z0-9][A-Z0-9._-]*$/)
  documentType?: string;

  @ApiPropertyOptional({ example: "contract.pdf", maxLength: 255 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  fileName?: string;

  @ApiPropertyOptional({ example: "application/pdf", maxLength: 120 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  mimeType?: string;

  @ApiPropertyOptional({ example: 204800 })
  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({
    example: "business-partners/documents/contract.pdf",
  })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  storageKey?: string;
}
