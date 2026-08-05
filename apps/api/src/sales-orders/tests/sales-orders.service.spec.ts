import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, SalesOrderStatus } from "@prisma/client";
import {
  SalesOrderQuoteAlreadyConvertedError,
  SalesOrderQuoteNotAcceptedError,
  SalesOrdersRepository,
} from "../sales-orders.repository";
import { SalesOrdersService } from "../sales-orders.service";

describe("SalesOrdersService", () => {
  let repository: jest.Mocked<SalesOrdersRepository>;
  let service: SalesOrdersService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const orderId = "20000000-0000-4000-8000-000000000001";
  const quoteId = "30000000-0000-4000-8000-000000000001";
  const partnerId = "40000000-0000-4000-8000-000000000001";
  const productId = "50000000-0000-4000-8000-000000000001";
  const variantId = "60000000-0000-4000-8000-000000000001";

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(createOrder()),
      createFromQuote: jest.fn().mockResolvedValue(createOrder()),
      update: jest.fn().mockResolvedValue(createOrder()),
      findById: jest.fn().mockResolvedValue(createOrder()),
      findByWorkspace: jest.fn().mockResolvedValue([]),
      addLine: jest.fn().mockResolvedValue(createOrder()),
      updateLine: jest.fn().mockResolvedValue(createOrder()),
      removeLine: jest.fn().mockResolvedValue(createOrder()),
      transitionStatus: jest
        .fn()
        .mockResolvedValue(createOrder(SalesOrderStatus.CONFIRMED)),
      findBusinessPartner: jest.fn().mockResolvedValue({ id: partnerId }),
      findProduct: jest.fn().mockResolvedValue({ id: productId }),
      findProductVariant: jest.fn().mockResolvedValue({
        id: variantId,
        productId,
      }),
    } as unknown as jest.Mocked<SalesOrdersRepository>;
    service = new SalesOrdersService(repository);
  });

  it("creates a normalized draft order", async () => {
    await service.create(workspaceId, {
      number: " so-001 ",
      businessPartnerId: partnerId,
      orderDate: "2026-08-05T00:00:00.000Z",
      currencyCode: " eur ",
    });

    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      number: "SO-001",
      businessPartnerId: partnerId,
      orderDate: new Date("2026-08-05T00:00:00.000Z"),
      currencyCode: "EUR",
    });
  });

  it("converts a quote using only order-specific input", async () => {
    await service.createFromQuote(workspaceId, quoteId, {
      number: " so-quote-1 ",
      orderDate: "2026-08-05T00:00:00.000Z",
    });

    expect(repository.createFromQuote).toHaveBeenCalledWith(
      workspaceId,
      quoteId,
      {
        number: "SO-QUOTE-1",
        orderDate: new Date("2026-08-05T00:00:00.000Z"),
      },
    );
  });

  it("maps a non-accepted quote conversion to a business error", async () => {
    repository.createFromQuote.mockRejectedValueOnce(
      new SalesOrderQuoteNotAcceptedError(),
    );

    await expect(
      service.createFromQuote(workspaceId, quoteId, {
        number: "SO-001",
        orderDate: "2026-08-05T00:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("maps duplicate quote conversion to a conflict", async () => {
    repository.createFromQuote.mockRejectedValueOnce(
      new SalesOrderQuoteAlreadyConvertedError(),
    );

    await expect(
      service.createFromQuote(workspaceId, quoteId, {
        number: "SO-001",
        orderDate: "2026-08-05T00:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("calculates line amounts server-side", async () => {
    await service.addLine(workspaceId, orderId, {
      productId,
      productVariantId: variantId,
      description: "Service",
      quantity: 2.5,
      unitPrice: 10,
      taxRate: 20,
    });

    const data = repository.addLine.mock.calls[0][0];
    expect(data.subtotalAmount.toString()).toBe("25");
    expect(data.taxAmount.toString()).toBe("5");
    expect(data.totalAmount.toString()).toBe("30");
  });

  it("keeps confirmed orders immutable", async () => {
    repository.findById.mockResolvedValueOnce(
      createOrder(SalesOrderStatus.CONFIRMED),
    );

    await expect(
      service.update(workspaceId, orderId, { notes: "Changed" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("refuses to confirm an order without lines", async () => {
    await expect(service.confirm(workspaceId, orderId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.transitionStatus).not.toHaveBeenCalled();
  });

  it("confirms a draft order with lines", async () => {
    repository.findById.mockResolvedValue(
      createOrder(SalesOrderStatus.DRAFT, [createLine()]),
    );

    await service.confirm(workspaceId, orderId);

    expect(repository.transitionStatus).toHaveBeenCalledWith(
      workspaceId,
      orderId,
      [SalesOrderStatus.DRAFT],
      SalesOrderStatus.CONFIRMED,
      true,
    );
  });

  it("starts, completes and cancels only from allowed statuses", async () => {
    repository.transitionStatus
      .mockResolvedValueOnce(createOrder(SalesOrderStatus.PROCESSING))
      .mockResolvedValueOnce(createOrder(SalesOrderStatus.COMPLETED))
      .mockResolvedValueOnce(createOrder(SalesOrderStatus.CANCELLED));

    await service.start(workspaceId, orderId);
    await service.complete(workspaceId, orderId);
    await service.cancel(workspaceId, orderId);

    expect(repository.transitionStatus).toHaveBeenNthCalledWith(
      1,
      workspaceId,
      orderId,
      [SalesOrderStatus.CONFIRMED],
      SalesOrderStatus.PROCESSING,
      false,
    );
    expect(repository.transitionStatus).toHaveBeenNthCalledWith(
      2,
      workspaceId,
      orderId,
      [SalesOrderStatus.PROCESSING],
      SalesOrderStatus.COMPLETED,
      false,
    );
    expect(repository.transitionStatus).toHaveBeenNthCalledWith(
      3,
      workspaceId,
      orderId,
      [
        SalesOrderStatus.DRAFT,
        SalesOrderStatus.CONFIRMED,
        SalesOrderStatus.PROCESSING,
      ],
      SalesOrderStatus.CANCELLED,
      false,
    );
  });

  it("preserves workspace isolation when loading an order", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(service.get(workspaceId, orderId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  function createOrder(
    status: SalesOrderStatus = SalesOrderStatus.DRAFT,
    lines: ReturnType<typeof createLine>[] = [],
  ) {
    return {
      id: orderId,
      workspaceId,
      number: "SO-001",
      businessPartnerId: partnerId,
      salesQuoteId: null,
      status,
      orderDate: new Date("2026-08-05T00:00:00.000Z"),
      requestedDate: null,
      currencyCode: "EUR",
      notes: null,
      subtotalAmount: new Prisma.Decimal(0),
      taxAmount: new Prisma.Decimal(0),
      totalAmount: new Prisma.Decimal(0),
      confirmedAt:
        status === SalesOrderStatus.CONFIRMED
          ? new Date("2026-08-05T01:00:00.000Z")
          : null,
      completedAt:
        status === SalesOrderStatus.COMPLETED
          ? new Date("2026-08-05T02:00:00.000Z")
          : null,
      createdAt: new Date("2026-08-05T00:00:00.000Z"),
      updatedAt: new Date("2026-08-05T00:00:00.000Z"),
      lines,
    };
  }

  function createLine() {
    return {
      id: "70000000-0000-4000-8000-000000000001",
      workspaceId,
      salesOrderId: orderId,
      productId,
      productVariantId: null,
      description: "Service",
      quantity: new Prisma.Decimal(1),
      unitPrice: new Prisma.Decimal(10),
      taxRate: new Prisma.Decimal(20),
      subtotalAmount: new Prisma.Decimal(10),
      taxAmount: new Prisma.Decimal(2),
      totalAmount: new Prisma.Decimal(12),
      sortOrder: 0,
      createdAt: new Date("2026-08-05T00:00:00.000Z"),
      updatedAt: new Date("2026-08-05T00:00:00.000Z"),
    };
  }
});
