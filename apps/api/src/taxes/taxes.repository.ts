import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type TaxRecord = Prisma.TaxGetPayload<object>;

export interface CreateTaxData {
  workspaceId: string;
  code: string;
  name: string;
  rate: Prisma.Decimal | number | string;
  isDefault?: boolean;
  isActive?: boolean;
}

export type UpdateTaxData = Omit<
  Partial<CreateTaxData>,
  "workspaceId" | "code"
>;

@Injectable()
export class TaxesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTaxData): Promise<TaxRecord> {
    return this.prisma.tax.create({ data });
  }

  update(
    workspaceId: string,
    code: string,
    data: UpdateTaxData,
  ): Promise<TaxRecord> {
    return this.prisma.tax.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data,
    });
  }

  deactivate(workspaceId: string, code: string): Promise<TaxRecord> {
    return this.prisma.tax.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data: { isActive: false },
    });
  }

  findByWorkspace(workspaceId: string): Promise<TaxRecord[]> {
    return this.prisma.tax.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  }

  findByWorkspaceAndCode(
    workspaceId: string,
    code: string,
  ): Promise<TaxRecord | null> {
    return this.prisma.tax.findUnique({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
    });
  }
}
