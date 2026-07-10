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

  private buildOrderBy(
    sort: BusinessPartnerSearchSortField = "name",
    order: BusinessPartnerSearchOrder = "asc",
  ): Prisma.BusinessPartnerOrderByWithRelationInput[] {
    return [{ [sort]: order }, { code: "asc" }];
  }
}
