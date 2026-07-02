import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class UpdatePriceDto {
  @ApiPropertyOptional({ example: "EUR", maxLength: 3 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toUpperCase() : value,
  )
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency?: string;

  @ApiPropertyOptional({ example: 39.99, minimum: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ example: "monthly", maxLength: 40 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  billingPeriod?: string;

  @ApiPropertyOptional({ example: "2026-01-01T00:00:00.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  validFrom?: Date;

  @ApiPropertyOptional({ example: "2026-12-31T23:59:59.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  validTo?: Date;

  @ApiPropertyOptional({ example: "active", maxLength: 40 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  status?: string;
}
