import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  PurchasePaymentMethod,
  PurchasePaymentStatus,
} from "@prisma/client";
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsUUID,
} from "class-validator";

export class SearchPurchasePaymentsDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  purchaseInvoiceId?: string;

  @ApiPropertyOptional({ enum: PurchasePaymentStatus })
  @IsOptional()
  @IsEnum(PurchasePaymentStatus)
  status?: PurchasePaymentStatus;

  @ApiPropertyOptional({ enum: PurchasePaymentMethod })
  @IsOptional()
  @IsEnum(PurchasePaymentMethod)
  paymentMethod?: PurchasePaymentMethod;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsDateString()
  paymentDateFrom?: string;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsDateString()
  paymentDateTo?: string;
}
