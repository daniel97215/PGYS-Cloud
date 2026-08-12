import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { MarketingSegmentsService } from "../marketing-segments/marketing-segments.service";
import { CreateMarketingCampaignDto } from "./dto/create-marketing-campaign.dto";
import { CreateMarketingTemplateDto } from "./dto/create-marketing-template.dto";
import { UpdateMarketingCampaignDto } from "./dto/update-marketing-campaign.dto";
import { UpdateMarketingTemplateDto } from "./dto/update-marketing-template.dto";
import { MarketingCampaignRecord, MarketingCampaignsRepository, MarketingTemplateRecord, UpdateCampaignData } from "./marketing-campaigns.repository";
import { MarketingCampaignStatus, MarketingChannel } from "./marketing-campaigns.types";

const DRAFT: MarketingCampaignStatus = "DRAFT";
const READY: MarketingCampaignStatus = "READY";
const CANCELLED: MarketingCampaignStatus = "CANCELLED";

@Injectable()
export class MarketingCampaignsService {
  constructor(
    private readonly repository: MarketingCampaignsRepository,
    private readonly segmentsService: MarketingSegmentsService,
  ) {}

  async createTemplate(workspaceId: string, data: CreateMarketingTemplateDto): Promise<MarketingTemplateRecord> {
    const code = this.normalizeCode(data.code, "Marketing template");
    if (await this.repository.findTemplateByCode(workspaceId, code)) {
      throw new ConflictException(`Marketing template "${code}" already exists`);
    }
    return this.repository.createTemplate({ ...data, workspaceId, code });
  }

  listTemplates(workspaceId: string) { return this.repository.findTemplates(workspaceId); }
  getTemplate(workspaceId: string, code: string) { return this.requireTemplateByCode(workspaceId, code); }

  async updateTemplate(workspaceId: string, code: string, data: UpdateMarketingTemplateDto): Promise<MarketingTemplateRecord> {
    const template = await this.requireTemplateByCode(workspaceId, code);
    return this.repository.updateTemplate(workspaceId, template.id, data);
  }

  async deactivateTemplate(workspaceId: string, code: string): Promise<void> {
    const template = await this.requireTemplateByCode(workspaceId, code);
    await this.repository.updateTemplate(workspaceId, template.id, { isActive: false });
  }

  async createCampaign(workspaceId: string, data: CreateMarketingCampaignDto): Promise<MarketingCampaignRecord> {
    const code = this.normalizeCode(data.code, "Marketing campaign");
    if (await this.repository.findCampaignByCode(workspaceId, code)) {
      throw new ConflictException(`Marketing campaign "${code}" already exists`);
    }
    await this.segmentsService.getActiveSegmentById(workspaceId, data.segmentId);
    await this.validateTemplate(workspaceId, data.templateId, data.channel);
    return this.repository.createCampaign({ ...data, workspaceId, code });
  }

  listCampaigns(workspaceId: string) { return this.repository.findCampaigns(workspaceId); }
  getCampaign(workspaceId: string, code: string) { return this.requireCampaign(workspaceId, code); }

  async getCampaignById(
    workspaceId: string,
    campaignId: string,
  ): Promise<MarketingCampaignRecord> {
    const campaign = await this.repository.findCampaignById(workspaceId, campaignId);
    if (!campaign) {
      throw new NotFoundException(`Marketing campaign "${campaignId}" not found`);
    }
    return campaign;
  }

  async getAutomationActivationContext(
    workspaceId: string,
    campaignId: string,
  ): Promise<MarketingCampaignRecord> {
    const campaign = await this.getCampaignById(workspaceId, campaignId);

    if (campaign.status !== READY) {
      throw new BadRequestException("Marketing campaign must be ready");
    }

    await this.segmentsService.getActiveSegmentById(workspaceId, campaign.segmentId);

    if (!campaign.templateId) {
      throw new BadRequestException("Ready marketing campaign requires a template");
    }

    await this.validateTemplate(workspaceId, campaign.templateId, campaign.channel);
    return campaign;
  }

