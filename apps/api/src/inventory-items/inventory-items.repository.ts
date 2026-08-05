import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type InventoryItemRecord = Prisma.InventoryItemGetPayload<object>;

export interface CreateInventoryItemData {
  workspaceId: string;
  warehouseId: string;
  storageLocationId: string;
  productId: string;
  productVariantId?: string;
}

export interface UpdateInventoryItemData {
  isActive?: boolean;
}

export interface StorageLocationReference {
  id: string;
  warehouseId: string;
}

@Injectable()
export class InventoryItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateInventoryItemData): Promise<InventoryItemRecord> {
    return this.prisma.inventoryItem.create({ data });
  }

  update(
    workspaceId: string,
    id: string,
    data: UpdateInventoryItemData,
  ): Promise<InventoryItemRecord> {
    return this.prisma.inventoryItem.update({
      where: { id, workspaceId },
      data,
    });
  }

  deactivate(workspaceId: string, id: string): Promise<InventoryItemRecord> {
    return this.prisma.inventoryItem.update({
      where: { id, workspaceId },
      data: { isActive: false },
    });
  }

  findById(
    workspaceId: string,
    id: string,
  ): Promise<InventoryItemRecord | null> {
    return this.prisma.inventoryItem.findFirst({
      where: { id, workspaceId },
    });
  }

  findByLocation(
    workspaceId: string,
    storageLocationId: string,
  ): Promise<InventoryItemRecord[]> {
    return this.prisma.inventoryItem.findMany({
      where: { workspaceId, storageLocationId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
  }

  findByProduct(
    workspaceId: string,
    productId: string,
  ): Promise<InventoryItemRecord[]> {
    return this.prisma.inventoryItem.findMany({
      where: { workspaceId, productId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
  }

  findDuplicate(
    workspaceId: string,
    storageLocationId: string,
    productId: string,
    productVariantId: string | null,
  ): Promise<InventoryItemRecord | null> {
    return this.prisma.inventoryItem.findFirst({
      where: {
        workspaceId,
        storageLocationId,
        productId,
        productVariantId,
      },
    });
  }

  async warehouseBelongsToWorkspace(
    workspaceId: string,
    warehouseId: string,
  ): Promise<boolean> {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: warehouseId, workspaceId },
      select: { id: true },
    });

    return warehouse !== null;
  }

  findStorageLocation(
    workspaceId: string,
    storageLocationId: string,
  ): Promise<StorageLocationReference | null> {
    return this.prisma.storageLocation.findFirst({
      where: { id: storageLocationId, workspaceId },
      select: { id: true, warehouseId: true },
    });
  }

  async productBelongsToWorkspace(
    workspaceId: string,
    productId: string,
  ): Promise<boolean> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, workspaceId },
      select: { id: true },
    });

    return product !== null;
  }

  async productVariantBelongsToProduct(
    workspaceId: string,
    productId: string,
    productVariantId: string,
  ): Promise<boolean> {
    const productVariant = await this.prisma.productVariant.findFirst({
      where: {
        id: productVariantId,
        workspaceId,
        productId,
      },
      select: { id: true },
    });

    return productVariant !== null;
  }
}
