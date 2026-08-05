import {
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, SalesQuoteStatus } from "@prisma/client";
import { SalesQuotesRepository } from "../sales-quotes.repository";
import { SalesQuotesService } from "../sales-quotes.service";

describe("SalesQuotesService", () => {
  let repository: jest.Mocked<SalesQuotesRepository>;
  let service: SalesQuotesService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const quoteId = "20000000-0000-4000-8000-000000000001";
  const partnerId = "30000000-0000-4000-8000-000000000001";
  const productId = "40000000-0000-4000-8000-000000000001";
  const variantId = "50000000-0000-4000-8000-000000000001";

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(createQuote()),
      update: jest.fn().mockResolvedValue(createQuote()),
      findById: jest.fn().mockResolvedValue(createQuote()),
      findByWorkspace: jest.fn().mockResolvedValue([]),
      addLine: jest.fn().mockResolvedValue(createQuote()),
      updateLine: jest.fn().mockResolvedValue(createQuote()),
      removeLine: jest.fn().mockResolvedValue(createQuote()),
      transitionStatus: jest
        .fn()
        .mockResolvedValue(createQuote(SalesQuoteStatus.SENT)),
      findBusinessPartner: jest.fn().mockResolvedValue({ id: partnerId }),
      findProduct: jest
        .fn()
        .mockResolvedValue({ id: productId, workspaceId }),
      findProductVariant: jest.fn().mockResolvedValue({
        id: variantId,
        workspaceId,
        productId,
      }),
    } as unknown as jest.Mocked<SalesQuotesRepository>;
    service = new SalesQuotesService(repository);
  });

  it("creates a normalized workspace quote with server totals", async () => {
    await service.create(workspaceId, {
      number: " q-001 ",
      businessPartnerId: partnerId,
      issueDate: "2026-08-05T00:00:00.000Z",
      validUntil: "2026-08-31T00:00:00.000Z",
      currencyCode: " eur ",
    });

    expect(repository.findBusinessPartner).toHaveBeenCalledWith(
      workspaceId,
      partnerId,
    );
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      number: "Q-001",
      businessPartnerId: partnerId,
      issueDate: new Date("2026-08-05T00:00:00.000Z"),
      validUntil: new Date("2026-08-31T00:00:00.000Z"),
      currencyCode: "EUR",
    });
  });

  it("rejects a partner from another workspace", async () => {
    repository.findBusinessPartner.mockResolvedValueOnce(null);

    await expect(
      service.create(workspaceId, {
        number: "Q-001",
        businessPartnerId: partnerId,
        issueDate: "2026-08-05T00:00:00.000Z",
        currencyCode: "EUR",
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("calculates line amounts server-side", async () => {
    await service.addLine(workspaceId, quoteId, {
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
    expect(repository.findProduct).toHaveBeenCalledWith(workspaceId, productId);
    expect(repository.findProductVariant).toHaveBeenCalledWith(
      workspaceId,
      variantId,
    );
  });

  it("rejects a variant that belongs to another product", async () => {
    repository.findProductVariant.mockResolvedValueOnce({
      id: variantId,
      productId: "40000000-0000-4000-8000-000000000099",
    } as never);

    await expect(
      service.addLine(workspaceId, quoteId, {
        productId,
        productVariantId: variantId,
        description: "Service",
        quantity: 1,
        unitPrice: 10,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.addLine).not.toHaveBeenCalled();
  });

  it("rejects non-positive quantities at service level", async () => {
    await expect(
      service.addLine(workspaceId, quoteId, {
        productId,
        description: "Service",
        quantity: 0,
        unitPrice: 10,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.addLine).not.toHaveBeenCalled();
  });

  it("keeps sent quotes immutable", async () => {
    repository.findById.mockResolvedValueOnce(
      createQuote(SalesQuoteStatus.SENT),
    );

    await expect(
      service.update(workspaceId, quoteId, { notes: "Changed" }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("sends only a draft quote", async () => {
    await service.send(workspaceId, quoteId);

    expect(repository.transitionStatus).toHaveBeenCalledWith(
      workspaceId,
      quoteId,
      [SalesQuoteStatus.DRAFT],
      SalesQuoteStatus.SENT,
    );
  });

  it("accepts and rejects only sent quotes", async () => {
    repository.transitionStatus
      .mockResolvedValueOnce(createQuote(SalesQuoteStatus.ACCEPTED))
      .mockResolvedValueOnce(createQuote(SalesQuoteStatus.REJECTED));

    await service.accept(workspaceId, quoteId);
    await service.reject(workspaceId, quoteId);

    expect(repository.transitionStatus).toHaveBeenNthCalledWith(
      1,
      workspaceId,
      quoteId,
      [SalesQuoteStatus.SENT],
      SalesQuoteStatus.ACCEPTED,
    );
    expect(repository.transitionStatus).toHaveBeenNthCalledWith(
      2,
      workspaceId,
      quoteId,
      [SalesQuoteStatus.SENT],
      SalesQuoteStatus.REJECTED,
    );
  });

  it("cancels draft or sent quotes", async () => {
    repository.transitionStatus.mockResolvedValueOnce(
      createQuote(SalesQuoteStatus.CANCELLED),
    );

    await service.cancel(workspaceId, quoteId);

    expect(repository.transitionStatus).toHaveBeenCalledWith(
      workspaceId,
      quoteId,
      [SalesQuoteStatus.DRAFT, SalesQuoteStatus.SENT],
      SalesQuoteStatus.CANCELLED,
    );
  });

  it("rejects invalid status transitions", async () => {
    repository.transitionStatus.mockResolvedValueOnce(null);

    await expect(service.accept(workspaceId, quoteId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("preserves workspace isolation when loading a quote", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(service.get(workspaceId, quoteId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  function createQuote(
    status: SalesQuoteStatus = SalesQuoteStatus.DRAFT,
  ) {
    return {
      id: quoteId,
      workspaceId,
      number: "Q-001",
      businessPartnerId: partnerId,
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
