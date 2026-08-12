import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { OFFER_STATUSES, OfferStatus } from "../offers.constants";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class UpdateOfferDto {
  @ApiPropertyOptional({ example: "CRM Starter", maxLength: 120 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: "Entry CRM offer", maxLength: 500 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: OFFER_STATUSES.ACTIVE,
    enum: Object.values(OFFER_STATUSES),
  })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @IsIn(Object.values(OFFER_STATUSES))
  status?: OfferStatus;

  @ApiPropertyOptional({ example: "public", maxLength: 40 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  visibility?: string;
}
