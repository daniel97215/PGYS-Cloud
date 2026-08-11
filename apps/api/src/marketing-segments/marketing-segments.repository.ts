import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type MarketingSegmentRecord = Prisma.MarketingSegmentGetPayload<object>;

export interface CreateMarketingSegmentData {
  workspaceId: string;
  code: string;
  name: string;
  description?: string;
  roleCodes: string[];
  categoryCodes: string[];
  tagCodes: string[];
  activeOnly: boolean;
  isActive?: boolean;
}

export type UpdateMarketingSegmentData = Omit<
  Partial<CreateMarketingSegmentData>,
  "workspaceId" | "code"
>;

@Injectable()
export class MarketingSegmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateMarketingSegmentData): Promise<MarketingSegmentRecord> {
    return this.prisma.marketingSegment.create({ data });
  }

  update(
    workspaceId: string,
    segmentId: string,
    data: UpdateMarketingSegmentData,
  ): Promise<MarketingSegmentRecord> {
    return this.prisma.marketingSegment.update({
      where: { id: segmentId, workspaceId },
      data,
    });
  }

  deactivate(
    workspaceId: string,
    segmentId: string,
  ): Promise<MarketingSegmentRecord> {
    return this.prisma.marketingSegment.update({
      where: { id: segmentId, workspaceId },
      data: { isActive: false },
    });
  }

  findByWorkspace(workspaceId: string): Promise<MarketingSegmentRecord[]> {
    return this.prisma.marketingSegment.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  }

  findByCode(
    workspaceId: string,
    code: string,
  ): Promise<MarketingSegmentRecord | null> {
    return this.prisma.marketingSegment.findUnique({
      where: { workspaceId_code: { workspaceId, code } },
    });
  }
}
