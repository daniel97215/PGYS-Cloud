import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsInt,
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

export class CreateBusinessPartnerDocumentDto {
  @ApiProperty({ example: "Signed contract", maxLength: 160 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @ApiProperty({ example: "CONTRACT", maxLength: 80 })
  @Transform(normalizeDocumentType)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(/^[A-Z0-9][A-Z0-9._-]*$/)
  documentType!: string;

  @ApiProperty({ example: "contract.pdf", maxLength: 255 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  fileName!: string;

  @ApiProperty({ example: "application/pdf", maxLength: 120 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  mimeType!: string;

  @ApiProperty({ example: 204800 })
  @IsInt()
  @Min(0)
  fileSize!: number;

  @ApiProperty({ example: "business-partners/documents/contract.pdf" })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  storageKey!: string;
}
