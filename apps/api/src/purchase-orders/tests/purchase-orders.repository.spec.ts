import { Prisma, PurchaseOrderStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  PurchaseOrderLineNotFoundError,
  PurchaseOrderStateConflictError,
  PurchaseOrdersRepository,
} from "../purchase-orders.repository";

describe("PurchaseOrdersRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const orderId = "20000000-0000-4000-8000-000000000001";
  const lineId = "30000000-0000-4000-8000-000000000001";
  const supplierId = "40000000-0000-4000-8000-000000000001";

  it("updates only a draft order in its workspace", async () => {
    const updateManyAndReturn = jest.fn().mockResolvedValue([{ id: orderId }]);
    const transaction = transactionMock({
      purchaseOrder: {
        updateManyAndReturn,
        findUniqueOrThrow: jest.fn().mockResolvedValue(order()),
      },
    });
    const repository = new PurchaseOrdersRepository(
      createPrismaMock(transaction),
    );

    await repository.update(workspaceId, orderId, { notes: "Updated" });

    expect(updateManyAndReturn).toHaveBeenCalledWith({
      where: { id: orderId, workspaceId, status: PurchaseOrderStatus.DRAFT },
      data: { notes: "Updated" },
      select: { id: true },
    });
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });

  it("rejects a concurrent update outside draft status", async () => {
    const transaction = transactionMock({
      purchaseOrder: { updateManyAndReturn: jest.fn().mockResolvedValue([]) },
    });
    const repository = new PurchaseOrdersRepository(
      createPrismaMock(transaction),
    );

    await expect(
      repository.update(workspaceId, orderId, { notes: "Updated" }),
    ).rejects.toBeInstanceOf(PurchaseOrderStateConflictError);
  });

  it("adds a line and recalculates order totals atomically", async () => {
    const createLine = jest.fn();
    const updateOrder = jest.fn();
    const transaction = transactionMock({
      purchaseOrder: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: updateOrder,
        findUniqueOrThrow: jest.fn().mockResolvedValue(order()),
      },
      purchaseOrderLine: {
        create: createLine,
        findMany: jest.fn().mockResolvedValue([
          amounts(20, 4, 24),
          amounts(10, 2, 12),
        ]),
      },
    });
    const repository = new PurchaseOrdersRepository(
      createPrismaMock(transaction),
    );
    const data = lineData();

    await repository.addLine(data);

    expect(createLine).toHaveBeenCalledWith({ data });
    expect(updateOrder).toHaveBeenCalledWith({
      where: { id: orderId, workspaceId },
      data: {
        subtotalAmount: new Prisma.Decimal(30),
        taxAmount: new Prisma.Decimal(6),
        totalAmount: new Prisma.Decimal(36),
      },
    });
  });

  it("rejects removal of a line outside the order workspace", async () => {
    const transaction = transactionMock({
      purchaseOrder: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      purchaseOrderLine: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    });
    const repository = new PurchaseOrdersRepository(
      createPrismaMock(transaction),
    );

    await expect(
      repository.removeLine(workspaceId, orderId, lineId),
    ).rejects.toBeInstanceOf(PurchaseOrderLineNotFoundError);
  });

  it("sends only an order with lines and records sentAt", async () => {
    const transition = jest.fn().mockResolvedValue([{ id: orderId }]);
    const transaction = transactionMock({
      purchaseOrder: {
        updateManyAndReturn: transition,
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValue(order(PurchaseOrderStatus.SENT)),
      },
    });
    const repository = new PurchaseOrdersRepository(
      createPrismaMock(transaction),
    );

    await repository.transitionStatus(
      workspaceId,
      orderId,
      [PurchaseOrderStatus.DRAFT],
      PurchaseOrderStatus.SENT,
      true,
    );

    expect(transition).toHaveBeenCalledWith({
      where: {
        id: orderId,
        workspaceId,
        status: { in: [PurchaseOrderStatus.DRAFT] },
        lines: { some: {} },
      },
      data: {
        status: PurchaseOrderStatus.SENT,
        sentAt: expect.any(Date),
      },
      select: { id: true },
    });
  });

  it("filters supplier roles by workspace, code and active status", async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const repository = new PurchaseOrdersRepository({
      businessPartner: { findFirst },
    } as unknown as PrismaService);

    await repository.findSupplier(workspaceId, supplierId);

    expect(findFirst).toHaveBeenCalledWith({
      where: { id: supplierId, workspaceId },
      include: {
        roleAssignments: {
          where: {
            workspaceId,
            businessPartnerRole: {
              workspaceId,
              code: "SUPPLIER",
              isActive: true,
            },
          },
          include: { businessPartnerRole: true },
        },
      },
    });
  });

  function amounts(subtotal: number, tax: number, total: number) {
    return {
      subtotalAmount: new Prisma.Decimal(subtotal),
      taxAmount: new Prisma.Decimal(tax),
      totalAmount: new Prisma.Decimal(total),
    };
  }

  function lineData() {
    return {
      workspaceId,
      purchaseOrderId: orderId,
      productId: "50000000-0000-4000-8000-000000000001",
      description: "Components",
      quantity: new Prisma.Decimal(2),
      unitCost: new Prisma.Decimal(10),
      taxRate: new Prisma.Decimal(20),
      ...amounts(20, 4, 24),
      sortOrder: 0,
    };
  }

  function order(status: PurchaseOrderStatus = PurchaseOrderStatus.DRAFT) {
    return {
      id: orderId,
      workspaceId,
      number: "PO-001",
      supplierId,
      warehouseId: "60000000-0000-4000-8000-000000000001",
      status,
      orderDate: new Date("2026-08-09T00:00:00.000Z"),
      expectedDate: null,
      currencyCode: "EUR",
      supplierReference: null,
      notes: null,
      subtotalAmount: new Prisma.Decimal(0),
      taxAmount: new Prisma.Decimal(0),
      totalAmount: new Prisma.Decimal(0),
      sentAt: null,
      confirmedAt: null,
      cancelledAt: null,
      createdAt: new Date("2026-08-09T00:00:00.000Z"),
      updatedAt: new Date("2026-08-09T00:00:00.000Z"),
      lines: [],
    };
  }
});

function transactionMock(client: Record<string, unknown>): jest.Mock {
  return jest.fn(async (callback: (value: unknown) => unknown) =>
    callback(client),
  );
}

function createPrismaMock(transaction: jest.Mock): PrismaService {
  return { $transaction: transaction } as unknown as PrismaService;
}
