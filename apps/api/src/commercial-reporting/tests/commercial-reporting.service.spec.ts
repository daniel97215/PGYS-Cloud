import { BadRequestException } from "@nestjs/common";
import { InvoiceStatus, Prisma } from "@prisma/client";
import { SUBSCRIPTION_STATUSES } from "../../subscriptions/subscriptions.constants";
import { CommercialReportingRepository } from "../commercial-reporting.repository";
import { CommercialReportingService } from "../commercial-reporting.service";

describe("CommercialReportingService", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const offerId = "20000000-0000-4000-8000-000000000001";
  let repository: jest.Mocked<CommercialReportingRepository>;
  let service: CommercialReportingService;

  beforeEach(() => {
    repository = {
      subscriptionGroups: jest.fn().mockResolvedValue([
        {
          offerId,
          status: SUBSCRIPTION_STATUSES.ACTIVE,
          _count: { _all: 4 },
        },
      ]),
      invoiceGroups: jest.fn().mockResolvedValue([
        {
          status: InvoiceStatus.PAID,
          currency: "EUR",
          _count: { _all: 2 },
          _sum: {
            subtotalAmount: new Prisma.Decimal("300"),
            discountAmount: new Prisma.Decimal("20"),
            taxAmount: new Prisma.Decimal("56"),
            totalAmount: new Prisma.Decimal("336"),
          },
        },
      ]),
    } as unknown as jest.Mocked<CommercialReportingRepository>;
    service = new CommercialReportingService(repository);
  });

  it("returns subscriptions grouped by offer and status", async () => {
    const result = await service.subscriptions(workspaceId, {});

    expect(result.generatedAt).toEqual(expect.any(String));
    expect(result.groups).toEqual([
      { offerId, status: SUBSCRIPTION_STATUSES.ACTIVE, count: 4 },
    ]);
  });

  it("returns Billing totals separately by status and currency", async () => {
    const result = await service.invoices(workspaceId, {});

    expect(result.groups).toEqual([
      {
        status: InvoiceStatus.PAID,
        currency: "EUR",
        count: 2,
        subtotalAmount: "300.00",
        discountAmount: "20.00",
        taxAmount: "56.00",
        totalAmount: "336.00",
      },
    ]);
  });

  it("forwards offer and inclusive period filters", async () => {
    await service.invoices(workspaceId, {
      offerId,
      from: "2026-08-01T00:00:00.000Z",
      to: "2026-08-31T23:59:59.000Z",
    });

    expect(repository.invoiceGroups).toHaveBeenCalledWith(workspaceId, {
      offerId,
      from: new Date("2026-08-01T00:00:00.000Z"),
      to: new Date("2026-08-31T23:59:59.000Z"),
    });
  });

  it("rejects an inverted period before reading", async () => {
    await expect(
      service.subscriptions(workspaceId, {
        from: "2026-08-31T00:00:00.000Z",
        to: "2026-08-01T00:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.subscriptionGroups).not.toHaveBeenCalled();
  });

  it("rejects an unknown subscription status", async () => {
    repository.subscriptionGroups.mockResolvedValueOnce([
      { offerId, status: "unknown", _count: { _all: 1 } },
    ]);

    await expect(service.subscriptions(workspaceId, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
