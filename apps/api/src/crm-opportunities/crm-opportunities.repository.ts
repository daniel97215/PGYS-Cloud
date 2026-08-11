import { Injectable } from "@nestjs/common";
import { CrmOpportunityStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type CrmOpportunityRecord = Prisma.CrmOpportunityGetPayload<object>;

export interface CreateCrmOpportunityData {
  workspaceId: string;
  code: string;
  title: string;
  businessPartnerId: string;
  contactId?: string;
  pipelineId: string;
  stageId: string;
  amount?: Prisma.Decimal;
  currency: string;
  dueAt?: Date;
  responsibleMemberId?: string;
  status: CrmOpportunityStatus;
}

export type UpdateCrmOpportunityData = Partial<
  Pick<
    CreateCrmOpportunityData,
    | "title"
    | "contactId"
    | "amount"
    | "currency"
    | "dueAt"
    | "responsibleMemberId"
  >
>;

@Injectable()
export class CrmOpportunitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateCrmOpportunityData): Promise<CrmOpportunityRecord> {
    return this.prisma.crmOpportunity.create({ data });
  }

  findByWorkspace(workspaceId: string): Promise<CrmOpportunityRecord[]> {
    return this.prisma.crmOpportunity.findMany({
      where: { workspaceId },
      orderBy: [{ createdAt: "desc" }, { code: "asc" }],
    });
  }

  findById(
    workspaceId: string,
    id: string,
  ): Promise<CrmOpportunityRecord | null> {
    return this.prisma.crmOpportunity.findFirst({
      where: { id, workspaceId },
    });
  }

  findByCode(
    workspaceId: string,
    code: string,
  ): Promise<CrmOpportunityRecord | null> {
    return this.prisma.crmOpportunity.findUnique({
      where: { workspaceId_code: { workspaceId, code } },
    });
  }

  async updateOpen(
    workspaceId: string,
    id: string,
    data: UpdateCrmOpportunityData,
  ): Promise<CrmOpportunityRecord | null> {
    const opportunities = await this.prisma.crmOpportunity.updateManyAndReturn({
      where: { id, workspaceId, status: CrmOpportunityStatus.OPEN },
      data,
    });

    return opportunities[0] ?? null;
  }

  async moveOpenToStage(
    workspaceId: string,
    id: string,
    stageId: string,
    status: CrmOpportunityStatus,
  ): Promise<CrmOpportunityRecord | null> {
    const opportunities = await this.prisma.crmOpportunity.updateManyAndReturn({
      where: { id, workspaceId, status: CrmOpportunityStatus.OPEN },
      data: { stageId, status },
    });

    return opportunities[0] ?? null;
  }

  async businessPartnerExists(
    workspaceId: string,
    businessPartnerId: string,
  ): Promise<boolean> {
    const partner = await this.prisma.businessPartner.findFirst({
      where: { id: businessPartnerId, workspaceId },
      select: { id: true },
    });
    return partner !== null;
  }

  findContact(
    workspaceId: string,
    contactId: string,
  ): Promise<{ id: string; businessPartnerId: string } | null> {
    return this.prisma.businessPartnerContact.findFirst({
      where: { id: contactId, workspaceId },
      select: { id: true, businessPartnerId: true },
    });
  }

  async memberExists(
    workspaceId: string,
    memberId: string,
  ): Promise<boolean> {
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, workspaceId },
      select: { id: true },
    });
    return member !== null;
  }
}
