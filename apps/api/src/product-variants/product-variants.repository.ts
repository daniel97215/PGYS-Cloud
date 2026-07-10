import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type ProductVariantRecord = Prisma.ProductVariantGetPayload<object>;

export interface CreateProductVariantData {
  workspaceId: string;
  productId: string;
  code: string;
  name: string;
  sku?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export type UpdateProductVariantData = Omit<
  Partial<CreateProductVariantData>,
  "workspaceId" | "productId" | "code"
>;

@Injectable()
export class ProductVariantsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateProductVariantData): Promise<ProductVariantRecord> {
    return this.prisma.productVariant.create({ data });
  }

  update(
    workspaceId: string,
    code: string,
    data: UpdateProductVariantData,
  ): Promise<ProductVariantRecord> {
    return this.prisma.productVariant.update({
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
  ): Promise<ProductVariantRecord> {
    return this.prisma.productVariant.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data: { isActive: false },
    });
  }

  findByProduct(
    workspaceId: string,
    productId: string,
  ): Promise<ProductVariantRecord[]> {
    return this.prisma.productVariant.findMany({
      where: { workspaceId, productId },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }, { code: "asc" }],
    });
  }

  findByWorkspaceAndCode(
    workspaceId: string,
    code: string,
  ): Promise<ProductVariantRecord | null> {
    return this.prisma.productVariant.findUnique({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
    });
  }
}
