import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BusinessPartnerStatus } from "./enums/business-partner-status.enum";
import { BusinessPartnerType } from "./enums/business-partner-type.enum";

export type BusinessPartnerRecord = Prisma.BusinessPartnerGetPayload<object>;

export interface CreateBusinessPartnerData {
  workspaceId: string;
  code: string;
  type: BusinessPartnerType;
  name: string;
  legalName?: string;
  status?: BusinessPartnerStatus;
  notes?: string;
}

export interface UpdateBusinessPartnerData {
  type?: BusinessPartnerType;
  name?: string;
  legalName?: string;
  status?: BusinessPartnerStatus;
  notes?: string;
}

@Injectable()
export class BusinessPartnersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateBusinessPartnerData): Promise<BusinessPartnerRecord> {
    return this.prisma.businessPartner.create({ data });
  }

  update(
    workspaceId: string,
    code: string,
    data: UpdateBusinessPartnerData,
  ): Promise<BusinessPartnerRecord> {
    return this.prisma.businessPartner.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data,
    });
  }

  archive(workspaceId: string, code: string): Promise<BusinessPartnerRecord> {
    return this.prisma.businessPartner.update({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
      data: { status: BusinessPartnerStatus.ARCHIVED },
    });
  }

  findByWorkspace(workspaceId: string): Promise<BusinessPartnerRecord[]> {
    return this.prisma.businessPartner.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  }

  findByWorkspaceAndCode(
    workspaceId: string,
    code: string,
  ): Promise<BusinessPartnerRecord | null> {
    return this.prisma.businessPartner.findUnique({
      where: {
        workspaceId_code: {
          workspaceId,
          code,
        },
      },
    });
  }
}
