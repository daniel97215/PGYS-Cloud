import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsOptional } from "class-validator";

export class ReactivateSubscriptionDto {
  @ApiPropertyOptional({ example: "2026-07-01T00:00:00.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  startedAt?: Date;

  @ApiPropertyOptional({ example: "2027-06-30T23:59:59.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  endsAt?: Date;

  @ApiPropertyOptional({ example: "2026-08-01T00:00:00.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  renewalDate?: Date;
}
