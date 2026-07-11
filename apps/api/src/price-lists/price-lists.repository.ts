import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type PriceListRecord = Prisma.PriceListGetPayload<object>;

export interface CreatePriceListData {
  workspaceId: string;
  code: string;
  name: string;
  description?: string;
  currencyCode: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export type UpdatePriceListData = Omit<
  Partial<CreatePriceListData>,
  "workspaceId" | "code"
>;

@Injectable()
export class PriceListsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreatePriceListData): Promise<PriceListRecord> {
    return this.prisma.priceList.create({ data });
  }

  update(
    workspaceId: string,
    code: string,
    data: UpdatePriceListData,
  ): Promise<PriceListRecord> {
    return this.prisma.priceList.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data,
    });
  }

  deactivate(workspaceId: string, code: string): Promise<PriceListRecord> {
    return this.prisma.priceList.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data: { isActive: false },
    });
  }

  findByWorkspace(workspaceId: string): Promise<PriceListRecord[]> {
    return this.prisma.priceList.findMany({
      where: { workspaceId },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }, { code: "asc" }],
    });
  }

  findByWorkspaceAndCode(
    workspaceId: string,
    code: string,
  ): Promise<PriceListRecord | null> {
    return this.prisma.priceList.findUnique({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
    });
  }
}
