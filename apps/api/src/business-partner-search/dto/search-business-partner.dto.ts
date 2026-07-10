import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export const BUSINESS_PARTNER_SEARCH_SORT_FIELDS = [
  "code",
  "name",
  "status",
  "createdAt",
  "updatedAt",
] as const;

export const BUSINESS_PARTNER_SEARCH_ORDERS = ["asc", "desc"] as const;

export type BusinessPartnerSearchSortField =
  (typeof BUSINESS_PARTNER_SEARCH_SORT_FIELDS)[number];

export type BusinessPartnerSearchOrder =
  (typeof BUSINESS_PARTNER_SEARCH_ORDERS)[number];

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const normalizeLowerText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toLowerCase() : value;

const normalizeNumber = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return Number(value);
};

export class SearchBusinessPartnerDto {
  @ApiPropertyOptional({ example: "CUST-001", maxLength: 80 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  code?: string;

  @ApiPropertyOptional({ example: "Acme", maxLength: 160 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional({ example: "GRAND-COMPTE", maxLength: 80 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @ApiPropertyOptional({ example: "CUSTOMER", maxLength: 80 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  role?: string;

  @ApiPropertyOptional({ example: "VIP", maxLength: 80 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  tag?: string;

  @ApiPropertyOptional({ example: "Paris", maxLength: 120 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @ApiPropertyOptional({ example: "contact@example.com", maxLength: 254 })
  @Transform(normalizeLowerText)
  @IsOptional()
  @IsString()
  @MaxLength(254)
  email?: string;

  @ApiPropertyOptional({ example: "+33102030405", maxLength: 40 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional({ example: "active", maxLength: 40 })
  @Transform(normalizeLowerText)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  status?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @Transform(normalizeNumber)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 25, minimum: 1, maximum: 100, default: 25 })
  @Transform(normalizeNumber)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;

  @ApiPropertyOptional({
    enum: BUSINESS_PARTNER_SEARCH_SORT_FIELDS,
    example: "name",
    default: "name",
  })
  @Transform(normalizeText)
  @IsOptional()
  @IsIn(BUSINESS_PARTNER_SEARCH_SORT_FIELDS)
  sort?: BusinessPartnerSearchSortField;

  @ApiPropertyOptional({
    enum: BUSINESS_PARTNER_SEARCH_ORDERS,
    example: "asc",
    default: "asc",
  })
  @Transform(normalizeLowerText)
  @IsOptional()
  @IsIn(BUSINESS_PARTNER_SEARCH_ORDERS)
  order?: BusinessPartnerSearchOrder;
}
