import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { FEATURE_STATUSES, FeatureStatus } from "../features.constants";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class CreateFeatureDto {
  @ApiProperty({ example: "crm.contacts", maxLength: 120 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Matches(/^[a-z0-9][a-z0-9.-]*$/)
  key!: string;

  @ApiProperty({ example: "CRM Contacts", maxLength: 120 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

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

  @ApiPropertyOptional({
    example: FEATURE_STATUSES.ACTIVE,
    default: FEATURE_STATUSES.ACTIVE,
    enum: Object.values(FEATURE_STATUSES),
  })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @IsIn(Object.values(FEATURE_STATUSES))
  status?: FeatureStatus;
}
