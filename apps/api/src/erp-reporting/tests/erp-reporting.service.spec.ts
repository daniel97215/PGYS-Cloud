import { BadRequestException } from "@nestjs/common";
import {
  Prisma,
  PurchaseInvoiceStatus,
  PurchaseOrderStatus,
  SalesInvoiceStatus,
  SalesOrderStatus,
  StockMovementDirection,
} from "@prisma/client";
import { ErpReportingRepository } from "../erp-reporting.repository";
import { ErpReportingService } from "../erp-reporting.service";

describe("ErpReportingService", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  let repository: jest.Mocked<ErpReportingRepository>;
  let service: ErpReportingService;

  beforeEach(() => {
    const documentSums = {
      subtotalAmount: new Prisma.Decimal("100"),
      taxAmount: new Prisma.Decimal("20"),
      totalAmount: new Prisma.Decimal("120"),
    };
    repository = {
      salesOrderGroups: jest.fn().mockResolvedValue([
        {
          status: SalesOrderStatus.CONFIRMED,
          currencyCode: "EUR",
          _count: { _all: 2 },
          _sum: documentSums,
        },
      ]),
      salesInvoiceGroups: jest.fn().mockResolvedValue([
        {
          status: SalesInvoiceStatus.ISSUED,
          currencyCode: "EUR",
          _count: { _all: 1 },
          _sum: {
            ...documentSums,
            paidAmount: new Prisma.Decimal("40"),
          },
        },
      ]),
      purchaseOrderGroups: jest.fn().mockResolvedValue([
        {
          status: PurchaseOrderStatus.CONFIRMED,
          currencyCode: "EUR",
          _count: { _all: 2 },
          _sum: documentSums,
        },
      ]),
      purchaseInvoiceGroups: jest.fn().mockResolvedValue([
        {
          status: PurchaseInvoiceStatus.CONFIRMED,
          currencyCode: "EUR",
          _count: { _all: 1 },
          _sum: {
            ...documentSums,
            paidAmount: new Prisma.Decimal("60"),
          },
        },
      ]),
      stockMovementGroups: jest.fn().mockResolvedValue([
        {
          direction: StockMovementDirection.IN,
          _count: { _all: 3 },
          _sum: { quantity: new Prisma.Decimal("42.5") },
        },
      ]),
    } as unknown as jest.Mocked<ErpReportingRepository>;
    service = new ErpReportingService(repository);
  });

  it("serializes Sales order amounts without mixing currencies", async () => {
    const result = await service.salesOrders(workspaceId, {});

    expect(result.groups).toEqual([
      {
        status: SalesOrderStatus.CONFIRMED,
        currency: "EUR",
        count: 2,
        subtotalAmount: "100.0000",
        taxAmount: "20.0000",
        totalAmount: "120.0000",
      },
    ]);
  });

  it("includes paid amounts for Sales and Purchase invoices", async () => {
    const sales = await service.salesInvoices(workspaceId, {});
    const purchasing = await service.purchaseInvoices(workspaceId, {});

    expect(sales.groups[0].paidAmount).toBe("40.0000");
    expect(purchasing.groups[0].paidAmount).toBe("60.0000");
  });

  it("returns Purchase order totals", async () => {
    const result = await service.purchaseOrders(workspaceId, {});
    expect(result.groups[0]).toEqual(
      expect.objectContaining({
        status: PurchaseOrderStatus.CONFIRMED,
        currency: "EUR",
        totalAmount: "120.0000",
      }),
    );
  });

  it("returns stock movement quantities and forwards the warehouse", async () => {
    const warehouseId = "20000000-0000-4000-8000-000000000001";
    const result = await service.stockMovements(workspaceId, { warehouseId });

    expect(result.groups).toEqual([
      {
        direction: StockMovementDirection.IN,
        count: 3,
        quantity: "42.5000",
      },
    ]);
    expect(repository.stockMovementGroups).toHaveBeenCalledWith(workspaceId, {
      warehouseId,
    });
  });

  it("rejects an inverted period before reading", async () => {
    await expect(
      service.salesOrders(workspaceId, {
        from: "2026-08-31T00:00:00.000Z",
        to: "2026-08-01T00:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.salesOrderGroups).not.toHaveBeenCalled();
  });
});
