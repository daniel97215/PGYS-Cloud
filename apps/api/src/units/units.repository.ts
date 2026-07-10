import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type UnitRecord = Prisma.UnitGetPayload<object>;

export interface CreateUnitData {
  workspaceId: string;
  code: string;
  name: string;
  symbol: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateUnitData = Omit<
  Partial<CreateUnitData>,
  "workspaceId" | "code"
>;

@Injectable()
export class UnitsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateUnitData): Promise<UnitRecord> {
    return this.prisma.unit.create({ data });
  }

  update(
    workspaceId: string,
    code: string,
    data: UpdateUnitData,
  ): Promise<UnitRecord> {
    return this.prisma.unit.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data,
    });
  }

  deactivate(workspaceId: string, code: string): Promise<UnitRecord> {
    return this.prisma.unit.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data: { isActive: false },
    });
  }

  findByWorkspace(workspaceId: string): Promise<UnitRecord[]> {
    return this.prisma.unit.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  }

  findByWorkspaceAndCode(
    workspaceId: string,
    code: string,
  ): Promise<UnitRecord | null> {
    return this.prisma.unit.findUnique({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
    });
  }
}
