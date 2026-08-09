import { ApiPropertyOptional } from "@nestjs/swagger";
import { PurchaseInvoiceStatus } from "@prisma/client";
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsUUID,
} from "class-validator";

export class SearchPurchaseInvoicesDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  supplierId?: string;

  @ApiPropertyOptional({ enum: PurchaseInvoiceStatus })
  @IsOptional()
  @IsEnum(PurchaseInvoiceStatus)
  status?: PurchaseInvoiceStatus;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsDateString()
  invoiceDateFrom?: string;

  @ApiPropertyOptional({ format: "date-time" })
  @IsOptional()
  @IsDateString()
  invoiceDateTo?: string;
}
