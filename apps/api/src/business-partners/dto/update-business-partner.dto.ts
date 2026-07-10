import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import {
  BusinessPartnerStatus,
  BUSINESS_PARTNER_STATUSES,
} from "../enums/business-partner-status.enum";
import { BusinessPartnerType, BUSINESS_PARTNER_TYPES } from "../enums/business-partner-type.enum";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class UpdateBusinessPartnerDto {
  @ApiPropertyOptional({ enum: BUSINESS_PARTNER_TYPES, example: BusinessPartnerType.PROSPECT })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @IsEnum(BusinessPartnerType)
  type?: BusinessPartnerType;

  @ApiPropertyOptional({ example: "ACME France", maxLength: 160 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional({ example: "ACME France SAS", maxLength: 200 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @ApiPropertyOptional({
    enum: BUSINESS_PARTNER_STATUSES,
    example: BusinessPartnerStatus.INACTIVE,
  })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @IsEnum(BusinessPartnerStatus)
  status?: BusinessPartnerStatus;

  @ApiPropertyOptional({ example: "Strategic customer", maxLength: 1000 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
