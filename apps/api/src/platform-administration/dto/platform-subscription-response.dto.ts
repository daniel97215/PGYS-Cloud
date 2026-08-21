import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PlatformOperatorRole } from "@prisma/client";
import { SUBSCRIPTION_STATUSES } from "../../subscriptions/subscriptions.constants";

class PlatformSubscriptionWorkspaceDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty()
  slug!: string;
}

class PlatformSubscriptionOfferDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  name!: string;
}

class PlatformSubscriptionPriceDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "49.90" })
  amount!: string;

  @ApiProperty({ example: "EUR" })
  currency!: string;

  @ApiProperty({ example: "monthly" })
  billingPeriod!: string;
}

export class PlatformSubscriptionResponseDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ enum: Object.values(SUBSCRIPTION_STATUSES) })
  status!: string;

  @ApiProperty({ type: PlatformSubscriptionWorkspaceDto })
  workspace!: PlatformSubscriptionWorkspaceDto;

  @ApiProperty({ type: PlatformSubscriptionOfferDto })
  offer!: PlatformSubscriptionOfferDto;

  @ApiPropertyOptional({
    type: PlatformSubscriptionPriceDto,
    nullable: true,
  })
  price!: PlatformSubscriptionPriceDto | null;

  @ApiProperty({ format: "date-time" })
  startedAt!: Date;

  @ApiPropertyOptional({ format: "date-time", nullable: true })
  endsAt!: Date | null;

  @ApiPropertyOptional({ format: "date-time", nullable: true })
  cancelledAt!: Date | null;

  @ApiPropertyOptional({ format: "date-time", nullable: true })
  renewalDate!: Date | null;

  @ApiProperty({ format: "date-time" })
  createdAt!: Date;

  @ApiProperty({ format: "date-time" })
  updatedAt!: Date;
}

export class PlatformSubscriptionPageResponseDto {
  @ApiProperty({ type: [PlatformSubscriptionResponseDto] })
  items!: PlatformSubscriptionResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty({ enum: PlatformOperatorRole })
  accessRole!: PlatformOperatorRole;
}
