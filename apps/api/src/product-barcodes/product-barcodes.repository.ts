import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type ProductBarcodeRecord = Prisma.ProductBarcodeGetPayload<object>;

export interface CreateProductBarcodeData {
  workspaceId: string;
  productId?: string;
  productVariantId?: string;
  barcode: string;
  barcodeType: string;
  isPrimary?: boolean;
}

export type UpdateProductBarcodeData = Omit<
  Partial<CreateProductBarcodeData>,
  "workspaceId" | "barcode"
>;

@Injectable()
export class ProductBarcodesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateProductBarcodeData): Promise<ProductBarcodeRecord> {
    return this.prisma.productBarcode.create({ data });
  }

  update(
    workspaceId: string,
    barcode: string,
    data: UpdateProductBarcodeData,
  ): Promise<ProductBarcodeRecord> {
    return this.prisma.productBarcode.update({
      where: {
        workspaceId_barcode: {
          workspaceId,
          barcode,
        },
      },
      data,
    });
  }

  delete(workspaceId: string, barcode: string): Promise<ProductBarcodeRecord> {
    return this.prisma.productBarcode.delete({
      where: {
        workspaceId_barcode: {
          workspaceId,
          barcode,
        },
      },
    });
  }

  findByBarcode(
    workspaceId: string,
    barcode: string,
  ): Promise<ProductBarcodeRecord | null> {
    return this.prisma.productBarcode.findUnique({
      where: {
        workspaceId_barcode: {
          workspaceId,
          barcode,
        },
      },
    });
  }

  listByProduct(
    workspaceId: string,
    productId: string,
  ): Promise<ProductBarcodeRecord[]> {
    return this.prisma.productBarcode.findMany({
      where: { workspaceId, productId },
      orderBy: [{ isPrimary: "desc" }, { barcode: "asc" }],
    });
  }
}
