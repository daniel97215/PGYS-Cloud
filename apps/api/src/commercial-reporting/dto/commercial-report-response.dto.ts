import { ApiProperty } from "@nestjs/swagger";
import { InvoiceStatus } from "@prisma/client";
import {
  SUBSCRIPTION_STATUSES,
  SubscriptionStatus,
} from "../../subscriptions/subscriptions.constants";

export class CommercialSubscriptionGroupDto {
  @ApiProperty({ format: "uuid" })
  offerId!: string;

  @ApiProperty({ enum: Object.values(SUBSCRIPTION_STATUSES) })
  status!: SubscriptionStatus;

  @ApiProperty({ example: 4 })
  count!: number;
}

export class CommercialInvoiceGroupDto {
  @ApiProperty({ enum: InvoiceStatus })
  status!: InvoiceStatus;

  @ApiProperty({ example: "EUR" })
  currency!: string;

  @ApiProperty({ example: 3 })
  count!: number;

  @ApiProperty({ example: "300.00" })
  subtotalAmount!: string;

  @ApiProperty({ example: "20.00" })
  discountAmount!: string;

  @ApiProperty({ example: "56.00" })
  taxAmount!: string;

  @ApiProperty({ example: "336.00" })
  totalAmount!: string;
}

export class CommercialSubscriptionReportResponseDto {
  @ApiProperty({ format: "date-time" })
  generatedAt!: string;

  @ApiProperty({ type: [CommercialSubscriptionGroupDto] })
  groups!: CommercialSubscriptionGroupDto[];
}

export class CommercialInvoiceReportResponseDto {
  @ApiProperty({ format: "date-time" })
  generatedAt!: string;

  @ApiProperty({ type: [CommercialInvoiceGroupDto] })
  groups!: CommercialInvoiceGroupDto[];
}