  async updateCampaign(workspaceId: string, code: string, data: UpdateMarketingCampaignDto): Promise<MarketingCampaignRecord> {
    const campaign = await this.requireDraftCampaign(workspaceId, code);
    const segmentId = data.segmentId ?? campaign.segmentId;
    const templateId = data.templateId ?? campaign.templateId ?? undefined;
    await this.segmentsService.getActiveSegmentById(workspaceId, segmentId);
    await this.validateTemplate(workspaceId, templateId, campaign.channel);
    const update: UpdateCampaignData = {
      ...(data.name === undefined ? {} : { name: data.name }),
      ...(data.description === undefined ? {} : { description: data.description }),
      ...(data.segmentId === undefined ? {} : { segmentId: data.segmentId }),
      ...(data.templateId === undefined ? {} : { templateId: data.templateId }),
    };
    const result = await this.repository.updateDraft(workspaceId, campaign.id, update);
    if (!result) throw new BadRequestException("Only draft marketing campaigns can be modified");
    return result;
  }

  async markReady(workspaceId: string, code: string): Promise<MarketingCampaignRecord> {
    const campaign = await this.requireDraftCampaign(workspaceId, code);
    await this.segmentsService.getActiveSegmentById(workspaceId, campaign.segmentId);
    if (!campaign.templateId) throw new BadRequestException("A template is required before a campaign can be ready");
    await this.validateTemplate(workspaceId, campaign.templateId, campaign.channel);
    const result = await this.repository.transition(workspaceId, campaign.id, [DRAFT], READY);
    if (!result) throw new BadRequestException("Only draft marketing campaigns can become ready");
    return result;
  }

  async cancel(workspaceId: string, code: string): Promise<MarketingCampaignRecord> {
    const campaign = await this.requireCampaign(workspaceId, code);
    if (campaign.status === CANCELLED) {
      throw new BadRequestException("Cancelled marketing campaigns are immutable");
    }
    const result = await this.repository.transition(
      workspaceId,
      campaign.id,
      [DRAFT, READY],
      CANCELLED,
    );
    if (!result) throw new BadRequestException("Marketing campaign cannot be cancelled");
    return result;
  }

  private async validateTemplate(workspaceId: string, templateId: string | undefined, channel: MarketingChannel): Promise<void> {
    if (!templateId) return;
    const template = await this.repository.findTemplateById(workspaceId, templateId);
    if (!template) throw new NotFoundException(`Marketing template "${templateId}" not found`);
    if (!template.isActive) throw new BadRequestException("Marketing template must be active");
    if (template.channel !== channel) throw new BadRequestException("Campaign and template channels must match");
  }

  private async requireTemplateByCode(workspaceId: string, code: string): Promise<MarketingTemplateRecord> {
    const normalized = this.normalizeCode(code, "Marketing template");
    const template = await this.repository.findTemplateByCode(workspaceId, normalized);
    if (!template) throw new NotFoundException(`Marketing template "${code}" not found`);
    return template;
  }

  private async requireCampaign(workspaceId: string, code: string): Promise<MarketingCampaignRecord> {
    const normalized = this.normalizeCode(code, "Marketing campaign");
    const campaign = await this.repository.findCampaignByCode(workspaceId, normalized);
    if (!campaign) throw new NotFoundException(`Marketing campaign "${code}" not found`);
    return campaign;
  }

  private async requireDraftCampaign(workspaceId: string, code: string) {
    const campaign = await this.requireCampaign(workspaceId, code);
    if (campaign.status !== DRAFT) {
      throw new BadRequestException("Ready or cancelled marketing campaigns are immutable");
    }
    return campaign;
  }

  private normalizeCode(value: string, label: string): string {
    const code = value.trim().toUpperCase();
    if (!code) throw new BadRequestException(`${label} code is required`);
    return code;
  }
}
