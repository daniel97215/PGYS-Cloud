import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type CustomerCategoryRecord =
  Prisma.CustomerCategoryGetPayload<object>;

export interface CreateCustomerCategoryData {
  workspaceId: string;
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateCustomerCategoryData = Omit<
  Partial<CreateCustomerCategoryData>,
  "workspaceId" | "code"
>;

@Injectable()
export class CustomerCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateCustomerCategoryData): Promise<CustomerCategoryRecord> {
    return this.prisma.customerCategory.create({ data });
  }

  update(
    workspaceId: string,
    code: string,
    data: UpdateCustomerCategoryData,
  ): Promise<CustomerCategoryRecord> {
    return this.prisma.customerCategory.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data,
    });
  }

  disable(workspaceId: string, code: string): Promise<CustomerCategoryRecord> {
    return this.prisma.customerCategory.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data: { isActive: false },
    });
  }

  findByWorkspace(workspaceId: string): Promise<CustomerCategoryRecord[]> {
    return this.prisma.customerCategory.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  }

  findByWorkspaceAndCode(
    workspaceId: string,
    code: string,
  ): Promise<CustomerCategoryRecord | null> {
    return this.prisma.customerCategory.findUnique({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
    });
  }
}
