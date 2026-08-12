import { PrismaService } from "../../prisma/prisma.service";
import { MarketingAutomationsRepository } from "../marketing-automations.repository";

describe("MarketingAutomationsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const automation = { id: "20000000-0000-4000-8000-000000000001", workspaceId, code: "WELCOME", name: "Welcome", description: null, status: "DRAFT", trigger: "BUSINESS_PARTNER_CREATED", action: "ENROLL_IN_CAMPAIGN", campaignId: "30000000-0000-4000-8000-000000000001", createdAt: new Date(), updatedAt: new Date() };

  it("creates and lists workspace automation definitions", async () => {
    const create = jest.fn().mockResolvedValue(automation);
    const findMany = jest.fn().mockResolvedValue([automation]);
    const repository = new MarketingAutomationsRepository(mockPrisma({ create, findMany }));
    const data = { workspaceId, code: automation.code, name: automation.name, trigger: "BUSINESS_PARTNER_CREATED" as const, action: "ENROLL_IN_CAMPAIGN" as const, campaignId: automation.campaignId };
    await repository.create(data);
    await repository.findByWorkspace(workspaceId);
    expect(create).toHaveBeenCalledWith({ data });
    expect(findMany).toHaveBeenCalledWith({ where: { workspaceId }, orderBy: [{ name: "asc" }, { code: "asc" }] });
  });

  it("finds, updates drafts and transitions workspace definitions", async () => {
    const findUnique = jest.fn().mockResolvedValue(automation);
    const updateManyAndReturn = jest.fn().mockResolvedValue([automation]);
    const repository = new MarketingAutomationsRepository(mockPrisma({ findUnique, updateManyAndReturn }));
    await repository.findByCode(workspaceId, automation.code);
    await repository.updateDraft(workspaceId, automation.id, { name: "Updated" });
    await repository.transition(workspaceId, automation.id, ["DRAFT", "INACTIVE"], "ACTIVE");
    expect(findUnique).toHaveBeenCalledWith({ where: { workspaceId_code: { workspaceId, code: automation.code } } });
    expect(updateManyAndReturn).toHaveBeenNthCalledWith(1, { where: { id: automation.id, workspaceId, status: "DRAFT" }, data: { name: "Updated" } });
    expect(updateManyAndReturn).toHaveBeenNthCalledWith(2, { where: { id: automation.id, workspaceId, status: { in: ["DRAFT", "INACTIVE"] } }, data: { status: "ACTIVE" } });
  });
});

function mockPrisma(m: Record<string, jest.Mock>): PrismaService { return { marketingAutomation: { create: m.create ?? jest.fn(), findMany: m.findMany ?? jest.fn(), findUnique: m.findUnique ?? jest.fn(), updateManyAndReturn: m.updateManyAndReturn ?? jest.fn() } } as unknown as PrismaService; }
