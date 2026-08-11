import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type BusinessPartnerCategoryRecord =
  Prisma.BusinessPartnerCategoryGetPayload<object>;

const categoryAssignmentInclude = {
  businessPartnerCategory: true,
} satisfies Prisma.BusinessPartnerCategoryAssignmentInclude;

export type BusinessPartnerCategoryAssignmentRecord =
  Prisma.BusinessPartnerCategoryAssignmentGetPayload<{
    include: typeof categoryAssignmentInclude;
  }>;

export type BusinessPartnerReference = Prisma.BusinessPartnerGetPayload<object>;

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

  findBusinessPartnerByCode(
    workspaceId: string,
    code: string,
  ): Promise<BusinessPartnerReference | null> {
    return this.prisma.businessPartner.findUnique({
      where: { workspaceId_code: { workspaceId, code } },
    });
  }

  createAssignment(data: {
    workspaceId: string;
    businessPartnerId: string;
    businessPartnerCategoryId: string;
  }): Promise<BusinessPartnerCategoryAssignmentRecord> {
    return this.prisma.businessPartnerCategoryAssignment.create({
      data,
      include: categoryAssignmentInclude,
    });
  }

  findAssignment(
    workspaceId: string,
    businessPartnerId: string,
    businessPartnerCategoryId: string,
  ): Promise<BusinessPartnerCategoryAssignmentRecord | null> {
    return this.prisma.businessPartnerCategoryAssignment.findFirst({
      where: {
        workspaceId,
        businessPartnerId,
        businessPartnerCategoryId,
      },
      include: categoryAssignmentInclude,
    });
  }

  async removeAssignment(
    workspaceId: string,
    businessPartnerId: string,
    businessPartnerCategoryId: string,
  ): Promise<boolean> {
    const result = await this.prisma.businessPartnerCategoryAssignment.deleteMany({
      where: {
        workspaceId,
        businessPartnerId,
        businessPartnerCategoryId,
      },
    });

    return result.count > 0;
  }

  findAssignmentsByBusinessPartner(
    workspaceId: string,
    businessPartnerId: string,
  ): Promise<BusinessPartnerCategoryAssignmentRecord[]> {
    return this.prisma.businessPartnerCategoryAssignment.findMany({
      where: { workspaceId, businessPartnerId },
      include: categoryAssignmentInclude,
      orderBy: [
        { businessPartnerCategory: { name: "asc" } },
        { businessPartnerCategory: { code: "asc" } },
      ],
    });
  }
}
