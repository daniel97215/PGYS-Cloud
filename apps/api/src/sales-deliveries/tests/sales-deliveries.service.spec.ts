import {
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, SalesDeliveryStatus } from "@prisma/client";
import {
  SalesDeliveryLineReferenceError,
  SalesDeliveryOverQuantityError,
  SalesDeliveryStockRejectedError,
  SalesDeliveriesRepository,
} from "../sales-deliveries.repository";
import { SalesDeliveriesService } from "../sales-deliveries.service";

describe("SalesDeliveriesService", () => {
  let repository: jest.Mocked<SalesDeliveriesRepository>;
  let service: SalesDeliveriesService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const deliveryId = "20000000-0000-4000-8000-000000000001";
  const orderId = "30000000-0000-4000-8000-000000000001";
  const orderLineId = "40000000-0000-4000-8000-000000000001";
  const inventoryItemId = "50000000-0000-4000-8000-000000000001";
  const line = createLine();

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(createDelivery()),
      findById: jest.fn().mockResolvedValue(createDelivery()),
      findByWorkspace: jest.fn().mockResolvedValue([]),
      addLine: jest.fn().mockResolvedValue(createDelivery(undefined, [line])),
      removeLine: jest.fn().mockResolvedValue(createDelivery()),
      ready: jest
        .fn()
        .mockResolvedValue(createDelivery(SalesDeliveryStatus.READY, [line])),
      ship: jest
        .fn()
        .mockResolvedValue(createDelivery(SalesDeliveryStatus.SHIPPED, [line])),
      deliver: jest
        .fn()
        .mockResolvedValue(
          createDelivery(SalesDeliveryStatus.DELIVERED, [line]),
        ),
      cancel: jest
        .fn()
        .mockResolvedValue(createDelivery(SalesDeliveryStatus.CANCELLED)),
    } as unknown as jest.Mocked<SalesDeliveriesRepository>;
    service = new SalesDeliveriesService(repository);
  });

  it("creates a normalized delivery in the workspace", async () => {
    await service.create(workspaceId, {
      number: " del-001 ",
      salesOrderId: orderId,
      notes: "Handle with care",
    });

    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      number: "DEL-001",
      salesOrderId: orderId,
      notes: "Handle with care",
    });
  });

  it("adds a strictly positive partial quantity", async () => {
    await service.addLine(workspaceId, deliveryId, {
      salesOrderLineId: orderLineId,
      inventoryItemId,
      quantity: 2.5,
    });

    const data = repository.addLine.mock.calls[0][0];
    expect(data.workspaceId).toBe(workspaceId);
    expect(data.quantity.toString()).toBe("2.5");
  });

  it("maps over-delivery to a business error", async () => {
    repository.addLine.mockRejectedValueOnce(
      new SalesDeliveryOverQuantityError(),
    );

    await expect(
      service.addLine(workspaceId, deliveryId, {
        salesOrderLineId: orderLineId,
        inventoryItemId,
        quantity: 11,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects inconsistent order-line and inventory references", async () => {
    repository.addLine.mockRejectedValueOnce(
      new SalesDeliveryLineReferenceError(),
    );

    await expect(
      service.addLine(workspaceId, deliveryId, {
        salesOrderLineId: orderLineId,
        inventoryItemId,
        quantity: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("keeps shipped deliveries immutable", async () => {
    repository.findById.mockResolvedValueOnce(
      createDelivery(SalesDeliveryStatus.SHIPPED, [line]),
    );

    await expect(
      service.addLine(workspaceId, deliveryId, {
        salesOrderLineId: orderLineId,
        inventoryItemId,
        quantity: 1,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.addLine).not.toHaveBeenCalled();
  });

  it("refuses to ready a delivery without lines", async () => {
    await expect(service.ready(workspaceId, deliveryId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.ready).not.toHaveBeenCalled();
  });

  it("moves a draft delivery with lines to ready", async () => {
    repository.findById.mockResolvedValueOnce(createDelivery(undefined, [line]));

    const result = await service.ready(workspaceId, deliveryId);

    expect(result.status).toBe(SalesDeliveryStatus.READY);
    expect(repository.ready).toHaveBeenCalledWith(workspaceId, deliveryId);
  });

  it("ships only a ready delivery", async () => {
    repository.findById.mockResolvedValueOnce(
      createDelivery(SalesDeliveryStatus.READY, [line]),
    );

    const result = await service.ship(workspaceId, deliveryId);

    expect(result.status).toBe(SalesDeliveryStatus.SHIPPED);
  });

  it("maps reserved or insufficient stock rejection", async () => {
    repository.findById.mockResolvedValueOnce(
      createDelivery(SalesDeliveryStatus.READY, [line]),
    );
    repository.ship.mockRejectedValueOnce(
      new SalesDeliveryStockRejectedError(),
    );

    await expect(service.ship(workspaceId, deliveryId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("delivers a shipped delivery and forbids cancelling it", async () => {
    repository.findById.mockResolvedValueOnce(
      createDelivery(SalesDeliveryStatus.SHIPPED, [line]),
    );
    const delivered = await service.deliver(workspaceId, deliveryId);
    expect(delivered.status).toBe(SalesDeliveryStatus.DELIVERED);

    repository.findById.mockResolvedValueOnce(
      createDelivery(SalesDeliveryStatus.SHIPPED, [line]),
    );
    await expect(service.cancel(workspaceId, deliveryId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("preserves workspace isolation when loading a delivery", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(service.get(workspaceId, deliveryId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  function createDelivery(
    status: SalesDeliveryStatus = SalesDeliveryStatus.DRAFT,
    lines: ReturnType<typeof createLine>[] = [],
  ) {
    return {
      id: deliveryId,
      workspaceId,
      number: "DEL-001",
      salesOrderId: orderId,
      status,
      deliveryAddress: null,
      notes: null,
      shippedAt:
        status === SalesDeliveryStatus.SHIPPED
          ? new Date("2026-08-05T01:00:00.000Z")
          : null,
      deliveredAt:
        status === SalesDeliveryStatus.DELIVERED
          ? new Date("2026-08-05T02:00:00.000Z")
          : null,
      createdAt: new Date("2026-08-05T00:00:00.000Z"),
      updatedAt: new Date("2026-08-05T00:00:00.000Z"),
      lines,
    };
  }

  function createLine() {
    return {
      id: "60000000-0000-4000-8000-000000000001",
      workspaceId,
      salesDeliveryId: deliveryId,
      salesOrderLineId: orderLineId,
      inventoryItemId,
      quantity: new Prisma.Decimal(2),
      createdAt: new Date("2026-08-05T00:00:00.000Z"),
      updatedAt: new Date("2026-08-05T00:00:00.000Z"),
    };
  }
});
