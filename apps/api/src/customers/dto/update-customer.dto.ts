import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { CUSTOMER_STATUSES, CUSTOMER_TYPES } from "../customers.repository";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class UpdateCustomerDto {
  @ApiPropertyOptional({ enum: CUSTOMER_TYPES, example: "prospect" })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @IsIn(CUSTOMER_TYPES)
  type?: string;

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

  @ApiPropertyOptional({ enum: CUSTOMER_STATUSES, example: "inactive" })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @IsIn(CUSTOMER_STATUSES)
  status?: string;

  @ApiPropertyOptional({ example: "Strategic customer", maxLength: 1000 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
