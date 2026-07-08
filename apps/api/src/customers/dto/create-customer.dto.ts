import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { CUSTOMER_TYPES } from "../customers.repository";
import {
  CustomerStatus,
  CUSTOMER_STATUSES,
} from "../enums/customer-status.enum";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const normalizeCode = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

export class CreateCustomerDto {
  @ApiProperty({ example: "CUST-001", maxLength: 40 })
  @Transform(normalizeCode)
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  @Matches(/^[A-Z0-9][A-Z0-9._-]*$/)
  code!: string;

  @ApiProperty({ enum: CUSTOMER_TYPES, example: "customer" })
  @Transform(normalizeText)
  @IsString()
  @IsIn(CUSTOMER_TYPES)
  type!: string;

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

  @ApiPropertyOptional({ enum: CUSTOMER_STATUSES, example: CustomerStatus.ACTIVE })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiPropertyOptional({ example: "Strategic customer", maxLength: 1000 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
