import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export const INITIAL_BUSINESS_PARTNER_ROLE_CODES = [
  "CUSTOMER",
  "PROSPECT",
  "SUPPLIER",
  "PRODUCER",
  "PARTNER",
  "RESELLER",
  "CARRIER",
  "EMPLOYEE",
  "SUBCONTRACTOR",
] as const;

export type InitialBusinessPartnerRoleCode =
  (typeof INITIAL_BUSINESS_PARTNER_ROLE_CODES)[number];

export type BusinessPartnerRoleRecord =
  Prisma.BusinessPartnerRoleGetPayload<object>;

export interface CreateBusinessPartnerRoleData {
  workspaceId: string;
  code: string;
  name: string;
  description?: string;
  isSystem?: boolean;
  isActive?: boolean;
}

export type UpdateBusinessPartnerRoleData = Omit<
  Partial<CreateBusinessPartnerRoleData>,
  "workspaceId" | "code"
>;

@Injectable()
export class BusinessPartnerRolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateBusinessPartnerRoleData): Promise<BusinessPartnerRoleRecord> {
    return this.prisma.businessPartnerRole.create({ data });
  }

  update(
    workspaceId: string,
    code: string,
    data: UpdateBusinessPartnerRoleData,
  ): Promise<BusinessPartnerRoleRecord> {
    return this.prisma.businessPartnerRole.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data,
    });
  }

  disable(workspaceId: string, code: string): Promise<BusinessPartnerRoleRecord> {
    return this.prisma.businessPartnerRole.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data: { isActive: false },
    });
  }

  findByWorkspace(workspaceId: string): Promise<BusinessPartnerRoleRecord[]> {
    return this.prisma.businessPartnerRole.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  }

  findByWorkspaceAndCode(
    workspaceId: string,
    code: string,
  ): Promise<BusinessPartnerRoleRecord | null> {
    return this.prisma.businessPartnerRole.findUnique({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
    });
  }
}
