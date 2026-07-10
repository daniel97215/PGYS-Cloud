import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type ProductCategoryRecord =
  Prisma.ProductCategoryGetPayload<object>;

export interface CreateProductCategoryData {
  workspaceId: string;
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateProductCategoryData = Omit<
  Partial<CreateProductCategoryData>,
  "workspaceId" | "code"
>;

@Injectable()
export class ProductCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateProductCategoryData): Promise<ProductCategoryRecord> {
    return this.prisma.productCategory.create({ data });
  }

  update(
    workspaceId: string,
    code: string,
    data: UpdateProductCategoryData,
  ): Promise<ProductCategoryRecord> {
    return this.prisma.productCategory.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data,
    });
  }

  deactivate(
    workspaceId: string,
    code: string,
  ): Promise<ProductCategoryRecord> {
    return this.prisma.productCategory.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data: { isActive: false },
    });
  }

  findByWorkspace(workspaceId: string): Promise<ProductCategoryRecord[]> {
    return this.prisma.productCategory.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  }

  findByWorkspaceAndCode(
    workspaceId: string,
    code: string,
  ): Promise<ProductCategoryRecord | null> {
    return this.prisma.productCategory.findUnique({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
    });
  }
}
