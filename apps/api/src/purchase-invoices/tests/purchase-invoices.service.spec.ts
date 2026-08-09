import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, PurchaseInvoiceStatus } from "@prisma/client";
import {
  PurchaseInvoiceDuplicateSupplierNumberError,
  PurchaseInvoicesRepository,
} from "../purchase-invoices.repository";
import { PurchaseInvoicesService } from "../purchase-invoices.service";

describe("PurchaseInvoicesService", () => {
  let repository: jest.Mocked<PurchaseInvoicesRepository>;
  let service: PurchaseInvoicesService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const invoiceId = "20000000-0000-4000-8000-000000000001";
  const supplierId = "30000000-0000-4000-8000-000000000001";
  const orderId = "40000000-0000-4000-8000-000000000001";
  const orderLineId = "50000000-0000-4000-8000-000000000001";
  const productId = "60000000-0000-4000-8000-000000000001";
  const variantId = "70000000-0000-4000-8000-000000000001";

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(invoice()),
      update: jest.fn().mockResolvedValue(invoice()),
      findById: jest.fn().mockResolvedValue(invoice()),
      findByWorkspace: jest.fn().mockResolvedValue([]),
      confirm: jest
        .fn()
        .mockResolvedValue(invoice(PurchaseInvoiceStatus.CONFIRMED, [line()])),
      cancel: jest
        .fn()
        .mockResolvedValue(invoice(PurchaseInvoiceStatus.CANCELLED)),
      findSupplier: jest.fn().mockResolvedValue({ id: supplierId }),
      findPurchaseOrder: jest.fn().mockResolvedValue({
        id: orderId,
        supplierId,
      }),
      findPurchaseOrderLine: jest.fn().mockResolvedValue({
        id: orderLineId,
        productId,
        productVariantId: variantId,
      }),
      findProduct: jest.fn().mockResolvedValue({ id: productId }),
      findProductVariant: jest.fn().mockResolvedValue({
        id: variantId,
        productId,
      }),
    } as unknown as jest.Mocked<PurchaseInvoicesRepository>;
    service = new PurchaseInvoicesService(repository);
  });

  it("normalizes identifiers and calculates every amount server-side", async () => {
    await service.create(workspaceId, createDto());

    const data = repository.create.mock.calls[0][0];
    expect(data.number).toBe("PI-001");
    expect(data.supplierInvoiceNumber).toBe("SUP-42");
    expect(data.currencyCode).toBe("EUR");
    expect(data.lines[0]).toEqual(
      expect.objectContaining({
        subtotalAmount: new Prisma.Decimal("21.0000"),
        taxAmount: new Prisma.Decimal("4.2000"),
        totalAmount: new Prisma.Decimal("25.2000"),
      }),
    );
    expect(data).not.toHaveProperty("paidAmount");
  });

  it("rejects a supplier outside the workspace", async () => {
    repository.findSupplier.mockResolvedValueOnce(null);

    await expect(service.create(workspaceId, createDto())).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("rejects a purchase order belonging to another supplier", async () => {
    repository.findPurchaseOrder.mockResolvedValueOnce({
      id: orderId,
      supplierId: "90000000-0000-4000-8000-000000000001",
    } as never);

    await expect(service.create(workspaceId, createDto())).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("rejects an invoice due before its invoice date", async () => {
    await expect(
      service.create(workspaceId, {
        ...createDto(),
        dueDate: "2026-08-08T00:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("checks order-line product and variant consistency", async () => {
    repository.findPurchaseOrderLine.mockResolvedValueOnce({
      id: orderLineId,
      productId: "90000000-0000-4000-8000-000000000001",
      productVariantId: variantId,
    } as never);

    await expect(service.create(workspaceId, createDto())).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("keeps confirmed invoices immutable", async () => {
    repository.findById.mockResolvedValueOnce(
      invoice(PurchaseInvoiceStatus.CONFIRMED, [line()]),
    );

    await expect(
      service.update(workspaceId, invoiceId, { notes: "Changed" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("refuses to confirm an invoice without lines", async () => {
    await expect(service.confirm(workspaceId, invoiceId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.confirm).not.toHaveBeenCalled();
  });

  it("confirms a draft invoice with lines", async () => {
    repository.findById.mockResolvedValueOnce(invoice(undefined, [line()]));

    const result = await service.confirm(workspaceId, invoiceId);

    expect(result.status).toBe(PurchaseInvoiceStatus.CONFIRMED);
    expect(repository.confirm).toHaveBeenCalledWith(workspaceId, invoiceId);
  });

  it("prevents cancellation of a partially paid invoice", async () => {
    repository.findById.mockResolvedValueOnce(
      invoice(PurchaseInvoiceStatus.PARTIALLY_PAID, [line()]),
    );

    await expect(service.cancel(workspaceId, invoiceId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(repository.cancel).not.toHaveBeenCalled();
  });

  it("maps duplicate supplier invoice numbers to conflict", async () => {
    repository.create.mockRejectedValueOnce(
      new PurchaseInvoiceDuplicateSupplierNumberError(),
    );

    await expect(service.create(workspaceId, createDto())).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it("preserves workspace isolation when loading an invoice", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(service.get(workspaceId, invoiceId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.findById).toHaveBeenCalledWith(workspaceId, invoiceId);
  });

  it("passes supplier, status and date filters to the repository", async () => {
    await service.list(workspaceId, {
      supplierId,
      status: PurchaseInvoiceStatus.CONFIRMED,
      invoiceDateFrom: "2026-08-01T00:00:00.000Z",
      invoiceDateTo: "2026-08-31T00:00:00.000Z",
    });

    expect(repository.findByWorkspace).toHaveBeenCalledWith(workspaceId, {
      supplierId,
      status: PurchaseInvoiceStatus.CONFIRMED,
      invoiceDateFrom: new Date("2026-08-01T00:00:00.000Z"),
      invoiceDateTo: new Date("2026-08-31T00:00:00.000Z"),
    });
  });

  function createDto() {
    return {
      number: " pi-001 ",
      supplierInvoiceNumber: " sup-42 ",
      supplierId,
      purchaseOrderId: orderId,
      currencyCode: " eur ",
      invoiceDate: "2026-08-09T00:00:00.000Z",
      dueDate: "2026-08-30T00:00:00.000Z",
      lines: [
        {
          purchaseOrderLineId: orderLineId,
          productId,
          productVariantId: variantId,
          description: "Components",
          quantity: 2,
          unitPrice: 10.5,
          taxRate: 20,
        },
      ],
    };
  }

  function line() {
    return {
      id: "80000000-0000-4000-8000-000000000001",
      workspaceId,
      purchaseInvoiceId: invoiceId,
      purchaseOrderLineId: orderLineId,
      productId,
      productVariantId: variantId,
      description: "Components",
      quantity: new Prisma.Decimal(2),
      unitPrice: new Prisma.Decimal(10.5),
      taxRate: new Prisma.Decimal(20),
      subtotalAmount: new Prisma.Decimal(21),
      taxAmount: new Prisma.Decimal(4.2),
      totalAmount: new Prisma.Decimal(25.2),
      createdAt: new Date("2026-08-09T00:00:00.000Z"),
      updatedAt: new Date("2026-08-09T00:00:00.000Z"),
    };
  }

  function invoice(
    status: PurchaseInvoiceStatus = PurchaseInvoiceStatus.DRAFT,
    lines: ReturnType<typeof line>[] = [],
  ) {
    return {
      id: invoiceId,
      workspaceId,
      number: "PI-001",
      supplierInvoiceNumber: "SUP-42",
      supplierId,
      purchaseOrderId: orderId,
      currencyCode: "EUR",
      status,
      invoiceDate: new Date("2026-08-09T00:00:00.000Z"),
      dueDate: new Date("2026-08-30T00:00:00.000Z"),
      subtotalAmount: new Prisma.Decimal(21),
      taxAmount: new Prisma.Decimal(4.2),
      totalAmount: new Prisma.Decimal(25.2),
      paidAmount: new Prisma.Decimal(0),
      notes: null,
      confirmedAt:
        status === PurchaseInvoiceStatus.CONFIRMED
          ? new Date("2026-08-09T01:00:00.000Z")
          : null,
      createdAt: new Date("2026-08-09T00:00:00.000Z"),
      updatedAt: new Date("2026-08-09T00:00:00.000Z"),
      lines,
    };
  }
});
