import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type WarehouseRecord = Prisma.WarehouseGetPayload<object>;
export type WarehouseAddress = Prisma.InputJsonObject;

export interface CreateWarehouseData {
  workspaceId: string;
  code: string;
  name: string;
  description?: string;
  address?: WarehouseAddress;
  isDefault?: boolean;
  isActive?: boolean;
}

export type UpdateWarehouseData = Omit<
  Partial<CreateWarehouseData>,
  "workspaceId" | "code"
>;

@Injectable()
export class WarehousesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateWarehouseData): Promise<WarehouseRecord> {
    return this.prisma.warehouse.create({ data });
  }

  update(
    workspaceId: string,
    code: string,
    data: UpdateWarehouseData,
  ): Promise<WarehouseRecord> {
    return this.prisma.warehouse.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data,
    });
  }

  deactivate(workspaceId: string, code: string): Promise<WarehouseRecord> {
    return this.prisma.warehouse.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data: { isActive: false },
    });
  }

  findByWorkspace(workspaceId: string): Promise<WarehouseRecord[]> {
    return this.prisma.warehouse.findMany({
      where: { workspaceId },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }, { code: "asc" }],
    });
  }

  findByWorkspaceAndCode(
    workspaceId: string,
    code: string,
  ): Promise<WarehouseRecord | null> {
    return this.prisma.warehouse.findUnique({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
    });
  }
}
