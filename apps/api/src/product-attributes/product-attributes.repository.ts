import { Injectable } from "@nestjs/common";
import { Prisma, ProductAttributeValueType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type ProductAttributeRecord = Prisma.ProductAttributeGetPayload<object>;

export interface CreateProductAttributeData {
  workspaceId: string;
  code: string;
  name: string;
  valueType: ProductAttributeValueType;
  description?: string;
  isRequired?: boolean;
  isVariantAxis?: boolean;
  isActive?: boolean;
}

export type UpdateProductAttributeData = Omit<
  Partial<CreateProductAttributeData>,
  "workspaceId" | "code"
>;

@Injectable()
export class ProductAttributesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateProductAttributeData): Promise<ProductAttributeRecord> {
    return this.prisma.productAttribute.create({ data });
  }

  update(
    workspaceId: string,
    code: string,
    data: UpdateProductAttributeData,
  ): Promise<ProductAttributeRecord> {
    return this.prisma.productAttribute.update({
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
  ): Promise<ProductAttributeRecord> {
    return this.prisma.productAttribute.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data: { isActive: false },
    });
  }

  list(workspaceId: string): Promise<ProductAttributeRecord[]> {
    return this.prisma.productAttribute.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  }

  getByCode(
    workspaceId: string,
    code: string,
  ): Promise<ProductAttributeRecord | null> {
    return this.prisma.productAttribute.findUnique({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
    });
  }
}
