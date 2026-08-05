import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, SalesInvoiceStatus } from "@prisma/client";
import {
  SalesInvoiceOrderAlreadyInvoicedError,
  SalesInvoicesRepository,
} from "../sales-invoices.repository";
import { SalesInvoicesService } from "../sales-invoices.service";

describe("SalesInvoicesService", () => {
  let repository: jest.Mocked<SalesInvoicesRepository>;
  let service: SalesInvoicesService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const invoiceId = "20000000-0000-4000-8000-000000000001";
  const orderId = "30000000-0000-4000-8000-000000000001";
  const orderLineId = "40000000-0000-4000-8000-000000000001";
  const partnerId = "50000000-0000-4000-8000-000000000001";
  const productId = "60000000-0000-4000-8000-000000000001";
  const variantId = "70000000-0000-4000-8000-000000000001";

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(createInvoice()),
      createFromOrder: jest.fn().mockResolvedValue(createInvoice()),
      update: jest.fn().mockResolvedValue(createInvoice()),
      findById: jest.fn().mockResolvedValue(createInvoice()),
      findByWorkspace: jest.fn().mockResolvedValue([]),
      issue: jest
        .fn()
        .mockResolvedValue(createInvoice(SalesInvoiceStatus.ISSUED, [line()])),
      cancel: jest
        .fn()
        .mockResolvedValue(createInvoice(SalesInvoiceStatus.CANCELLED)),
      findBusinessPartner: jest.fn().mockResolvedValue({ id: partnerId }),
      findProduct: jest.fn().mockResolvedValue({ id: productId }),
      findProductVariant: jest.fn().mockResolvedValue({
        id: variantId,
        productId,
      }),
      findSalesOrderLine: jest.fn().mockResolvedValue({
        id: orderLineId,
        salesOrderId: orderId,
        productId,
        productVariantId: variantId,
      }),
    } as unknown as jest.Mocked<SalesInvoicesRepository>;
    service = new SalesInvoicesService(repository);
  });

  it("creates a draft invoice with server-calculated line totals", async () => {
    await service.create(workspaceId, {
      number: " inv-001 ",
      businessPartnerId: partnerId,
      issueDate: "2026-08-05T00:00:00.000Z",
      dueDate: "2026-08-31T00:00:00.000Z",
      currencyCode: " eur ",
      lines: [lineDto()],
    });

    const data = repository.create.mock.calls[0][0];
    expect(data.number).toBe("INV-001");
    expect(data.currencyCode).toBe("EUR");
    expect(data.lines[0].subtotalAmount.toString()).toBe("25");
    expect(data.lines[0].taxAmount.toString()).toBe("5");
    expect(data.lines[0].totalAmount.toString()).toBe("30");
    expect(data).not.toHaveProperty("paidAmount");
  });

  it("rejects an issue date after the due date", async () => {
    await expect(
      service.create(workspaceId, {
        number: "INV-001",
        businessPartnerId: partnerId,
        issueDate: "2026-09-01T00:00:00.000Z",
        dueDate: "2026-08-31T00:00:00.000Z",
        currencyCode: "EUR",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("converts an order using only invoice-specific input", async () => {
    await service.createFromOrder(workspaceId, orderId, {
      number: " inv-so-1 ",
      issueDate: "2026-08-05T00:00:00.000Z",
    });

    expect(repository.createFromOrder).toHaveBeenCalledWith(
      workspaceId,
      orderId,
      {
        number: "INV-SO-1",
        issueDate: new Date("2026-08-05T00:00:00.000Z"),
      },
    );
  });

  it("maps duplicate order conversion to a conflict", async () => {
    repository.createFromOrder.mockRejectedValueOnce(
      new SalesInvoiceOrderAlreadyInvoicedError(),
    );

    await expect(
      service.createFromOrder(workspaceId, orderId, {
        number: "INV-001",
        issueDate: "2026-08-05T00:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("keeps issued invoice contents immutable", async () => {
    repository.findById.mockResolvedValueOnce(
      createInvoice(SalesInvoiceStatus.ISSUED, [line()]),
    );

    await expect(
      service.update(workspaceId, invoiceId, { notes: "Changed" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("validates that an order line matches the invoice order", async () => {
    repository.findById.mockResolvedValueOnce({
      ...createInvoice(),
      salesOrderId: orderId,
    });
    repository.findSalesOrderLine.mockResolvedValueOnce({
      id: orderLineId,
      salesOrderId: "30000000-0000-4000-8000-000000000099",
      productId,
      productVariantId: variantId,
    } as never);

    await expect(
      service.update(workspaceId, invoiceId, { lines: [lineDto()] }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("refuses to issue an invoice without lines", async () => {
    await expect(service.issue(workspaceId, invoiceId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.issue).not.toHaveBeenCalled();
  });

  it("issues a draft invoice with lines", async () => {
    repository.findById.mockResolvedValueOnce(createInvoice(undefined, [line()]));

    const result = await service.issue(workspaceId, invoiceId);

    expect(result.status).toBe(SalesInvoiceStatus.ISSUED);
    expect(repository.issue).toHaveBeenCalledWith(workspaceId, invoiceId);
  });

  it("prevents cancellation of a paid invoice", async () => {
    repository.findById.mockResolvedValueOnce(
      createInvoice(SalesInvoiceStatus.PAID, [line()]),
    );

    await expect(service.cancel(workspaceId, invoiceId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.cancel).not.toHaveBeenCalled();
  });

  it("preserves workspace isolation when loading an invoice", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(service.get(workspaceId, invoiceId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  function lineDto() {
    return {
      salesOrderLineId: orderLineId,
      productId,
      productVariantId: variantId,
      description: "Service",
      quantity: 2.5,
      unitPrice: 10,
      taxRate: 20,
    };
  }

  function line() {
    return {
      id: "80000000-0000-4000-8000-000000000001",
      workspaceId,
      salesInvoiceId: invoiceId,
      salesOrderLineId: orderLineId,
      productId,
      productVariantId: variantId,
      description: "Service",
      quantity: new Prisma.Decimal(2.5),
      unitPrice: new Prisma.Decimal(10),
      taxRate: new Prisma.Decimal(20),
      subtotalAmount: new Prisma.Decimal(25),
      taxAmount: new Prisma.Decimal(5),
      totalAmount: new Prisma.Decimal(30),
      sortOrder: 0,
      createdAt: new Date("2026-08-05T00:00:00.000Z"),
      updatedAt: new Date("2026-08-05T00:00:00.000Z"),
    };
  }

  function createInvoice(
    status: SalesInvoiceStatus = SalesInvoiceStatus.DRAFT,
    lines: ReturnType<typeof line>[] = [],
  ) {
    return {
      id: invoiceId,
      workspaceId,
      number: "INV-001",
      businessPartnerId: partnerId,
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
      issuedAt:
        status === SalesInvoiceStatus.ISSUED
          ? new Date("2026-08-05T01:00:00.000Z")
          : null,
      cancelledAt:
        status === SalesInvoiceStatus.CANCELLED
          ? new Date("2026-08-05T02:00:00.000Z")
          : null,
      createdAt: new Date("2026-08-05T00:00:00.000Z"),
      updatedAt: new Date("2026-08-05T00:00:00.000Z"),
      lines,
    };
  }
});
