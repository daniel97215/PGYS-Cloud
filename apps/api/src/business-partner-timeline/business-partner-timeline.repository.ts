import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type BusinessPartnerTimelineEntryRecord =
  Prisma.BusinessPartnerTimelineEntryGetPayload<object>;

export interface CreateBusinessPartnerTimelineEntryData {
  workspaceId: string;
  businessPartnerId: string;
  eventType: string;
  title: string;
  description?: string;
  sourceModule: string;
  sourceId?: string;
  metadata?: Prisma.InputJsonObject;
  occurredAt: Date;
}

@Injectable()
export class BusinessPartnerTimelineRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: CreateBusinessPartnerTimelineEntryData,
  ): Promise<BusinessPartnerTimelineEntryRecord> {
    return this.prisma.businessPartnerTimelineEntry.create({ data });
  }

  findByBusinessPartner(
    workspaceId: string,
    businessPartnerId: string,
  ): Promise<BusinessPartnerTimelineEntryRecord[]> {
    return this.prisma.businessPartnerTimelineEntry.findMany({
      where: { workspaceId, businessPartnerId },
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
    });
  }

  findById(
    workspaceId: string,
    businessPartnerId: string,
    entryId: string,
  ): Promise<BusinessPartnerTimelineEntryRecord | null> {
    return this.prisma.businessPartnerTimelineEntry.findFirst({
      where: {
        id: entryId,
        workspaceId,
        businessPartnerId,
      },
    });
  }
}
