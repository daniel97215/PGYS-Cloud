import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { MarketingCampaignStatus, MarketingChannel } from "@prisma/client";
import { MarketingSegmentsService } from "../../marketing-segments/marketing-segments.service";
import { MarketingCampaignsRepository } from "../marketing-campaigns.repository";
import { MarketingCampaignsService } from "../marketing-campaigns.service";

describe("MarketingCampaignsService", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const template = { id: "20000000-0000-4000-8000-000000000001", workspaceId, code: "WELCOME", name: "Welcome", channel: MarketingChannel.EMAIL, subject: null, content: "Hello", isActive: true, createdAt: new Date(), updatedAt: new Date() };
  const campaign = { id: "30000000-0000-4000-8000-000000000001", workspaceId, code: "CAMPAIGN", name: "Campaign", description: null, channel: MarketingChannel.EMAIL, status: MarketingCampaignStatus.DRAFT, segmentId: "40000000-0000-4000-8000-000000000001", templateId: template.id, createdAt: new Date(), updatedAt: new Date() };
  let repository: jest.Mocked<MarketingCampaignsRepository>;
  let segments: jest.Mocked<MarketingSegmentsService>;
  let service: MarketingCampaignsService;

  beforeEach(() => {
    repository = { createTemplate: jest.fn().mockResolvedValue(template), updateTemplate: jest.fn().mockResolvedValue(template), findTemplates: jest.fn().mockResolvedValue([template]), findTemplateByCode: jest.fn().mockResolvedValue(template), findTemplateById: jest.fn().mockResolvedValue(template), createCampaign: jest.fn().mockResolvedValue(campaign), findCampaigns: jest.fn().mockResolvedValue([campaign]), findCampaignByCode: jest.fn().mockResolvedValue(campaign), findCampaignById: jest.fn().mockResolvedValue(campaign), updateDraft: jest.fn().mockResolvedValue(campaign), transition: jest.fn().mockResolvedValue(campaign) } as unknown as jest.Mocked<MarketingCampaignsRepository>;
    segments = { getActiveSegmentById: jest.fn().mockResolvedValue({ id: campaign.segmentId, isActive: true }) } as unknown as jest.Mocked<MarketingSegmentsService>;
    service = new MarketingCampaignsService(repository, segments);
  });

  it("creates and deactivates templates without deletion", async () => {
    repository.findTemplateByCode.mockResolvedValueOnce(null);
    await service.createTemplate(workspaceId, { code: "welcome", name: template.name, channel: template.channel, content: template.content });
    expect(repository.createTemplate).toHaveBeenCalledWith({ workspaceId, code: template.code, name: template.name, channel: template.channel, content: template.content });
    await service.deactivateTemplate(workspaceId, template.code);
    expect(repository.updateTemplate).toHaveBeenCalledWith(workspaceId, template.id, { isActive: false });
  });

  it("rejects duplicate template and campaign codes", async () => {
    await expect(service.createTemplate(workspaceId, { code: template.code, name: template.name, channel: template.channel, content: template.content })).rejects.toBeInstanceOf(ConflictException);
    await expect(service.createCampaign(workspaceId, { code: campaign.code, name: campaign.name, channel: campaign.channel, segmentId: campaign.segmentId })).rejects.toBeInstanceOf(ConflictException);
  });

  it("creates a draft campaign after workspace reference validation", async () => {
    repository.findCampaignByCode.mockResolvedValueOnce(null);
    await service.createCampaign(workspaceId, { code: "campaign", name: campaign.name, channel: campaign.channel, segmentId: campaign.segmentId, templateId: template.id });
    expect(segments.getActiveSegmentById).toHaveBeenCalledWith(workspaceId, campaign.segmentId);
    expect(repository.findTemplateById).toHaveBeenCalledWith(workspaceId, template.id);
    expect(repository.createCampaign).toHaveBeenCalledWith({ workspaceId, code: campaign.code, name: campaign.name, channel: campaign.channel, segmentId: campaign.segmentId, templateId: template.id });
  });

  it("rejects missing, inactive or channel-mismatched templates", async () => {
    repository.findCampaignByCode.mockResolvedValue(null);
    repository.findTemplateById.mockResolvedValueOnce(null);
    await expect(service.createCampaign(workspaceId, { code: "A", name: "A", channel: MarketingChannel.EMAIL, segmentId: campaign.segmentId, templateId: template.id })).rejects.toBeInstanceOf(NotFoundException);
    repository.findTemplateById.mockResolvedValueOnce({ ...template, isActive: false });
    await expect(service.createCampaign(workspaceId, { code: "B", name: "B", channel: MarketingChannel.EMAIL, segmentId: campaign.segmentId, templateId: template.id })).rejects.toBeInstanceOf(BadRequestException);
    repository.findTemplateById.mockResolvedValueOnce({ ...template, channel: MarketingChannel.SMS });
    await expect(service.createCampaign(workspaceId, { code: "C", name: "C", channel: MarketingChannel.EMAIL, segmentId: campaign.segmentId, templateId: template.id })).rejects.toThrow("channels must match");
  });

  it("updates only draft campaigns", async () => {
    await service.updateCampaign(workspaceId, campaign.code, { name: "Updated" });
    expect(repository.updateDraft).toHaveBeenCalledWith(workspaceId, campaign.id, { name: "Updated" });
    repository.findCampaignByCode.mockResolvedValueOnce({ ...campaign, status: MarketingCampaignStatus.READY });
    await expect(service.updateCampaign(workspaceId, campaign.code, { name: "Forbidden" })).rejects.toBeInstanceOf(BadRequestException);
  });

  it("requires an active matching template to become ready", async () => {
    await service.markReady(workspaceId, campaign.code);
    expect(repository.transition).toHaveBeenCalledWith(workspaceId, campaign.id, [MarketingCampaignStatus.DRAFT], MarketingCampaignStatus.READY);
    repository.findCampaignByCode.mockResolvedValueOnce({ ...campaign, templateId: null });
    await expect(service.markReady(workspaceId, campaign.code)).rejects.toThrow("template is required");
  });

  it("cancels draft or ready campaigns and keeps cancelled terminal", async () => {
    await service.cancel(workspaceId, campaign.code);
    expect(repository.transition).toHaveBeenCalledWith(workspaceId, campaign.id, [MarketingCampaignStatus.DRAFT, MarketingCampaignStatus.READY], MarketingCampaignStatus.CANCELLED);
    repository.findCampaignByCode.mockResolvedValueOnce({ ...campaign, status: MarketingCampaignStatus.CANCELLED });
    await expect(service.cancel(workspaceId, campaign.code)).rejects.toBeInstanceOf(BadRequestException);
  });

  it("validates the complete context used to activate an automation", async () => {
    repository.findCampaignById.mockResolvedValueOnce({
      ...campaign,
      status: MarketingCampaignStatus.READY,
    });

    await expect(
      service.getAutomationActivationContext(workspaceId, campaign.id),
    ).resolves.toEqual({ ...campaign, status: MarketingCampaignStatus.READY });
    expect(segments.getActiveSegmentById).toHaveBeenCalledWith(
      workspaceId,
      campaign.segmentId,
    );
    expect(repository.findTemplateById).toHaveBeenCalledWith(
      workspaceId,
      template.id,
    );
  });

  it("rejects non-ready campaign activation contexts", async () => {
    await expect(
      service.getAutomationActivationContext(workspaceId, campaign.id),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(segments.getActiveSegmentById).not.toHaveBeenCalled();
  });
});
