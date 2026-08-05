import { Prisma, SalesQuoteStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  SalesQuoteLineNotFoundError,
  SalesQuotesRepository,
} from "../sales-quotes.repository";

describe("SalesQuotesRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const quoteId = "20000000-0000-4000-8000-000000000001";
  const lineId = "30000000-0000-4000-8000-000000000001";

  it("creates a workspace-scoped quote with lines included", async () => {
    const quote = createQuote();
    const create = jest.fn().mockResolvedValue(quote);
    const repository = new SalesQuotesRepository(
      createPrismaMock({ quoteCreate: create }),
    );

    await repository.create({
      workspaceId,
      number: "Q-001",
      businessPartnerId: "40000000-0000-4000-8000-000000000001",
      issueDate: new Date("2026-08-05T00:00:00.000Z"),
      currencyCode: "EUR",
    });

    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({ workspaceId, number: "Q-001" }),
      include: { lines: { orderBy: expect.any(Array) } },
    });
  });

  it("adds a line and recalculates quote totals atomically", async () => {
    const claim = jest.fn().mockResolvedValue({ count: 1 });
    const createLine = jest.fn().mockResolvedValue({ id: lineId });
    const findLines = jest.fn().mockResolvedValue([
      amounts(20, 4, 24),
      amounts(10, 2, 12),
    ]);
    const updateQuote = jest.fn().mockResolvedValue({});
    const findUniqueOrThrow = jest.fn().mockResolvedValue(createQuote());
    const transaction = transactionMock({
      salesQuote: {
        updateMany: claim,
        update: updateQuote,
        findUniqueOrThrow,
      },
      salesQuoteLine: { create: createLine, findMany: findLines },
    });
    const repository = new SalesQuotesRepository(
      createPrismaMock({ transaction }),
    );

    await repository.addLine(lineData());

    expect(createLine).toHaveBeenCalledWith({ data: lineData() });
    expect(updateQuote).toHaveBeenCalledWith({
      where: { id: quoteId, workspaceId },
      data: {
        subtotalAmount: new Prisma.Decimal(30),
        taxAmount: new Prisma.Decimal(6),
        totalAmount: new Prisma.Decimal(36),
      },
    });
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });

  it("updates a line only inside its quote and workspace", async () => {
    const updateLine = jest.fn().mockResolvedValue([{ id: lineId }]);
    const transaction = transactionMock({
      salesQuote: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn(),
        findUniqueOrThrow: jest.fn().mockResolvedValue(createQuote()),
      },
      salesQuoteLine: {
        updateManyAndReturn: updateLine,
        findMany: jest.fn().mockResolvedValue([]),
      },
    });
    const repository = new SalesQuotesRepository(
      createPrismaMock({ transaction }),
    );
    const data = updateLineData();

    await repository.updateLine(workspaceId, quoteId, lineId, data);

    expect(updateLine).toHaveBeenCalledWith({
      where: { id: lineId, workspaceId, salesQuoteId: quoteId },
      data: expect.objectContaining({
        productId: data.productId,
        productVariantId: null,
      }),
      select: { id: true },
    });
  });

  it("rolls back when the requested line does not belong to the quote", async () => {
    const updateQuote = jest.fn();
    const transaction = transactionMock({
      salesQuote: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: updateQuote,
      },
      salesQuoteLine: {
        updateManyAndReturn: jest.fn().mockResolvedValue([]),
      },
    });
    const repository = new SalesQuotesRepository(
      createPrismaMock({ transaction }),
    );
    const data = updateLineData();

    await expect(
      repository.updateLine(workspaceId, quoteId, lineId, data),
    ).rejects.toBeInstanceOf(SalesQuoteLineNotFoundError);
    expect(updateQuote).not.toHaveBeenCalled();
  });

  it("removes a line and resets totals when no lines remain", async () => {
    const updateQuote = jest.fn();
    const transaction = transactionMock({
      salesQuote: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: updateQuote,
        findUniqueOrThrow: jest.fn().mockResolvedValue(createQuote()),
      },
      salesQuoteLine: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
        findMany: jest.fn().mockResolvedValue([]),
      },
    });
    const repository = new SalesQuotesRepository(
      createPrismaMock({ transaction }),
    );

    await repository.removeLine(workspaceId, quoteId, lineId);

    const totals = updateQuote.mock.calls[0][0].data;
    expect(totals.subtotalAmount.toString()).toBe("0");
    expect(totals.taxAmount.toString()).toBe("0");
    expect(totals.totalAmount.toString()).toBe("0");
  });

  it("transitions status conditionally with workspace isolation", async () => {
    const transition = jest.fn().mockResolvedValue([{ id: quoteId }]);
    const transaction = transactionMock({
      salesQuote: {
        updateManyAndReturn: transition,
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValue(createQuote(SalesQuoteStatus.SENT)),
      },
    });
    const repository = new SalesQuotesRepository(
      createPrismaMock({ transaction }),
    );

    await repository.transitionStatus(
      workspaceId,
      quoteId,
      [SalesQuoteStatus.DRAFT],
      SalesQuoteStatus.SENT,
    );

    expect(transition).toHaveBeenCalledWith({
      where: {
        id: quoteId,
        workspaceId,
        status: { in: [SalesQuoteStatus.DRAFT] },
      },
      data: { status: SalesQuoteStatus.SENT },
      select: { id: true },
    });
  });

  function lineData() {
    return {
      workspaceId,
      salesQuoteId: quoteId,
      productId: "50000000-0000-4000-8000-000000000001",
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

  function updateLineData() {
    const data = lineData();

    return {
      productId: data.productId,
      description: data.description,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      taxRate: data.taxRate,
      subtotalAmount: data.subtotalAmount,
      taxAmount: data.taxAmount,
      totalAmount: data.totalAmount,
      sortOrder: data.sortOrder,
    };
  }

  function amounts(subtotal: number, tax: number, total: number) {
    return {
      subtotalAmount: new Prisma.Decimal(subtotal),
      taxAmount: new Prisma.Decimal(tax),
      totalAmount: new Prisma.Decimal(total),
    };
  }

  function createQuote(
    status: SalesQuoteStatus = SalesQuoteStatus.DRAFT,
  ) {
    return {
      id: quoteId,
      workspaceId,
      number: "Q-001",
      businessPartnerId: "40000000-0000-4000-8000-000000000001",
      status,
      issueDate: new Date("2026-08-05T00:00:00.000Z"),
      validUntil: null,
      currencyCode: "EUR",
      notes: null,
      subtotalAmount: new Prisma.Decimal(0),
      taxAmount: new Prisma.Decimal(0),
      totalAmount: new Prisma.Decimal(0),
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

function createPrismaMock(methods: {
  transaction?: jest.Mock;
  quoteCreate?: jest.Mock;
}): PrismaService {
  return {
    $transaction: methods.transaction ?? jest.fn(),
    salesQuote: { create: methods.quoteCreate ?? jest.fn() },
  } as unknown as PrismaService;
}
