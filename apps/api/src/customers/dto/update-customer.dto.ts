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
  CustomerStatus,
  CUSTOMER_STATUSES,
} from "../enums/customer-status.enum";
import { CustomerType, CUSTOMER_TYPES } from "../enums/customer-type.enum";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class UpdateCustomerDto {
  @ApiPropertyOptional({ enum: CUSTOMER_TYPES, example: CustomerType.PROSPECT })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @IsEnum(CustomerType)
  type?: CustomerType;

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
    enum: CUSTOMER_STATUSES,
    example: CustomerStatus.INACTIVE,
  })
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
