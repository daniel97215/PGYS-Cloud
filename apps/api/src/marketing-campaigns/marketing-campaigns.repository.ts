import { Injectable } from "@nestjs/common";
import {
  MarketingCampaignStatus as PrismaMarketingCampaignStatus,
  MarketingChannel as PrismaMarketingChannel,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { MarketingCampaignStatus, MarketingChannel } from "./marketing-campaigns.types";

export type MarketingTemplateRecord = Prisma.MarketingTemplateGetPayload<object>;
export type MarketingCampaignRecord = Prisma.MarketingCampaignGetPayload<object>;

export interface CreateTemplateData { workspaceId: string; code: string; name: string; channel: MarketingChannel; subject?: string; content: string; isActive?: boolean; }
export type UpdateTemplateData = Omit<Partial<CreateTemplateData>, "workspaceId" | "code" | "channel">;
export interface CreateCampaignData { workspaceId: string; code: string; name: string; description?: string; channel: MarketingChannel; segmentId: string; templateId?: string; }
export type UpdateCampaignData = Omit<Partial<CreateCampaignData>, "workspaceId" | "code" | "channel">;

@Injectable()
export class MarketingCampaignsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createTemplate(data: CreateTemplateData) { return this.prisma.marketingTemplate.create({ data: { ...data, channel: data.channel as PrismaMarketingChannel } }); }
  updateTemplate(workspaceId: string, id: string, data: UpdateTemplateData) { return this.prisma.marketingTemplate.update({ where: { id, workspaceId }, data }); }
  findTemplates(workspaceId: string) { return this.prisma.marketingTemplate.findMany({ where: { workspaceId }, orderBy: [{ name: "asc" }, { code: "asc" }] }); }
  findTemplateByCode(workspaceId: string, code: string) { return this.prisma.marketingTemplate.findUnique({ where: { workspaceId_code: { workspaceId, code } } }); }
  findTemplateById(workspaceId: string, id: string) { return this.prisma.marketingTemplate.findFirst({ where: { id, workspaceId } }); }

  createCampaign(data: CreateCampaignData) { return this.prisma.marketingCampaign.create({ data: { ...data, channel: data.channel as PrismaMarketingChannel } }); }
  findCampaigns(workspaceId: string) { return this.prisma.marketingCampaign.findMany({ where: { workspaceId }, orderBy: [{ createdAt: "desc" }, { code: "asc" }] }); }
  findCampaignByCode(workspaceId: string, code: string) { return this.prisma.marketingCampaign.findUnique({ where: { workspaceId_code: { workspaceId, code } } }); }
  findCampaignById(workspaceId: string, id: string) { return this.prisma.marketingCampaign.findFirst({ where: { id, workspaceId } }); }
  async updateDraft(workspaceId: string, id: string, data: UpdateCampaignData): Promise<MarketingCampaignRecord | null> {
    const rows = await this.prisma.marketingCampaign.updateManyAndReturn({ where: { id, workspaceId, status: PrismaMarketingCampaignStatus.DRAFT }, data });
    return rows[0] ?? null;
  }
  async transition(workspaceId: string, id: string, from: MarketingCampaignStatus[], to: MarketingCampaignStatus): Promise<MarketingCampaignRecord | null> {
    const rows = await this.prisma.marketingCampaign.updateManyAndReturn({
      where: { id, workspaceId, status: { in: from as PrismaMarketingCampaignStatus[] } },
      data: { status: to as PrismaMarketingCampaignStatus },
    });
    return rows[0] ?? null;
  }
}
