import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type ProductMediaRecord = Prisma.ProductMediaGetPayload<object>;

export interface CreateProductMediaData {
  workspaceId: string;
  productId?: string;
  productVariantId?: string;
  name: string;
  mediaType: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export type UpdateProductMediaData = Omit<
  Partial<CreateProductMediaData>,
  "workspaceId"
>;

@Injectable()
export class ProductMediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateProductMediaData): Promise<ProductMediaRecord> {
    return this.prisma.productMedia.create({ data });
  }

  update(
    workspaceId: string,
    id: string,
    data: UpdateProductMediaData,
  ): Promise<ProductMediaRecord> {
    return this.prisma.productMedia.update({
      where: { id, workspaceId },
      data,
    });
  }

  delete(workspaceId: string, id: string): Promise<ProductMediaRecord> {
    return this.prisma.productMedia.delete({
      where: { id, workspaceId },
    });
  }

  findById(workspaceId: string, id: string): Promise<ProductMediaRecord | null> {
    return this.prisma.productMedia.findFirst({
      where: { id, workspaceId },
    });
  }

  listByProduct(
    workspaceId: string,
    productId: string,
  ): Promise<ProductMediaRecord[]> {
    return this.prisma.productMedia.findMany({
      where: { workspaceId, productId },
      orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    });
  }
}
