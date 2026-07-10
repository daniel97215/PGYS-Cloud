import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type BusinessPartnerCategoryRecord =
  Prisma.BusinessPartnerCategoryGetPayload<object>;

export interface CreateBusinessPartnerCategoryData {
  workspaceId: string;
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateBusinessPartnerCategoryData = Omit<
  Partial<CreateBusinessPartnerCategoryData>,
  "workspaceId" | "code"
>;

@Injectable()
export class BusinessPartnerCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateBusinessPartnerCategoryData): Promise<BusinessPartnerCategoryRecord> {
    return this.prisma.businessPartnerCategory.create({ data });
  }

  update(
    workspaceId: string,
    code: string,
    data: UpdateBusinessPartnerCategoryData,
  ): Promise<BusinessPartnerCategoryRecord> {
    return this.prisma.businessPartnerCategory.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data,
    });
  }

  disable(workspaceId: string, code: string): Promise<BusinessPartnerCategoryRecord> {
    return this.prisma.businessPartnerCategory.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data: { isActive: false },
    });
  }

  findByWorkspace(workspaceId: string): Promise<BusinessPartnerCategoryRecord[]> {
    return this.prisma.businessPartnerCategory.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  }

  findByWorkspaceAndCode(
    workspaceId: string,
    code: string,
  ): Promise<BusinessPartnerCategoryRecord | null> {
    return this.prisma.businessPartnerCategory.findUnique({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
    });
  }
}
