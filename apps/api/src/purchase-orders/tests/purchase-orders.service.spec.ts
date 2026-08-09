import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Prisma, PurchaseOrderStatus } from "@prisma/client";
import { PurchaseOrdersRepository } from "../purchase-orders.repository";
import { PurchaseOrdersService } from "../purchase-orders.service";

describe("PurchaseOrdersService", () => {
  let repository: jest.Mocked<PurchaseOrdersRepository>;
  let service: PurchaseOrdersService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const orderId = "20000000-0000-4000-8000-000000000001";
  const supplierId = "30000000-0000-4000-8000-000000000001";
  const warehouseId = "40000000-0000-4000-8000-000000000001";
  const productId = "50000000-0000-4000-8000-000000000001";
  const variantId = "60000000-0000-4000-8000-000000000001";

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(order()),
      update: jest.fn().mockResolvedValue(order()),
      findById: jest.fn().mockResolvedValue(order()),
      findByWorkspace: jest.fn().mockResolvedValue([]),
      addLine: jest.fn().mockResolvedValue(order()),
      updateLine: jest.fn().mockResolvedValue(order()),
      removeLine: jest.fn().mockResolvedValue(order()),
      transitionStatus: jest.fn().mockImplementation(
        (
          _workspaceId: string,
          _id: string,
          _from: PurchaseOrderStatus[],
          to: PurchaseOrderStatus,
        ) => Promise.resolve(order(to, [line()])),
      ),
      findSupplier: jest.fn().mockResolvedValue(supplier()),
      findWarehouse: jest.fn().mockResolvedValue({ id: warehouseId }),
      findProduct: jest.fn().mockResolvedValue({ id: productId }),
      findProductVariant: jest.fn().mockResolvedValue({
        id: variantId,
        productId,
      }),
    } as unknown as jest.Mocked<PurchaseOrdersRepository>;
    service = new PurchaseOrdersService(repository);
  });

  it("creates a normalized draft order with workspace references", async () => {
    await service.create(workspaceId, {
      number: " po-001 ",
      supplierId,
      warehouseId,
      orderDate: "2026-08-09T00:00:00.000Z",
      expectedDate: "2026-08-15T00:00:00.000Z",
      currencyCode: " eur ",
      supplierReference: "SUP-42",
    });

    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      number: "PO-001",
      supplierId,
      warehouseId,
      orderDate: new Date("2026-08-09T00:00:00.000Z"),
      expectedDate: new Date("2026-08-15T00:00:00.000Z"),
      currencyCode: "EUR",
      supplierReference: "SUP-42",
    });
  });

  it("rejects a partner without supplier type or role", async () => {
    repository.findSupplier.mockResolvedValueOnce({
      ...supplier(),
      type: "customer",
      roleAssignments: [],
    });

    await expect(
      service.create(workspaceId, createDto()),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("accepts an active supplier role on a multi-role partner", async () => {
    repository.findSupplier.mockResolvedValueOnce({
      ...supplier(),
      type: "customer",
      roleAssignments: [
        {
          id: "70000000-0000-4000-8000-000000000001",
          workspaceId,
          businessPartnerId: supplierId,
          businessPartnerRoleId: "80000000-0000-4000-8000-000000000001",
          assignedAt: new Date("2026-08-01T00:00:00.000Z"),
          assignedBy: null,
          businessPartnerRole: {
            id: "80000000-0000-4000-8000-000000000001",
            workspaceId,
            code: "SUPPLIER",
            name: "Supplier",
            description: null,
            isSystem: true,
            isActive: true,
            createdAt: new Date("2026-08-01T00:00:00.000Z"),
            updatedAt: new Date("2026-08-01T00:00:00.000Z"),
          },
        },
      ],
    });

    await service.create(workspaceId, createDto());

    expect(repository.create).toHaveBeenCalled();
  });

  it("rejects a warehouse outside the workspace", async () => {
    repository.findWarehouse.mockResolvedValueOnce(null);

    await expect(
      service.create(workspaceId, createDto()),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("rejects an expected date before the order date", async () => {
    await expect(
      service.create(workspaceId, {
        ...createDto(),
        expectedDate: "2026-08-08T00:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("calculates line totals on the server", async () => {
    await service.addLine(workspaceId, orderId, lineDto());

    const data = repository.addLine.mock.calls[0][0];
    expect(data.subtotalAmount.toString()).toBe("25");
    expect(data.taxAmount.toString()).toBe("5");
    expect(data.totalAmount.toString()).toBe("30");
  });

  it("rejects a variant that does not belong to the product", async () => {
    repository.findProductVariant.mockResolvedValueOnce({
      id: variantId,
      productId: "50000000-0000-4000-8000-000000000099",
    } as never);

    await expect(
      service.addLine(workspaceId, orderId, lineDto()),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.addLine).not.toHaveBeenCalled();
  });

  it("keeps sent purchase orders immutable", async () => {
    repository.findById.mockResolvedValueOnce(order(PurchaseOrderStatus.SENT));

    await expect(
      service.update(workspaceId, orderId, { notes: "Changed" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("refuses to send an order without lines", async () => {
    await expect(service.send(workspaceId, orderId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.transitionStatus).not.toHaveBeenCalled();
  });

  it("sends a draft order with lines", async () => {
    repository.findById.mockResolvedValue(order(undefined, [line()]));

    const result = await service.send(workspaceId, orderId);

    expect(result.status).toBe(PurchaseOrderStatus.SENT);
    expect(repository.transitionStatus).toHaveBeenCalledWith(
      workspaceId,
      orderId,
      [PurchaseOrderStatus.DRAFT],
      PurchaseOrderStatus.SENT,
      true,
    );
  });

  it("confirms only a sent order", async () => {
    repository.findById.mockResolvedValue(
      order(PurchaseOrderStatus.SENT, [line()]),
    );

    const result = await service.confirm(workspaceId, orderId);

    expect(result.status).toBe(PurchaseOrderStatus.CONFIRMED);
    expect(repository.transitionStatus).toHaveBeenCalledWith(
      workspaceId,
      orderId,
      [PurchaseOrderStatus.SENT],
      PurchaseOrderStatus.CONFIRMED,
      true,
    );
  });

  it("allows cancellation only from draft or sent", async () => {
    await service.cancel(workspaceId, orderId);

    expect(repository.transitionStatus).toHaveBeenCalledWith(
      workspaceId,
      orderId,
      [PurchaseOrderStatus.DRAFT, PurchaseOrderStatus.SENT],
      PurchaseOrderStatus.CANCELLED,
      false,
    );
  });

  it("preserves workspace isolation when loading an order", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(service.get(workspaceId, orderId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  function createDto() {
    return {
      number: "PO-001",
      supplierId,
      warehouseId,
      orderDate: "2026-08-09T00:00:00.000Z",
      currencyCode: "EUR",
    };
  }

  function lineDto() {
    return {
      productId,
      productVariantId: variantId,
      description: "Components",
      quantity: 2.5,
      unitCost: 10,
      taxRate: 20,
    };
  }

  function line() {
    return {
      id: "90000000-0000-4000-8000-000000000001",
      workspaceId,
      purchaseOrderId: orderId,
      productId,
      productVariantId: variantId,
      description: "Components",
      quantity: new Prisma.Decimal(2.5),
      unitCost: new Prisma.Decimal(10),
      taxRate: new Prisma.Decimal(20),
      subtotalAmount: new Prisma.Decimal(25),
      taxAmount: new Prisma.Decimal(5),
      totalAmount: new Prisma.Decimal(30),
      sortOrder: 0,
      createdAt: new Date("2026-08-09T00:00:00.000Z"),
      updatedAt: new Date("2026-08-09T00:00:00.000Z"),
    };
  }

  function order(
    status: PurchaseOrderStatus = PurchaseOrderStatus.DRAFT,
    lines: ReturnType<typeof line>[] = [],
  ) {
    return {
      id: orderId,
      workspaceId,
      number: "PO-001",
      supplierId,
      warehouseId,
      status,
      orderDate: new Date("2026-08-09T00:00:00.000Z"),
      expectedDate: null,
      currencyCode: "EUR",
      supplierReference: null,
      notes: null,
      subtotalAmount: new Prisma.Decimal(0),
      taxAmount: new Prisma.Decimal(0),
      totalAmount: new Prisma.Decimal(0),
      sentAt:
        status === PurchaseOrderStatus.SENT
          ? new Date("2026-08-09T01:00:00.000Z")
          : null,
      confirmedAt:
        status === PurchaseOrderStatus.CONFIRMED
          ? new Date("2026-08-09T02:00:00.000Z")
          : null,
      cancelledAt:
        status === PurchaseOrderStatus.CANCELLED
          ? new Date("2026-08-09T03:00:00.000Z")
          : null,
      createdAt: new Date("2026-08-09T00:00:00.000Z"),
      updatedAt: new Date("2026-08-09T00:00:00.000Z"),
      lines,
    };
  }

  function supplier() {
    return {
      id: supplierId,
      workspaceId,
      code: "SUP-001",
      type: "supplier",
      name: "Supplier",
      legalName: null,
      status: "active",
      notes: null,
      createdAt: new Date("2026-08-01T00:00:00.000Z"),
      updatedAt: new Date("2026-08-01T00:00:00.000Z"),
      roleAssignments: [],
    };
  }
});
