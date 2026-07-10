import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsDateString,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const normalizeCode = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

export class CreateBusinessPartnerTimelineEntryDto {
  @ApiProperty({ example: "NOTE_CREATED", maxLength: 80 })
  @Transform(normalizeCode)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(/^[A-Z0-9][A-Z0-9._-]*$/)
  eventType!: string;

  @ApiProperty({ example: "Internal note created", maxLength: 160 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @ApiPropertyOptional({ example: "A new internal note was added." })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: "business-partner-notes", maxLength: 120 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  sourceModule!: string;

  @ApiPropertyOptional({
    example: "30000000-0000-4000-8000-000000000001",
    maxLength: 120,
  })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  sourceId?: string;

  @ApiPropertyOptional({
    type: "object",
    additionalProperties: true,
    example: { importance: "normal" },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiProperty({ example: "2026-01-01T00:00:00.000Z" })
  @IsDateString()
  occurredAt!: string;
}
