import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  MinLength,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const normalizeCode = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

export class CreateCrmOpportunityDto {
  @ApiProperty({ example: "OPP-2026-001", maxLength: 80 })
  @Transform(normalizeCode)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  code!: string;

  @ApiProperty({ example: "Cloud migration project", maxLength: 160 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  businessPartnerId!: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  contactId?: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  pipelineId!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  stageId!: string;

  @ApiPropertyOptional({ example: 2500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @IsPositive()
  amount?: number;

  @ApiProperty({ example: "EUR", minLength: 3, maxLength: 3 })
  @Transform(normalizeCode)
  @IsString()
  @Length(3, 3)
  currency!: string;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  responsibleMemberId?: string;
}
