import { InvoiceStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CommercialReportingRepository } from "../commercial-reporting.repository";

describe("CommercialReportingRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const offerId = "20000000-0000-4000-8000-000000000001";
  const from = new Date("2026-08-01T00:00:00.000Z");
  const to = new Date("2026-08-31T23:59:59.000Z");

  it("groups subscriptions by offer and status using createdAt", async () => {
    const groupBy = jest.fn().mockResolvedValue([]);
    const repository = new CommercialReportingRepository(
      mockPrisma({ subscriptionGroupBy: groupBy }),
    );

    await repository.subscriptionGroups(workspaceId, { offerId, from, to });

    expect(groupBy).toHaveBeenCalledWith({
      by: ["offerId", "status"],
      where: {
        workspaceId,
        offerId,
        createdAt: { gte: from, lte: to },
      },
      _count: { _all: true },
      orderBy: [{ offerId: "asc" }, { status: "asc" }],
    });
  });

  it("groups Billing invoices by status and currency using issuedAt", async () => {
    const groupBy = jest.fn().mockResolvedValue([
      {
        status: InvoiceStatus.OPEN,
        currency: "EUR",
        _count: { _all: 1 },
        _sum: {},
      },
    ]);
    const repository = new CommercialReportingRepository(
      mockPrisma({ invoiceGroupBy: groupBy }),
    );

    await repository.invoiceGroups(workspaceId, { offerId, from, to });

    expect(groupBy).toHaveBeenCalledWith({
      by: ["status", "currency"],
      where: {
        workspaceId,
        subscription: { offerId },
        issuedAt: { gte: from, lte: to },
      },
      _count: { _all: true },
      _sum: {
        subtotalAmount: true,
        discountAmount: true,
        taxAmount: true,
        totalAmount: true,
      },
      orderBy: [{ status: "asc" }, { currency: "asc" }],
    });
  });
});

function mockPrisma(methods: Record<string, jest.Mock>): PrismaService {
  return {
    subscription: {
      groupBy: methods.subscriptionGroupBy ?? jest.fn(),
    },
    invoice: {
      groupBy: methods.invoiceGroupBy ?? jest.fn(),
    },
  } as unknown as PrismaService;
}
