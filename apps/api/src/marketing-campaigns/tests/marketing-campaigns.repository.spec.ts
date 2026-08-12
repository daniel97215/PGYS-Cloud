import { MarketingCampaignStatus, MarketingChannel } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { MarketingCampaignsRepository } from "../marketing-campaigns.repository";

describe("MarketingCampaignsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const template = { id: "20000000-0000-4000-8000-000000000001", workspaceId, code: "TPL", name: "Template", channel: MarketingChannel.EMAIL, subject: null, content: "Content", isActive: true, createdAt: new Date(), updatedAt: new Date() };
  const campaign = { id: "30000000-0000-4000-8000-000000000001", workspaceId, code: "CMP", name: "Campaign", description: null, channel: MarketingChannel.EMAIL, status: MarketingCampaignStatus.DRAFT, segmentId: "40000000-0000-4000-8000-000000000001", templateId: template.id, createdAt: new Date(), updatedAt: new Date() };

  it("persists and scopes templates", async () => {
    const templateCreate = jest.fn().mockResolvedValue(template);
    const templateUpdate = jest.fn().mockResolvedValue(template);
    const templateFindFirst = jest.fn().mockResolvedValue(template);
    const prisma = mockPrisma({ templateCreate, templateUpdate, templateFindMany: jest.fn().mockResolvedValue([template]), templateFindUnique: jest.fn().mockResolvedValue(template), templateFindFirst });
    const repository = new MarketingCampaignsRepository(prisma);
    const data = { workspaceId, code: template.code, name: template.name, channel: template.channel, content: template.content };
    await repository.createTemplate(data);
    await repository.updateTemplate(workspaceId, template.id, { isActive: false });
    await repository.findTemplates(workspaceId);
    await repository.findTemplateByCode(workspaceId, template.code);
    await repository.findTemplateById(workspaceId, template.id);
    expect(templateCreate).toHaveBeenCalledWith({ data });
    expect(templateUpdate).toHaveBeenCalledWith({ where: { id: template.id, workspaceId }, data: { isActive: false } });
    expect(templateFindFirst).toHaveBeenCalledWith({ where: { id: template.id, workspaceId } });
  });

  it("persists, scopes and transitions campaigns atomically", async () => {
    const updateManyAndReturn = jest.fn().mockResolvedValue([campaign]);
    const campaignCreate = jest.fn().mockResolvedValue(campaign);
    const prisma = mockPrisma({ campaignCreate, campaignFindMany: jest.fn().mockResolvedValue([campaign]), campaignFindUnique: jest.fn().mockResolvedValue(campaign), campaignUpdateManyAndReturn: updateManyAndReturn });
    const repository = new MarketingCampaignsRepository(prisma);
    const data = { workspaceId, code: campaign.code, name: campaign.name, channel: campaign.channel, segmentId: campaign.segmentId, templateId: campaign.templateId };
    await repository.createCampaign(data);
    await repository.findCampaigns(workspaceId);
    await repository.findCampaignByCode(workspaceId, campaign.code);
    await repository.updateDraft(workspaceId, campaign.id, { name: "Updated" });
    await repository.transition(workspaceId, campaign.id, [MarketingCampaignStatus.DRAFT], MarketingCampaignStatus.READY);
    expect(campaignCreate).toHaveBeenCalledWith({ data });
    expect(updateManyAndReturn).toHaveBeenNthCalledWith(1, { where: { id: campaign.id, workspaceId, status: MarketingCampaignStatus.DRAFT }, data: { name: "Updated" } });
    expect(updateManyAndReturn).toHaveBeenNthCalledWith(2, { where: { id: campaign.id, workspaceId, status: { in: [MarketingCampaignStatus.DRAFT] } }, data: { status: MarketingCampaignStatus.READY } });
  });

  it("finds a campaign by id within the workspace", async () => {
    const campaignFindFirst = jest.fn().mockResolvedValue(campaign);
    const repository = new MarketingCampaignsRepository(
      mockPrisma({ campaignFindFirst }),
    );

    await expect(
      repository.findCampaignById(workspaceId, campaign.id),
    ).resolves.toEqual(campaign);
    expect(campaignFindFirst).toHaveBeenCalledWith({
      where: { id: campaign.id, workspaceId },
    });
  });
});

function mockPrisma(m: Record<string, jest.Mock>): PrismaService {
  return { marketingTemplate: { create: m.templateCreate ?? jest.fn(), update: m.templateUpdate ?? jest.fn(), findMany: m.templateFindMany ?? jest.fn(), findUnique: m.templateFindUnique ?? jest.fn(), findFirst: m.templateFindFirst ?? jest.fn() }, marketingCampaign: { create: m.campaignCreate ?? jest.fn(), findMany: m.campaignFindMany ?? jest.fn(), findUnique: m.campaignFindUnique ?? jest.fn(), findFirst: m.campaignFindFirst ?? jest.fn(), updateManyAndReturn: m.campaignUpdateManyAndReturn ?? jest.fn() } } as unknown as PrismaService;
}
