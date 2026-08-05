import { Prisma, SalesInvoiceStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
  SalesInvoiceOrderAlreadyInvoicedError,
  SalesInvoicesRepository,
} from "../sales-invoices.repository";

describe("SalesInvoicesRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const invoiceId = "20000000-0000-4000-8000-000000000001";
  const orderId = "30000000-0000-4000-8000-000000000001";
  const orderLineId = "40000000-0000-4000-8000-000000000001";
  const productId = "50000000-0000-4000-8000-000000000001";

  it("creates a draft invoice and totals its lines atomically", async () => {
    const createInvoiceRecord = jest.fn().mockResolvedValue(createInvoice());
    const transaction = transactionMock({
      salesInvoice: { create: createInvoiceRecord },
    });
    const repository = new SalesInvoicesRepository(
      createPrismaMock(transaction),
    );

    await repository.create({
      workspaceId,
      number: "INV-001",
      businessPartnerId: "60000000-0000-4000-8000-000000000001",
      issueDate: new Date("2026-08-05T00:00:00.000Z"),
      currencyCode: "EUR",
      lines: [lineInput(20, 4, 24), lineInput(10, 2, 12)],
    });

    const data = createInvoiceRecord.mock.calls[0][0].data;
    expect(data.subtotalAmount.toString()).toBe("30");
    expect(data.taxAmount.toString()).toBe("6");
    expect(data.totalAmount.toString()).toBe("36");
    expect(data.lines.create).toHaveLength(2);
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });

  it("converts an order and recalculates every copied amount", async () => {
    const order = createOrder();
    const createInvoiceRecord = jest.fn().mockResolvedValue(createInvoice());
    const transaction = transactionMock({
      salesOrder: { findFirst: jest.fn().mockResolvedValue(order) },
      salesInvoice: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: createInvoiceRecord,
      },
    });
    const repository = new SalesInvoicesRepository(
      createPrismaMock(transaction),
    );

    await repository.createFromOrder(workspaceId, orderId, {
      number: "INV-001",
      issueDate: new Date("2026-08-05T00:00:00.000Z"),
    });

    const data = createInvoiceRecord.mock.calls[0][0].data;
    expect(data.businessPartnerId).toBe(order.businessPartnerId);
    expect(data.salesOrderId).toBe(orderId);
    expect(data.currencyCode).toBe("EUR");
    expect(data.lines.create[0].salesOrderLineId).toBe(orderLineId);
    expect(data.lines.create[0].subtotalAmount.toString()).toBe("25");
    expect(data.lines.create[0].taxAmount.toString()).toBe("5");
    expect(data.lines.create[0].totalAmount.toString()).toBe("30");
    expect(data.totalAmount.toString()).toBe("30");
  });

  it("rejects a second invoice for the same order", async () => {
    const create = jest.fn();
    const transaction = transactionMock({
      salesOrder: { findFirst: jest.fn().mockResolvedValue(createOrder()) },
      salesInvoice: {
        findFirst: jest.fn().mockResolvedValue({ id: invoiceId }),
        create,
      },
    });
    const repository = new SalesInvoicesRepository(
      createPrismaMock(transaction),
    );

    await expect(
      repository.createFromOrder(workspaceId, orderId, {
        number: "INV-002",
        issueDate: new Date("2026-08-05T00:00:00.000Z"),
      }),
    ).rejects.toBeInstanceOf(SalesInvoiceOrderAlreadyInvoicedError);
    expect(create).not.toHaveBeenCalled();
  });

  it("replaces draft lines and totals atomically", async () => {
    const deleteMany = jest.fn();
    const createMany = jest.fn();
    const updateInvoice = jest.fn().mockResolvedValue([{ id: invoiceId }]);
    const transaction = transactionMock({
      salesInvoice: {
        updateManyAndReturn: updateInvoice,
        findUniqueOrThrow: jest.fn().mockResolvedValue(createInvoice()),
      },
      salesInvoiceLine: { deleteMany, createMany },
    });
    const repository = new SalesInvoicesRepository(
      createPrismaMock(transaction),
    );

    await repository.update(workspaceId, invoiceId, {
      lines: [lineInput(15, 3, 18)],
    });

    expect(updateInvoice).toHaveBeenCalledWith({
      where: { id: invoiceId, workspaceId, status: SalesInvoiceStatus.DRAFT },
      data: {
        subtotalAmount: new Prisma.Decimal(15),
        taxAmount: new Prisma.Decimal(3),
        totalAmount: new Prisma.Decimal(18),
      },
      select: { id: true },
    });
    expect(deleteMany).toHaveBeenCalledWith({
      where: { workspaceId, salesInvoiceId: invoiceId },
    });
    expect(createMany).toHaveBeenCalled();
  });

  it("issues only a draft invoice that has lines", async () => {
    const transition = jest.fn().mockResolvedValue([{ id: invoiceId }]);
    const transaction = transactionMock({
      salesInvoice: {
        updateManyAndReturn: transition,
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValue(createInvoice(SalesInvoiceStatus.ISSUED)),
      },
    });
    const repository = new SalesInvoicesRepository(
      createPrismaMock(transaction),
    );

    await repository.issue(workspaceId, invoiceId);

    expect(transition).toHaveBeenCalledWith({
      where: {
        id: invoiceId,
        workspaceId,
        status: { in: [SalesInvoiceStatus.DRAFT] },
        lines: { some: {} },
      },
      data: {
        status: SalesInvoiceStatus.ISSUED,
        issuedAt: expect.any(Date),
      },
      select: { id: true },
    });
  });

  it("does not include paid invoices among cancellable statuses", async () => {
    const transition = jest.fn().mockResolvedValue([]);
    const transaction = transactionMock({
      salesInvoice: { updateManyAndReturn: transition },
    });
    const repository = new SalesInvoicesRepository(
      createPrismaMock(transaction),
    );

    await repository.cancel(workspaceId, invoiceId);

    const statuses = transition.mock.calls[0][0].where.status.in;
    expect(statuses).not.toContain(SalesInvoiceStatus.PAID);
    expect(statuses).not.toContain(SalesInvoiceStatus.CANCELLED);
  });

  function lineInput(subtotal: number, tax: number, total: number) {
    return {
      workspaceId,
      productId,
      description: "Service",
      quantity: new Prisma.Decimal(1),
      unitPrice: new Prisma.Decimal(subtotal),
      taxRate: new Prisma.Decimal(20),
      subtotalAmount: new Prisma.Decimal(subtotal),
      taxAmount: new Prisma.Decimal(tax),
      totalAmount: new Prisma.Decimal(total),
      sortOrder: 0,
    };
  }

  function createOrder() {
    return {
      id: orderId,
      workspaceId,
      number: "SO-001",
      businessPartnerId: "60000000-0000-4000-8000-000000000001",
      salesQuoteId: null,
      status: "CONFIRMED",
      orderDate: new Date("2026-08-01T00:00:00.000Z"),
      requestedDate: null,
      currencyCode: "EUR",
      notes: "Copied notes",
      subtotalAmount: new Prisma.Decimal(999),
      taxAmount: new Prisma.Decimal(999),
      totalAmount: new Prisma.Decimal(999),
      confirmedAt: new Date("2026-08-01T01:00:00.000Z"),
      completedAt: null,
      createdAt: new Date("2026-08-01T00:00:00.000Z"),
      updatedAt: new Date("2026-08-01T00:00:00.000Z"),
      lines: [
        {
          id: orderLineId,
          workspaceId,
          salesOrderId: orderId,
          productId,
          productVariantId: null,
          description: "Service",
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

  function createInvoice(
    status: SalesInvoiceStatus = SalesInvoiceStatus.DRAFT,
  ) {
    return {
      id: invoiceId,
      workspaceId,
      number: "INV-001",
      businessPartnerId: "60000000-0000-4000-8000-000000000001",
      salesOrderId: null,
      status,
      issueDate: new Date("2026-08-05T00:00:00.000Z"),
      dueDate: null,
      currencyCode: "EUR",
      notes: null,
      subtotalAmount: new Prisma.Decimal(0),
      taxAmount: new Prisma.Decimal(0),
      totalAmount: new Prisma.Decimal(0),
      paidAmount: new Prisma.Decimal(0),
      issuedAt: null,
      cancelledAt: null,
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

function createPrismaMock(transaction: jest.Mock): PrismaService {
  return { $transaction: transaction } as unknown as PrismaService;
}
