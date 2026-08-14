import { Injectable } from "@nestjs/common";
import {
  Prisma,
  PurchaseInvoiceStatus,
  PurchaseOrderStatus,
  SalesInvoiceStatus,
  SalesOrderStatus,
  StockMovementDirection,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface ErpReportQuery {
  from?: Date;
  to?: Date;
  warehouseId?: string;
}

interface ErpDocumentSums {
  subtotalAmount: Prisma.Decimal | null;
  taxAmount: Prisma.Decimal | null;
  totalAmount: Prisma.Decimal | null;
}

interface ErpInvoiceSums extends ErpDocumentSums {
  paidAmount: Prisma.Decimal | null;
}

export interface ErpSalesOrderGroup {
  status: SalesOrderStatus;
  currencyCode: string;
  _count: { _all: number };
  _sum: ErpDocumentSums;
}

export interface ErpSalesInvoiceGroup {
  status: SalesInvoiceStatus;
  currencyCode: string;
  _count: { _all: number };
  _sum: ErpInvoiceSums;
}

export interface ErpPurchaseOrderGroup {
  status: PurchaseOrderStatus;
  currencyCode: string;
  _count: { _all: number };
  _sum: ErpDocumentSums;
}

export interface ErpPurchaseInvoiceGroup {
  status: PurchaseInvoiceStatus;
  currencyCode: string;
  _count: { _all: number };
  _sum: ErpInvoiceSums;
}

export interface ErpStockMovementGroup {
  direction: StockMovementDirection;
  _count: { _all: number };
  _sum: { quantity: Prisma.Decimal | null };
}

const documentSums = {
  subtotalAmount: true,
  taxAmount: true,
  totalAmount: true,
} as const;

const invoiceSums = {
  ...documentSums,
  paidAmount: true,
} as const;

@Injectable()
export class ErpReportingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async salesOrderGroups(
    workspaceId: string,
    query: ErpReportQuery,
  ): Promise<ErpSalesOrderGroup[]> {
    const groups = await this.prisma.salesOrder.groupBy({
      by: ["status", "currencyCode"],
      where: {
        workspaceId,
        ...this.dateWhere("orderDate", query),
      },
      _count: { _all: true },
      _sum: documentSums,
      orderBy: [{ status: "asc" }, { currencyCode: "asc" }],
    });
    return groups as ErpSalesOrderGroup[];
  }

  async salesInvoiceGroups(
    workspaceId: string,
    query: ErpReportQuery,
  ): Promise<ErpSalesInvoiceGroup[]> {
    const groups = await this.prisma.salesInvoice.groupBy({
      by: ["status", "currencyCode"],
      where: {
        workspaceId,
        ...this.dateWhere("issueDate", query),
      },
      _count: { _all: true },
      _sum: invoiceSums,
      orderBy: [{ status: "asc" }, { currencyCode: "asc" }],
    });
    return groups as ErpSalesInvoiceGroup[];
  }

  async purchaseOrderGroups(
    workspaceId: string,
    query: ErpReportQuery,
  ): Promise<ErpPurchaseOrderGroup[]> {
    const groups = await this.prisma.purchaseOrder.groupBy({
      by: ["status", "currencyCode"],
      where: {
        workspaceId,
        ...this.dateWhere("orderDate", query),
      },
      _count: { _all: true },
      _sum: documentSums,
      orderBy: [{ status: "asc" }, { currencyCode: "asc" }],
    });
    return groups as ErpPurchaseOrderGroup[];
  }

  async purchaseInvoiceGroups(
    workspaceId: string,
    query: ErpReportQuery,
  ): Promise<ErpPurchaseInvoiceGroup[]> {
    const groups = await this.prisma.purchaseInvoice.groupBy({
      by: ["status", "currencyCode"],
      where: {
        workspaceId,
        ...this.dateWhere("invoiceDate", query),
      },
      _count: { _all: true },
      _sum: invoiceSums,
      orderBy: [{ status: "asc" }, { currencyCode: "asc" }],
    });
    return groups as ErpPurchaseInvoiceGroup[];
  }

  async stockMovementGroups(
    workspaceId: string,
    query: ErpReportQuery,
  ): Promise<ErpStockMovementGroup[]> {
    const groups = await this.prisma.stockMovement.groupBy({
      by: ["direction"],
      where: {
        workspaceId,
        ...(query.warehouseId === undefined
          ? {}
          : { inventoryItem: { warehouseId: query.warehouseId } }),
        ...this.dateWhere("occurredAt", query),
      },
      _count: { _all: true },
      _sum: { quantity: true },
      orderBy: [{ direction: "asc" }],
    });
    return groups as ErpStockMovementGroup[];
  }

  private dateWhere(
    field: "orderDate" | "issueDate" | "invoiceDate" | "occurredAt",
    query: ErpReportQuery,
  ): Record<string, Prisma.DateTimeFilter> {
    if (query.from === undefined && query.to === undefined) {
      return {};
    }
    return {
      [field]: {
        ...(query.from === undefined ? {} : { gte: query.from }),
        ...(query.to === undefined ? {} : { lte: query.to }),
      },
    };
  }
}
