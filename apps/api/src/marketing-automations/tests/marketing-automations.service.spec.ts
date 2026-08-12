import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { MarketingCampaignsService } from "../../marketing-campaigns/marketing-campaigns.service";
import { MarketingAutomationsRepository } from "../marketing-automations.repository";
import { MarketingAutomationsService } from "../marketing-automations.service";

describe("MarketingAutomationsService", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const automation = { id: "20000000-0000-4000-8000-000000000001", workspaceId, code: "WELCOME", name: "Welcome", description: null, status: "DRAFT", trigger: "BUSINESS_PARTNER_CREATED", action: "ENROLL_IN_CAMPAIGN", campaignId: "30000000-0000-4000-8000-000000000001", createdAt: new Date(), updatedAt: new Date() } as const;
  let repository: jest.Mocked<MarketingAutomationsRepository>;
  let campaigns: jest.Mocked<MarketingCampaignsService>;
  let service: MarketingAutomationsService;

  beforeEach(() => {
    repository = { create: jest.fn().mockResolvedValue(automation), findByWorkspace: jest.fn().mockResolvedValue([automation]), findByCode: jest.fn().mockResolvedValue(automation), updateDraft: jest.fn().mockResolvedValue(automation), transition: jest.fn().mockResolvedValue(automation) } as unknown as jest.Mocked<MarketingAutomationsRepository>;
    campaigns = { getCampaignById: jest.fn().mockResolvedValue({ id: automation.campaignId }), getAutomationActivationContext: jest.fn().mockResolvedValue({ id: automation.campaignId }) } as unknown as jest.Mocked<MarketingCampaignsService>;
    service = new MarketingAutomationsService(repository, campaigns);
  });

  it("creates a draft definition without executing it", async () => {
    repository.findByCode.mockResolvedValueOnce(null);
    await service.create(workspaceId, { code: "welcome", name: automation.name, trigger: automation.trigger, campaignId: automation.campaignId });
    expect(campaigns.getCampaignById).toHaveBeenCalledWith(workspaceId, automation.campaignId);
    expect(repository.create).toHaveBeenCalledWith({ workspaceId, code: automation.code, name: automation.name, trigger: automation.trigger, campaignId: automation.campaignId, action: "ENROLL_IN_CAMPAIGN" });
  });

  it("rejects duplicates and unknown workspace campaigns", async () => {
    await expect(service.create(workspaceId, { code: automation.code, name: automation.name, trigger: automation.trigger, campaignId: automation.campaignId })).rejects.toBeInstanceOf(ConflictException);
    repository.findByCode.mockResolvedValueOnce(null);
    campaigns.getCampaignById.mockRejectedValueOnce(new NotFoundException());
    await expect(service.create(workspaceId, { code: "OTHER", name: automation.name, trigger: automation.trigger, campaignId: automation.campaignId })).rejects.toBeInstanceOf(NotFoundException);
  });

  it("updates only draft definitions", async () => {
    await service.update(workspaceId, automation.code, { name: "Updated" });
    expect(repository.updateDraft).toHaveBeenCalledWith(workspaceId, automation.id, { name: "Updated" });
    repository.findByCode.mockResolvedValueOnce({ ...automation, status: "ACTIVE" });
    await expect(service.update(workspaceId, automation.code, { name: "Forbidden" })).rejects.toBeInstanceOf(BadRequestException);
  });

  it("validates dependencies on initial activation and reactivation", async () => {
    await service.activate(workspaceId, automation.code);
    expect(campaigns.getAutomationActivationContext).toHaveBeenCalledWith(workspaceId, automation.campaignId);
    expect(repository.transition).toHaveBeenCalledWith(workspaceId, automation.id, ["DRAFT", "INACTIVE"], "ACTIVE");
    campaigns.getAutomationActivationContext.mockRejectedValueOnce(new BadRequestException());
    repository.findByCode.mockResolvedValueOnce({ ...automation, status: "INACTIVE" });
    await expect(service.activate(workspaceId, automation.code)).rejects.toBeInstanceOf(BadRequestException);
  });

  it("deactivates draft or active definitions without dependency checks", async () => {
    await service.deactivate(workspaceId, automation.code);
    expect(repository.transition).toHaveBeenCalledWith(workspaceId, automation.id, ["DRAFT", "ACTIVE"], "INACTIVE");
    expect(campaigns.getAutomationActivationContext).not.toHaveBeenCalled();
  });
});
