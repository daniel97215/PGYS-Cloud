import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { MarketingCampaignsService } from "../marketing-campaigns/marketing-campaigns.service";
import { CreateMarketingAutomationDto } from "./dto/create-marketing-automation.dto";
import { UpdateMarketingAutomationDto } from "./dto/update-marketing-automation.dto";
import { MarketingAutomationRecord, MarketingAutomationsRepository, UpdateMarketingAutomationData } from "./marketing-automations.repository";
import { MarketingAutomationStatus } from "./marketing-automations.types";

const DRAFT: MarketingAutomationStatus = "DRAFT";
const ACTIVE: MarketingAutomationStatus = "ACTIVE";
const INACTIVE: MarketingAutomationStatus = "INACTIVE";

@Injectable()
export class MarketingAutomationsService {
  constructor(private readonly repository: MarketingAutomationsRepository, private readonly campaignsService: MarketingCampaignsService) {}

  async create(workspaceId: string, data: CreateMarketingAutomationDto): Promise<MarketingAutomationRecord> {
    const code = this.normalizeCode(data.code);
    if (await this.repository.findByCode(workspaceId, code)) throw new ConflictException(`Marketing automation "${code}" already exists`);
    await this.campaignsService.getCampaignById(workspaceId, data.campaignId);
    return this.repository.create({ ...data, workspaceId, code, action: data.action ?? "ENROLL_IN_CAMPAIGN" });
  }

  list(workspaceId: string) { return this.repository.findByWorkspace(workspaceId); }
  get(workspaceId: string, code: string) { return this.requireAutomation(workspaceId, code); }

  async update(workspaceId: string, code: string, data: UpdateMarketingAutomationDto): Promise<MarketingAutomationRecord> {
    const automation = await this.requireDraft(workspaceId, code);
    if (data.campaignId) await this.campaignsService.getCampaignById(workspaceId, data.campaignId);
    const update: UpdateMarketingAutomationData = { ...(data.name === undefined ? {} : { name: data.name }), ...(data.description === undefined ? {} : { description: data.description }), ...(data.trigger === undefined ? {} : { trigger: data.trigger }), ...(data.campaignId === undefined ? {} : { campaignId: data.campaignId }) };
    const result = await this.repository.updateDraft(workspaceId, automation.id, update);
    if (!result) throw new BadRequestException("Only draft marketing automations can be modified");
    return result;
  }

  async activate(workspaceId: string, code: string): Promise<MarketingAutomationRecord> {
    const automation = await this.requireAutomation(workspaceId, code);
    if (automation.status === ACTIVE) throw new BadRequestException("Marketing automation is already active");
    await this.campaignsService.getAutomationActivationContext(workspaceId, automation.campaignId);
    const result = await this.repository.transition(workspaceId, automation.id, [DRAFT, INACTIVE], ACTIVE);
    if (!result) throw new BadRequestException("Marketing automation cannot be activated");
    return result;
  }

  async deactivate(workspaceId: string, code: string): Promise<MarketingAutomationRecord> {
    const automation = await this.requireAutomation(workspaceId, code);
    if (automation.status === INACTIVE) throw new BadRequestException("Marketing automation is already inactive");
    const result = await this.repository.transition(workspaceId, automation.id, [DRAFT, ACTIVE], INACTIVE);
    if (!result) throw new BadRequestException("Marketing automation cannot be deactivated");
    return result;
  }

  private async requireAutomation(workspaceId: string, code: string) {
    const normalized = this.normalizeCode(code);
    const automation = await this.repository.findByCode(workspaceId, normalized);
    if (!automation) throw new NotFoundException(`Marketing automation "${code}" not found`);
    return automation;
  }
  private async requireDraft(workspaceId: string, code: string) {
    const automation = await this.requireAutomation(workspaceId, code);
    if (automation.status !== DRAFT) throw new BadRequestException("Active or inactive marketing automations are immutable");
    return automation;
  }
  private normalizeCode(value: string) { const code = value.trim().toUpperCase(); if (!code) throw new BadRequestException("Marketing automation code is required"); return code; }
}
