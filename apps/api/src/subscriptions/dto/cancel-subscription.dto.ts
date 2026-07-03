import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsOptional } from "class-validator";

export class CancelSubscriptionDto {
  @ApiPropertyOptional({ example: "2026-06-30T00:00:00.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  cancelledAt?: Date;

  @ApiPropertyOptional({ example: "2026-06-30T23:59:59.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  endsAt?: Date;
}
