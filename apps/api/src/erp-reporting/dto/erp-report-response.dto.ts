import { ApiProperty } from "@nestjs/swagger";
import {
  PurchaseInvoiceStatus,
  PurchaseOrderStatus,
  SalesInvoiceStatus,
  SalesOrderStatus,
  StockMovementDirection,
} from "@prisma/client";

class ErpDocumentAmountsDto {
  @ApiProperty({ example: "EUR" })
  currency!: string;

  @ApiProperty({ example: 3 })
  count!: number;

  @ApiProperty({ example: "300.0000" })
  subtotalAmount!: string;

  @ApiProperty({ example: "60.0000" })
  taxAmount!: string;

  @ApiProperty({ example: "360.0000" })
  totalAmount!: string;
}

class ErpInvoiceAmountsDto extends ErpDocumentAmountsDto {
  @ApiProperty({ example: "240.0000" })
  paidAmount!: string;
}

export class ErpSalesOrderGroupDto extends ErpDocumentAmountsDto {
  @ApiProperty({ enum: SalesOrderStatus })
  status!: SalesOrderStatus;
}

export class ErpSalesInvoiceGroupDto extends ErpInvoiceAmountsDto {
  @ApiProperty({ enum: SalesInvoiceStatus })
  status!: SalesInvoiceStatus;
}

export class ErpPurchaseOrderGroupDto extends ErpDocumentAmountsDto {
  @ApiProperty({ enum: PurchaseOrderStatus })
  status!: PurchaseOrderStatus;
}

export class ErpPurchaseInvoiceGroupDto extends ErpInvoiceAmountsDto {
  @ApiProperty({ enum: PurchaseInvoiceStatus })
  status!: PurchaseInvoiceStatus;
}

export class ErpStockMovementGroupDto {
  @ApiProperty({ enum: StockMovementDirection })
  direction!: StockMovementDirection;

  @ApiProperty({ example: 5 })
  count!: number;

  @ApiProperty({ example: "42.5000" })
  quantity!: string;
}

export class ErpSalesOrderReportResponseDto {
  @ApiProperty({ format: "date-time" })
  generatedAt!: string;

  @ApiProperty({ type: [ErpSalesOrderGroupDto] })
  groups!: ErpSalesOrderGroupDto[];
}

export class ErpSalesInvoiceReportResponseDto {
  @ApiProperty({ format: "date-time" })
  generatedAt!: string;

  @ApiProperty({ type: [ErpSalesInvoiceGroupDto] })
  groups!: ErpSalesInvoiceGroupDto[];
}

export class ErpPurchaseOrderReportResponseDto {
  @ApiProperty({ format: "date-time" })
  generatedAt!: string;

  @ApiProperty({ type: [ErpPurchaseOrderGroupDto] })
  groups!: ErpPurchaseOrderGroupDto[];
}

export class ErpPurchaseInvoiceReportResponseDto {
  @ApiProperty({ format: "date-time" })
  generatedAt!: string;

  @ApiProperty({ type: [ErpPurchaseInvoiceGroupDto] })
  groups!: ErpPurchaseInvoiceGroupDto[];
}

export class ErpStockMovementReportResponseDto {
  @ApiProperty({ format: "date-time" })
  generatedAt!: string;

  @ApiProperty({ type: [ErpStockMovementGroupDto] })
  groups!: ErpStockMovementGroupDto[];
}
