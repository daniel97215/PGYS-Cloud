import { Injectable } from "@nestjs/common";
import { InvoiceStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface CommercialReportQuery {
  offerId?: string;
  from?: Date;
  to?: Date;
}

export interface CommercialSubscriptionGroup {
  offerId: string;
  status: string;
  _count: { _all: number };
}

export interface CommercialInvoiceGroup {
  status: InvoiceStatus;
  currency: string;
  _count: { _all: number };
  _sum: {
    subtotalAmount: Prisma.Decimal | null;
    discountAmount: Prisma.Decimal | null;
    taxAmount: Prisma.Decimal | null;
    totalAmount: Prisma.Decimal | null;
  };
}

@Injectable()
export class CommercialReportingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async subscriptionGroups(
    workspaceId: string,
    query: CommercialReportQuery,
  ): Promise<CommercialSubscriptionGroup[]> {
    const groups = await this.prisma.subscription.groupBy({
      by: ["offerId", "status"],
      where: {
        workspaceId,
        ...(query.offerId === undefined ? {} : { offerId: query.offerId }),
        ...this.dateWhere("createdAt", query),
      },
      _count: { _all: true },
      orderBy: [{ offerId: "asc" }, { status: "asc" }],
    });

    return groups as CommercialSubscriptionGroup[];
  }

  async invoiceGroups(
    workspaceId: string,
    query: CommercialReportQuery,
  ): Promise<CommercialInvoiceGroup[]> {
    const groups = await this.prisma.invoice.groupBy({
      by: ["status", "currency"],
      where: {
        workspaceId,
        ...(query.offerId === undefined
          ? {}
          : { subscription: { offerId: query.offerId } }),
        ...this.dateWhere("issuedAt", query),
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

    return groups as CommercialInvoiceGroup[];
  }

  private dateWhere(
    field: "createdAt" | "issuedAt",
    query: CommercialReportQuery,
  ): { createdAt?: Prisma.DateTimeFilter; issuedAt?: Prisma.DateTimeFilter } {
    if (query.from === undefined && query.to === undefined) {
      return {};
    }

    return {
      [field]: {
        ...(query.from === undefined ? {} : { gte: query.from }),
        ...(query.to === undefined ? {} : { lte: query.to }),
      },
    };
  }
}
