import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type StorageLocationRecord = Prisma.StorageLocationGetPayload<object>;

export interface CreateStorageLocationData {
  workspaceId: string;
  warehouseId: string;
  code: string;
  name: string;
  description?: string;
  locationType?: string;
  isActive?: boolean;
}

export type UpdateStorageLocationData = Omit<
  Partial<CreateStorageLocationData>,
  "workspaceId" | "warehouseId" | "code"
>;

@Injectable()
export class StorageLocationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateStorageLocationData): Promise<StorageLocationRecord> {
    return this.prisma.storageLocation.create({ data });
  }

  update(
    workspaceId: string,
    warehouseId: string,
    code: string,
    data: UpdateStorageLocationData,
  ): Promise<StorageLocationRecord> {
    return this.prisma.storageLocation.update({
      where: {
        warehouseId_code: { warehouseId, code },
        workspaceId,
      },
      data,
    });
  }

  deactivate(
    workspaceId: string,
    warehouseId: string,
    code: string,
  ): Promise<StorageLocationRecord> {
    return this.prisma.storageLocation.update({
      where: {
        warehouseId_code: { warehouseId, code },
        workspaceId,
      },
      data: { isActive: false },
    });
  }

  findByWarehouse(
    workspaceId: string,
    warehouseId: string,
  ): Promise<StorageLocationRecord[]> {
    return this.prisma.storageLocation.findMany({
      where: { workspaceId, warehouseId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  }

  findByWarehouseAndCode(
    workspaceId: string,
    warehouseId: string,
    code: string,
  ): Promise<StorageLocationRecord | null> {
    return this.prisma.storageLocation.findFirst({
      where: { workspaceId, warehouseId, code },
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
}
