import {
  Prisma,
  SalesOrderStatus,
  SalesQuoteStatus,
} from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  SalesOrderQuoteAlreadyConvertedError,
  SalesOrderQuoteNotAcceptedError,
  SalesOrdersRepository,
} from "../sales-orders.repository";

describe("SalesOrdersRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const orderId = "20000000-0000-4000-8000-000000000001";
  const quoteId = "30000000-0000-4000-8000-000000000001";
  const productId = "40000000-0000-4000-8000-000000000001";

  it("converts an accepted quote atomically and recalculates copied amounts", async () => {
    const quote = createQuote(SalesQuoteStatus.ACCEPTED);
    const findQuote = jest.fn().mockResolvedValue(quote);
    const findOrder = jest.fn().mockResolvedValue(null);
    const createOrderRecord = jest.fn().mockResolvedValue(createOrder());
    const transaction = transactionMock({
      salesQuote: { findFirst: findQuote },
      salesOrder: { findFirst: findOrder, create: createOrderRecord },
    });
    const repository = new SalesOrdersRepository(
      createPrismaMock({ transaction }),
    );

    await repository.createFromQuote(workspaceId, quoteId, {
      number: "SO-001",
      orderDate: new Date("2026-08-05T00:00:00.000Z"),
    });

    const data = createOrderRecord.mock.calls[0][0].data;
    expect(data.workspaceId).toBe(workspaceId);
    expect(data.businessPartnerId).toBe(quote.businessPartnerId);
    expect(data.salesQuoteId).toBe(quoteId);
    expect(data.currencyCode).toBe("EUR");
    expect(data.lines.create).toHaveLength(1);
    expect(data.lines.create[0].subtotalAmount.toString()).toBe("25");
    expect(data.lines.create[0].taxAmount.toString()).toBe("5");
    expect(data.lines.create[0].totalAmount.toString()).toBe("30");
    expect(data.subtotalAmount.toString()).toBe("25");
    expect(data.taxAmount.toString()).toBe("5");
    expect(data.totalAmount.toString()).toBe("30");
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });

  it("rejects conversion when the quote is not accepted", async () => {
    const createOrder = jest.fn();
    const transaction = transactionMock({
      salesQuote: {
        findFirst: jest
          .fn()
          .mockResolvedValue(createQuote(SalesQuoteStatus.SENT)),
      },
      salesOrder: { findFirst: jest.fn(), create: createOrder },
    });
    const repository = new SalesOrdersRepository(
      createPrismaMock({ transaction }),
    );

    await expect(
      repository.createFromQuote(workspaceId, quoteId, {
        number: "SO-001",
        orderDate: new Date("2026-08-05T00:00:00.000Z"),
      }),
    ).rejects.toBeInstanceOf(SalesOrderQuoteNotAcceptedError);
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("rejects a second conversion of the same quote", async () => {
    const create = jest.fn();
    const transaction = transactionMock({
      salesQuote: {
        findFirst: jest
          .fn()
          .mockResolvedValue(createQuote(SalesQuoteStatus.ACCEPTED)),
      },
      salesOrder: {
        findFirst: jest.fn().mockResolvedValue({ id: orderId }),
        create,
      },
    });
    const repository = new SalesOrdersRepository(
      createPrismaMock({ transaction }),
    );

    await expect(
      repository.createFromQuote(workspaceId, quoteId, {
        number: "SO-002",
        orderDate: new Date("2026-08-05T00:00:00.000Z"),
      }),
    ).rejects.toBeInstanceOf(SalesOrderQuoteAlreadyConvertedError);
    expect(create).not.toHaveBeenCalled();
  });

  it("adds a line and recalculates totals in one transaction", async () => {
    const update = jest.fn();
    const transaction = transactionMock({
      salesOrder: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update,
        findUniqueOrThrow: jest.fn().mockResolvedValue(createOrder()),
      },
      salesOrderLine: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([
          amounts(20, 4, 24),
          amounts(10, 2, 12),
        ]),
      },
    });
    const repository = new SalesOrdersRepository(
      createPrismaMock({ transaction }),
    );

    await repository.addLine(lineData());

    const totals = update.mock.calls[0][0].data;
    expect(totals.subtotalAmount.toString()).toBe("30");
    expect(totals.taxAmount.toString()).toBe("6");
    expect(totals.totalAmount.toString()).toBe("36");
  });

  it("confirms only a draft order that still has lines", async () => {
    const transition = jest.fn().mockResolvedValue([{ id: orderId }]);
    const transaction = transactionMock({
      salesOrder: {
        updateManyAndReturn: transition,
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValue(createOrder(SalesOrderStatus.CONFIRMED)),
      },
    });
    const repository = new SalesOrdersRepository(
      createPrismaMock({ transaction }),
    );

    await repository.transitionStatus(
      workspaceId,
      orderId,
      [SalesOrderStatus.DRAFT],
      SalesOrderStatus.CONFIRMED,
      true,
    );

    expect(transition).toHaveBeenCalledWith({
      where: {
        id: orderId,
        workspaceId,
        status: { in: [SalesOrderStatus.DRAFT] },
        lines: { some: {} },
      },
      data: {
        status: SalesOrderStatus.CONFIRMED,
        confirmedAt: expect.any(Date),
      },
      select: { id: true },
    });
  });

  function lineData() {
    return {
      workspaceId,
      salesOrderId: orderId,
      productId,
      description: "Consulting",
      quantity: new Prisma.Decimal(2),
      unitPrice: new Prisma.Decimal(10),
      taxRate: new Prisma.Decimal(20),
      subtotalAmount: new Prisma.Decimal(20),
      taxAmount: new Prisma.Decimal(4),
      totalAmount: new Prisma.Decimal(24),
      sortOrder: 0,
    };
  }

  function amounts(subtotal: number, tax: number, total: number) {
    return {
      subtotalAmount: new Prisma.Decimal(subtotal),
      taxAmount: new Prisma.Decimal(tax),
      totalAmount: new Prisma.Decimal(total),
    };
  }

  function createQuote(status: SalesQuoteStatus) {
    return {
      id: quoteId,
      workspaceId,
      number: "Q-001",
      businessPartnerId: "50000000-0000-4000-8000-000000000001",
      status,
      issueDate: new Date("2026-08-01T00:00:00.000Z"),
      validUntil: null,
      currencyCode: "EUR",
      notes: "Copied notes",
      subtotalAmount: new Prisma.Decimal(999),
      taxAmount: new Prisma.Decimal(999),
      totalAmount: new Prisma.Decimal(999),
      createdAt: new Date("2026-08-01T00:00:00.000Z"),
      updatedAt: new Date("2026-08-01T00:00:00.000Z"),
      lines: [
        {
          id: "60000000-0000-4000-8000-000000000001",
          workspaceId,
          salesQuoteId: quoteId,
          productId,
          productVariantId: null,
          description: "Consulting",
          quantity: new Prisma.Decimal(2.5),
          unitPrice: new Prisma.Decimal(10),
          taxRate: new Prisma.Decimal(20),
          subtotalAmount: new Prisma.Decimal(999),
          taxAmount: new Prisma.Decimal(999),
          totalAmount: new Prisma.Decimal(999),
          sortOrder: 0,
          createdAt: new Date("2026-08-01T00:00:00.000Z"),
          updatedAt: new Date("2026-08-01T00:00:00.000Z"),
        },
      ],
    };
  }

  function createOrder(
    status: SalesOrderStatus = SalesOrderStatus.DRAFT,
  ) {
    return {
      id: orderId,
      workspaceId,
      number: "SO-001",
      businessPartnerId: "50000000-0000-4000-8000-000000000001",
      salesQuoteId: quoteId,
      status,
      orderDate: new Date("2026-08-05T00:00:00.000Z"),
      requestedDate: null,
      currencyCode: "EUR",
      notes: null,
      subtotalAmount: new Prisma.Decimal(0),
      taxAmount: new Prisma.Decimal(0),
      totalAmount: new Prisma.Decimal(0),
      confirmedAt: null,
      completedAt: null,
      createdAt: new Date("2026-08-05T00:00:00.000Z"),
      updatedAt: new Date("2026-08-05T00:00:00.000Z"),
      lines: [],
    };
  }
});

function transactionMock(client: Record<string, unknown>): jest.Mock {
  return jest.fn(async (callback: (value: unknown) => unknown) =>
    callback(client),
  );
}

function createPrismaMock(methods: { transaction?: jest.Mock }): PrismaService {
  return {
    $transaction: methods.transaction ?? jest.fn(),
  } as unknown as PrismaService;
}
