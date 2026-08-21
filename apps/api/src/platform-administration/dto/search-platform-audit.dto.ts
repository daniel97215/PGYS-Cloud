import { ApiPropertyOptional } from "@nestjs/swagger";
import { AuditAction } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const normalizeNumber = ({ value }: { value: unknown }) =>
  value === undefined || value === null || value === ""
    ? undefined
    : Number(value);

export class SearchPlatformAuditDto {
  @ApiPropertyOptional({ maxLength: 120 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({ enum: AuditAction })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  workspaceId?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  actorId?: string;

  @ApiPropertyOptional({ maxLength: 80 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  targetType?: string;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsISO8601({ strict: true })
  from?: string;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsISO8601({ strict: true })
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
