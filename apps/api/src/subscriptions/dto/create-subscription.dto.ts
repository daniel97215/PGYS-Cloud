import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsDate, IsIn, IsOptional, IsString, IsUUID } from "class-validator";
import { SUBSCRIPTION_STATUSES } from "../subscriptions.repository";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class CreateSubscriptionDto {
  @ApiProperty({ example: "10000000-0000-4000-8000-000000000001" })
  @IsUUID()
  workspaceId!: string;

  @ApiProperty({ example: "crm-starter" })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsString()
  offerKey!: string;

  @ApiPropertyOptional({ example: "10000000-0000-4000-8000-000000000002" })
  @IsOptional()
  @IsUUID()
  priceId?: string;

  @ApiProperty({ example: "2026-01-01T00:00:00.000Z" })
  @Type(() => Date)
  @IsDate()
  startedAt!: Date;

  @ApiPropertyOptional({ example: "2026-12-31T23:59:59.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  endsAt?: Date;

  @ApiPropertyOptional({ example: "2026-02-01T00:00:00.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  renewalDate?: Date;

  @ApiPropertyOptional({
    example: SUBSCRIPTION_STATUSES.PENDING,
    enum: Object.values(SUBSCRIPTION_STATUSES),
  })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @IsIn(Object.values(SUBSCRIPTION_STATUSES))
  status?: string;
}
