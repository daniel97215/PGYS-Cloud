import { ApiPropertyOptional } from "@nestjs/swagger";
import { AiUsageStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { AI_PROVIDER, AiProviderId } from "../ai.constants";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const normalizeUpperText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

const normalizeNumber = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return Number(value);
};

export class SearchAiUsageDto {
  @ApiPropertyOptional({ enum: AiUsageStatus })
  @IsOptional()
  @IsEnum(AiUsageStatus)
  status?: AiUsageStatus;

  @ApiPropertyOptional({ enum: AI_PROVIDER })
  @Transform(normalizeUpperText)
  @IsOptional()
  @IsEnum(AI_PROVIDER)
  provider?: AiProviderId;

  @ApiPropertyOptional({ maxLength: 120 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  useCase?: string;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Transform(normalizeNumber)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 25 })
  @Transform(normalizeNumber)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
