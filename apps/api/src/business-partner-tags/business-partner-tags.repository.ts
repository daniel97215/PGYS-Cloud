import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type BusinessPartnerTagRecord =
  Prisma.BusinessPartnerTagGetPayload<object>;

export interface CreateBusinessPartnerTagData {
  workspaceId: string;
  code: string;
  name: string;
  color?: string;
  isSystem?: boolean;
  isActive?: boolean;
}

export type UpdateBusinessPartnerTagData = Omit<
  Partial<CreateBusinessPartnerTagData>,
  "workspaceId" | "code"
>;

@Injectable()
export class BusinessPartnerTagsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateBusinessPartnerTagData): Promise<BusinessPartnerTagRecord> {
    return this.prisma.businessPartnerTag.create({ data });
  }

  update(
    workspaceId: string,
    code: string,
    data: UpdateBusinessPartnerTagData,
  ): Promise<BusinessPartnerTagRecord> {
    return this.prisma.businessPartnerTag.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data,
    });
  }

  disable(workspaceId: string, code: string): Promise<BusinessPartnerTagRecord> {
    return this.prisma.businessPartnerTag.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data: { isActive: false },
    });
  }

  findByWorkspace(workspaceId: string): Promise<BusinessPartnerTagRecord[]> {
    return this.prisma.businessPartnerTag.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  }

  findByWorkspaceAndCode(
    workspaceId: string,
    code: string,
  ): Promise<BusinessPartnerTagRecord | null> {
    return this.prisma.businessPartnerTag.findUnique({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
    });
  }
}
