import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
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

const normalizeCode = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

export class CreateBusinessPartnerDto {
  @ApiProperty({ example: "CUST-001", maxLength: 40 })
  @Transform(normalizeCode)
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  @Matches(/^[A-Z0-9][A-Z0-9._-]*$/)
  code!: string;

  @ApiProperty({ enum: BUSINESS_PARTNER_TYPES, example: BusinessPartnerType.CUSTOMER })
  @Transform(normalizeText)
  @IsString()
  @IsEnum(BusinessPartnerType)
  type!: BusinessPartnerType;

  @ApiProperty({ example: "ACME France", maxLength: 160 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional({ example: "ACME France SAS", maxLength: 200 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @ApiPropertyOptional({ enum: BUSINESS_PARTNER_STATUSES, example: BusinessPartnerStatus.ACTIVE })
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
