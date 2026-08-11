import { Injectable } from "@nestjs/common";
import { CrmActivityStatus, CrmActivityType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type CrmActivityRecord = Prisma.CrmActivityGetPayload<object>;

export interface CreateCrmActivityData {
  workspaceId: string;
  businessPartnerId: string;
  opportunityId?: string;
  contactId?: string;
  responsibleMemberId?: string;
  type: CrmActivityType;
  title: string;
  description?: string;
  scheduledAt?: Date;
}

export type UpdateCrmActivityData = Partial<
  Omit<CreateCrmActivityData, "workspaceId" | "businessPartnerId">
>;

@Injectable()
export class CrmActivitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateCrmActivityData): Promise<CrmActivityRecord> {
    return this.prisma.crmActivity.create({ data });
  }

  findByWorkspace(workspaceId: string): Promise<CrmActivityRecord[]> {
    return this.prisma.crmActivity.findMany({
      where: { workspaceId },
      orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    });
  }

  findById(
    workspaceId: string,
    id: string,
  ): Promise<CrmActivityRecord | null> {
    return this.prisma.crmActivity.findFirst({
      where: { id, workspaceId },
    });
  }

  async updatePlanned(
    workspaceId: string,
    id: string,
    data: UpdateCrmActivityData,
  ): Promise<CrmActivityRecord | null> {
    const activities = await this.prisma.crmActivity.updateManyAndReturn({
      where: { id, workspaceId, status: CrmActivityStatus.PLANNED },
      data,
    });
    return activities[0] ?? null;
  }

  async transitionPlanned(
    workspaceId: string,
    id: string,
    status: CrmActivityStatus,
    completedAt: Date | null,
  ): Promise<CrmActivityRecord | null> {
    const activities = await this.prisma.crmActivity.updateManyAndReturn({
      where: { id, workspaceId, status: CrmActivityStatus.PLANNED },
      data: { status, completedAt },
    });
    return activities[0] ?? null;
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
