import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsDate,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from "class-validator";
import { PRICE_STATUSES, PriceStatus } from "../pricing.constants";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class CreatePriceDto {
  @ApiPropertyOptional({ example: "EUR", default: "EUR", maxLength: 3 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toUpperCase() : value,
  )
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency?: string;

  @ApiProperty({ example: 29.99, minimum: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount!: number;

  @ApiProperty({ example: "monthly", maxLength: 40 })
  @Transform(normalizeText)
  @IsString()
  @MaxLength(40)
  billingPeriod!: string;

  @ApiProperty({ example: "2026-01-01T00:00:00.000Z" })
  @Type(() => Date)
  @IsDate()
  validFrom!: Date;

  @ApiPropertyOptional({ example: "2026-12-31T23:59:59.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  validTo?: Date;

  @ApiPropertyOptional({
    example: PRICE_STATUSES.ACTIVE,
    default: PRICE_STATUSES.ACTIVE,
    enum: Object.values(PRICE_STATUSES),
  })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @IsIn(Object.values(PRICE_STATUSES))
  status?: PriceStatus;
}
