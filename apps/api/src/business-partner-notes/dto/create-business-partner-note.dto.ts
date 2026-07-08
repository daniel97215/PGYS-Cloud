import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class CreateBusinessPartnerNoteDto {
  @ApiPropertyOptional({ example: "Internal context", maxLength: 160 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @ApiProperty({ example: "Customer prefers monthly operational reviews." })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;

  @ApiPropertyOptional({
    example: "10000000-0000-4000-8000-000000000001",
    maxLength: 120,
  })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  createdBy?: string;

  @ApiPropertyOptional({
    example: "10000000-0000-4000-8000-000000000001",
    maxLength: 120,
  })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  updatedBy?: string;
}
