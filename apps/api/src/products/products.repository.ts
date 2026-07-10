import { Injectable } from "@nestjs/common";
import { Prisma, ProductStatus, ProductType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type ProductRecord = Prisma.ProductGetPayload<object>;

export interface CreateProductData {
  workspaceId: string;
  code: string;
  name: string;
  description?: string;
  type: ProductType;
  status?: ProductStatus;
}

export type UpdateProductData = Omit<
  Partial<CreateProductData>,
  "workspaceId" | "code"
>;

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateProductData): Promise<ProductRecord> {
    return this.prisma.product.create({ data });
  }

  update(
    workspaceId: string,
    code: string,
    data: UpdateProductData,
  ): Promise<ProductRecord> {
    return this.prisma.product.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data,
    });
  }

  archive(workspaceId: string, code: string): Promise<ProductRecord> {
    return this.prisma.product.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data: { status: ProductStatus.INACTIVE },
    });
  }

  findByWorkspace(workspaceId: string): Promise<ProductRecord[]> {
    return this.prisma.product.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  }

  findByWorkspaceAndCode(
    workspaceId: string,
    code: string,
  ): Promise<ProductRecord | null> {
    return this.prisma.product.findUnique({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
    });
  }
}
