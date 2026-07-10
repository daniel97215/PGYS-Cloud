import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type ManufacturerRecord = Prisma.ManufacturerGetPayload<object>;

export interface CreateManufacturerData {
  workspaceId: string;
  code: string;
  name: string;
  description?: string;
  websiteUrl?: string;
  isActive?: boolean;
}

export type UpdateManufacturerData = Omit<
  Partial<CreateManufacturerData>,
  "workspaceId" | "code"
>;

@Injectable()
export class ManufacturersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateManufacturerData): Promise<ManufacturerRecord> {
    return this.prisma.manufacturer.create({ data });
  }

  update(
    workspaceId: string,
    code: string,
    data: UpdateManufacturerData,
  ): Promise<ManufacturerRecord> {
    return this.prisma.manufacturer.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data,
    });
  }

  deactivate(workspaceId: string, code: string): Promise<ManufacturerRecord> {
    return this.prisma.manufacturer.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data: { isActive: false },
    });
  }

  findByWorkspace(workspaceId: string): Promise<ManufacturerRecord[]> {
    return this.prisma.manufacturer.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  }

  findByWorkspaceAndCode(
    workspaceId: string,
    code: string,
  ): Promise<ManufacturerRecord | null> {
    return this.prisma.manufacturer.findUnique({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
    });
  }
}
