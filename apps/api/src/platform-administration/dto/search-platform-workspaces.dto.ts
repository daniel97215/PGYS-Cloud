import { ApiPropertyOptional } from "@nestjs/swagger";
import { WorkspaceStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
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

export class SearchPlatformWorkspacesDto {
  @ApiPropertyOptional({ maxLength: 120 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({ enum: WorkspaceStatus })
  @IsOptional()
  @IsEnum(WorkspaceStatus)
  status?: WorkspaceStatus;

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
