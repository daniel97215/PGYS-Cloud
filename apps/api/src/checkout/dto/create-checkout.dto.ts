import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsDate,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class CreateCheckoutDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  offerId!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  priceId!: string;

  @ApiProperty({ minLength: 1, maxLength: 120 })
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  idempotencyKey!: string;

  @ApiProperty({ format: "date-time" })
  @Type(() => Date)
  @IsDate()
  expiresAt!: Date;
}
