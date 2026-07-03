import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsDate, IsOptional, IsString, IsUUID } from "class-validator";

export class ChangeOfferDto {
  @ApiProperty({ example: "crm-pro" })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsString()
  offerKey!: string;

  @ApiPropertyOptional({ example: "10000000-0000-4000-8000-000000000002" })
  @IsOptional()
  @IsUUID()
  priceId?: string;

  @ApiPropertyOptional({ example: "2026-02-01T00:00:00.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  renewalDate?: Date;
}
