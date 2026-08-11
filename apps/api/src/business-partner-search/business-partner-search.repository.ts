import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PaginationResult } from "../shared/pagination";
import { PrismaService } from "../prisma/prisma.service";
import {
  BusinessPartnerSearchOrder,
  BusinessPartnerSearchSortField,
} from "./dto/search-business-partner.dto";

const businessPartnerSearchInclude = {
  addresses: true,
  contacts: true,
  roleAssignments: {
    include: {
      businessPartnerRole: true,
    },
  },
  tagAssignments: {
    include: {
      businessPartnerTag: true,
    },
  },
} satisfies Prisma.BusinessPartnerInclude;

export type BusinessPartnerSearchRecord = Prisma.BusinessPartnerGetPayload<{
  include: typeof businessPartnerSearchInclude;
}>;

export interface BusinessPartnerSearchCriteria {
  code?: string;
  name?: string;
  category?: string;
  role?: string;
  tag?: string;
  city?: string;
  email?: string;
  phone?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sort?: BusinessPartnerSearchSortField;
  order?: BusinessPartnerSearchOrder;
}

export interface BusinessPartnerSearchResult
  extends PaginationResult<BusinessPartnerSearchRecord> {
  page: number;
  pageSize: number;
}

export interface BusinessPartnerAudienceCriteria {
  roleCodes: string[];
  categoryCodes: string[];
  tagCodes: string[];
  activeOnly: boolean;
}

export interface BusinessPartnerAudiencePagination {
  page?: number;
  pageSize?: number;
}

export interface BusinessPartnerAudienceResult
  extends PaginationResult<BusinessPartnerRecord> {
  page: number;
  pageSize: number;
}

export interface BusinessPartnerAudienceKnownCodes {
  roleCodes: string[];
  categoryCodes: string[];
  tagCodes: string[];
}

export type BusinessPartnerRecord = Prisma.BusinessPartnerGetPayload<object>;

@Injectable()
export class BusinessPartnerSearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async search(
    workspaceId: string,
    criteria: BusinessPartnerSearchCriteria,
  ): Promise<BusinessPartnerSearchResult> {
    const page = Math.max(criteria.page ?? 1, 1);
    const pageSize = Math.min(Math.max(criteria.pageSize ?? 25, 1), 100);
    const where = this.buildWhere(workspaceId, criteria);
    const orderBy = this.buildOrderBy(criteria.sort, criteria.order);

    const [items, total] = await Promise.all([
      this.prisma.businessPartner.findMany({
        where,
        include: businessPartnerSearchInclude,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.businessPartner.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async evaluateAudience(
    workspaceId: string,
    criteria: BusinessPartnerAudienceCriteria,
    pagination: BusinessPartnerAudiencePagination,
  ): Promise<BusinessPartnerAudienceResult> {
    const page = Math.max(pagination.page ?? 1, 1);
    const pageSize = Math.min(Math.max(pagination.pageSize ?? 25, 1), 100);
    const where = this.buildAudienceWhere(workspaceId, criteria);
    const [items, total] = await Promise.all([
      this.prisma.businessPartner.findMany({
        where,
        orderBy: [{ name: "asc" }, { code: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.businessPartner.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findKnownAudienceCodes(
    workspaceId: string,
    criteria: BusinessPartnerAudienceCriteria,
  ): Promise<BusinessPartnerAudienceKnownCodes> {
    const [roles, categories, tags] = await Promise.all([
      this.prisma.businessPartnerRole.findMany({
        where: {
          workspaceId,
          code: { in: criteria.roleCodes },
          isActive: true,
        },
        select: { code: true },
      }),
      this.prisma.businessPartnerCategory.findMany({
        where: {
          workspaceId,
          code: { in: criteria.categoryCodes },
          isActive: true,
        },
        select: { code: true },
      }),
      this.prisma.businessPartnerTag.findMany({
        where: {
          workspaceId,
          code: { in: criteria.tagCodes },
          isActive: true,
        },
        select: { code: true },
      }),
    ]);

    return {
      roleCodes: roles.map(({ code }) => code),
      categoryCodes: categories.map(({ code }) => code),
      tagCodes: tags.map(({ code }) => code),
    };
  }

  private buildWhere(
    workspaceId: string,
    criteria: BusinessPartnerSearchCriteria,
  ): Prisma.BusinessPartnerWhereInput {
    const and: Prisma.BusinessPartnerWhereInput[] = [{ workspaceId }];

    if (criteria.code) {
      and.push({
        code: { contains: criteria.code, mode: "insensitive" },
      });
    }

    if (criteria.name) {
      and.push({
        OR: [
          { name: { contains: criteria.name, mode: "insensitive" } },
          { legalName: { contains: criteria.name, mode: "insensitive" } },
        ],
      });
    }

    if (criteria.role) {
      and.push({
        roleAssignments: {
          some: {
            businessPartnerRole: {
              OR: [
                {
                  code: {
                    equals: criteria.role.toUpperCase(),
                    mode: "insensitive",
                  },
                },
                { name: { contains: criteria.role, mode: "insensitive" } },
              ],
            },
          },
        },
      });
    }

    if (criteria.tag) {
      and.push({
        tagAssignments: {
          some: {
            businessPartnerTag: {
              OR: [
                {
                  code: {
                    equals: criteria.tag.toUpperCase(),
                    mode: "insensitive",
                  },
                },
                { name: { contains: criteria.tag, mode: "insensitive" } },
              ],
            },
          },
        },
      });
    }

    if (criteria.city) {
      and.push({
        addresses: {
          some: { city: { contains: criteria.city, mode: "insensitive" } },
        },
      });
    }

    if (criteria.email) {
      and.push({
        contacts: {
          some: { email: { contains: criteria.email, mode: "insensitive" } },
        },
      });
    }

    if (criteria.phone) {
      and.push({
        contacts: {
          some: {
            OR: [
              { phone: { contains: criteria.phone, mode: "insensitive" } },
              { mobile: { contains: criteria.phone, mode: "insensitive" } },
            ],
          },
        },
      });
    }

    if (criteria.status) {
      and.push({ status: criteria.status });
    }

    return { AND: and };
  }

  private buildAudienceWhere(
    workspaceId: string,
    criteria: BusinessPartnerAudienceCriteria,
  ): Prisma.BusinessPartnerWhereInput {
    const and: Prisma.BusinessPartnerWhereInput[] = [{ workspaceId }];

    if (criteria.roleCodes.length > 0) {
      and.push({
        roleAssignments: {
          some: {
            workspaceId,
            businessPartnerRole: {
              workspaceId,
              code: { in: criteria.roleCodes },
              isActive: true,
            },
          },
        },
      });
    }

    if (criteria.categoryCodes.length > 0) {
      and.push({
        categoryAssignments: {
          some: {
            workspaceId,
            businessPartnerCategory: {
              workspaceId,
              code: { in: criteria.categoryCodes },
              isActive: true,
            },
          },
        },
      });
    }

    if (criteria.tagCodes.length > 0) {
      and.push({
        tagAssignments: {
          some: {
            workspaceId,
            businessPartnerTag: {
              workspaceId,
              code: { in: criteria.tagCodes },
              isActive: true,
            },
          },
        },
      });
    }

    if (criteria.activeOnly) {
      and.push({ status: "active" });
    }

    return { AND: and };
  }

  private buildOrderBy(
    sort: BusinessPartnerSearchSortField = "name",
    order: BusinessPartnerSearchOrder = "asc",
  ): Prisma.BusinessPartnerOrderByWithRelationInput[] {
    return [{ [sort]: order }, { code: "asc" }];
  }
}
