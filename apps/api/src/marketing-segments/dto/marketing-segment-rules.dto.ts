import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

const normalizeCodes = ({ value }: { value: unknown }) =>
  Array.isArray(value)
    ? value.map((item) =>
        typeof item === "string" ? item.trim().toUpperCase() : item,
      )
    : value;

const CODE_PATTERN = /^[A-Z0-9][A-Z0-9._-]*$/;

export class MarketingSegmentRulesDto {
  @ApiPropertyOptional({ type: [String], example: ["PROSPECT", "CUSTOMER"] })
  @Transform(normalizeCodes)
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  @Matches(CODE_PATTERN, { each: true })
  roleCodes?: string[];

  @ApiPropertyOptional({ type: [String], example: ["GRAND-COMPTE"] })
  @Transform(normalizeCodes)
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  @Matches(CODE_PATTERN, { each: true })
  categoryCodes?: string[];

  @ApiPropertyOptional({ type: [String], example: ["VIP"] })
  @Transform(normalizeCodes)
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  @Matches(CODE_PATTERN, { each: true })
  tagCodes?: string[];

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;
}
