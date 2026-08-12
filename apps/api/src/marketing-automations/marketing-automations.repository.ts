import { Injectable } from "@nestjs/common";
import {
  MarketingAutomationAction as PrismaMarketingAutomationAction,
  MarketingAutomationStatus as PrismaMarketingAutomationStatus,
  MarketingAutomationTrigger as PrismaMarketingAutomationTrigger,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { MarketingAutomationAction, MarketingAutomationStatus, MarketingAutomationTrigger } from "./marketing-automations.types";

export type MarketingAutomationRecord = Prisma.MarketingAutomationGetPayload<object>;
export interface CreateMarketingAutomationData { workspaceId: string; code: string; name: string; description?: string; trigger: MarketingAutomationTrigger; action: MarketingAutomationAction; campaignId: string; }
export type UpdateMarketingAutomationData = Omit<Partial<CreateMarketingAutomationData>, "workspaceId" | "code" | "action">;

@Injectable()
export class MarketingAutomationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateMarketingAutomationData) {
    return this.prisma.marketingAutomation.create({ data: { ...data, trigger: data.trigger as PrismaMarketingAutomationTrigger, action: data.action as PrismaMarketingAutomationAction } });
  }
  findByWorkspace(workspaceId: string) { return this.prisma.marketingAutomation.findMany({ where: { workspaceId }, orderBy: [{ name: "asc" }, { code: "asc" }] }); }
  findByCode(workspaceId: string, code: string) { return this.prisma.marketingAutomation.findUnique({ where: { workspaceId_code: { workspaceId, code } } }); }
  async updateDraft(workspaceId: string, id: string, data: UpdateMarketingAutomationData): Promise<MarketingAutomationRecord | null> {
    const rows = await this.prisma.marketingAutomation.updateManyAndReturn({ where: { id, workspaceId, status: PrismaMarketingAutomationStatus.DRAFT }, data: { ...data, ...(data.trigger === undefined ? {} : { trigger: data.trigger as PrismaMarketingAutomationTrigger }) } });
    return rows[0] ?? null;
  }
  async transition(workspaceId: string, id: string, from: MarketingAutomationStatus[], to: MarketingAutomationStatus): Promise<MarketingAutomationRecord | null> {
    const rows = await this.prisma.marketingAutomation.updateManyAndReturn({ where: { id, workspaceId, status: { in: from as PrismaMarketingAutomationStatus[] } }, data: { status: to as PrismaMarketingAutomationStatus } });
    return rows[0] ?? null;
  }
}
