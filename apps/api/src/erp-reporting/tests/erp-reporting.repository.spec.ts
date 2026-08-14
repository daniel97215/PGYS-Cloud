import { PrismaService } from "../../prisma/prisma.service";
import { ErpReportingRepository } from "../erp-reporting.repository";

describe("ErpReportingRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const warehouseId = "20000000-0000-4000-8000-000000000001";
  const from = new Date("2026-08-01T00:00:00.000Z");
  const to = new Date("2026-08-31T23:59:59.000Z");

  it.each([
    ["salesOrderGroups", "salesOrderGroupBy", "orderDate"],
    ["salesInvoiceGroups", "salesInvoiceGroupBy", "issueDate"],
    ["purchaseOrderGroups", "purchaseOrderGroupBy", "orderDate"],
    ["purchaseInvoiceGroups", "purchaseInvoiceGroupBy", "invoiceDate"],
  ] as const)(
    "groups %s by status and currency with its business date",
    async (method, prismaMethod, dateField) => {
      const groupBy = jest.fn().mockResolvedValue([]);
      const repository = new ErpReportingRepository(
        mockPrisma({ [prismaMethod]: groupBy }),
      );

      await repository[method](workspaceId, { from, to });

      expect(groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          by: ["status", "currencyCode"],
          where: {
            workspaceId,
            [dateField]: { gte: from, lte: to },
          },
          _count: { _all: true },
        }),
      );
    },
  );

  it("groups stock movements by direction and warehouse", async () => {
    const groupBy = jest.fn().mockResolvedValue([]);
    const repository = new ErpReportingRepository(
      mockPrisma({ stockMovementGroupBy: groupBy }),
    );

    await repository.stockMovementGroups(workspaceId, {
      warehouseId,
      from,
      to,
    });

    expect(groupBy).toHaveBeenCalledWith({
      by: ["direction"],
      where: {
        workspaceId,
        inventoryItem: { warehouseId },
        occurredAt: { gte: from, lte: to },
      },
      _count: { _all: true },
      _sum: { quantity: true },
      orderBy: [{ direction: "asc" }],
    });
  });
});

function mockPrisma(methods: Record<string, jest.Mock>): PrismaService {
  return {
    salesOrder: { groupBy: methods.salesOrderGroupBy ?? jest.fn() },
    salesInvoice: { groupBy: methods.salesInvoiceGroupBy ?? jest.fn() },
    purchaseOrder: { groupBy: methods.purchaseOrderGroupBy ?? jest.fn() },
    purchaseInvoice: {
      groupBy: methods.purchaseInvoiceGroupBy ?? jest.fn(),
    },
    stockMovement: { groupBy: methods.stockMovementGroupBy ?? jest.fn() },
  } as unknown as PrismaService;
}
