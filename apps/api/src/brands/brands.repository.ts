import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type BrandRecord = Prisma.BrandGetPayload<object>;

export interface CreateBrandData {
  workspaceId: string;
  code: string;
  name: string;
  description?: string;
  websiteUrl?: string;
  isActive?: boolean;
}

export type UpdateBrandData = Omit<
  Partial<CreateBrandData>,
  "workspaceId" | "code"
>;

@Injectable()
export class BrandsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateBrandData): Promise<BrandRecord> {
    return this.prisma.brand.create({ data });
  }

  update(
    workspaceId: string,
    code: string,
    data: UpdateBrandData,
  ): Promise<BrandRecord> {
    return this.prisma.brand.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data,
    });
  }

  deactivate(workspaceId: string, code: string): Promise<BrandRecord> {
    return this.prisma.brand.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data: { isActive: false },
    });
  }

  findByWorkspace(workspaceId: string): Promise<BrandRecord[]> {
    return this.prisma.brand.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  }

  findByWorkspaceAndCode(
    workspaceId: string,
    code: string,
  ): Promise<BrandRecord | null> {
    return this.prisma.brand.findUnique({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
    });
  }
}
