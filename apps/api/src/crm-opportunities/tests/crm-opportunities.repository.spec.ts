import { CrmOpportunityStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CrmOpportunitiesRepository } from "../crm-opportunities.repository";

describe("CrmOpportunitiesRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const id = "20000000-0000-4000-8000-000000000001";
  const opportunity = {
    id,
    workspaceId,
    code: "OPP-001",
    title: "Cloud migration",
    businessPartnerId: "30000000-0000-4000-8000-000000000001",
    contactId: null,
    pipelineId: "40000000-0000-4000-8000-000000000001",
    stageId: "50000000-0000-4000-8000-000000000001",
    amount: new Prisma.Decimal(2500),
    currency: "EUR",
    dueAt: null,
    responsibleMemberId: null,
    status: CrmOpportunityStatus.OPEN,
    createdAt: new Date("2026-08-12T00:00:00.000Z"),
    updatedAt: new Date("2026-08-12T00:00:00.000Z"),
  };

  it("creates and lists workspace opportunities", async () => {
    const create = jest.fn().mockResolvedValue(opportunity);
    const findMany = jest.fn().mockResolvedValue([opportunity]);
    const repository = new CrmOpportunitiesRepository(
      mockPrisma({ create, findMany }),
    );
    const data = {
      workspaceId,
      code: opportunity.code,
      title: opportunity.title,
      businessPartnerId: opportunity.businessPartnerId,
      pipelineId: opportunity.pipelineId,
      stageId: opportunity.stageId,
      currency: opportunity.currency,
      status: opportunity.status,
    };

    await expect(repository.create(data)).resolves.toEqual(opportunity);
    await expect(repository.findByWorkspace(workspaceId)).resolves.toEqual([
      opportunity,
    ]);
    expect(create).toHaveBeenCalledWith({ data });
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ createdAt: "desc" }, { code: "asc" }],
    });
  });

  it("finds opportunities by workspace id and code", async () => {
    const findFirst = jest.fn().mockResolvedValue(opportunity);
    const findUnique = jest.fn().mockResolvedValue(opportunity);
    const repository = new CrmOpportunitiesRepository(
      mockPrisma({ findFirst, findUnique }),
    );

    await repository.findById(workspaceId, id);
    await repository.findByCode(workspaceId, opportunity.code);
    expect(findFirst).toHaveBeenCalledWith({ where: { id, workspaceId } });
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_code: { workspaceId, code: opportunity.code },
      },
    });
  });

  it("updates and moves only open opportunities", async () => {
    const updateManyAndReturn = jest.fn().mockResolvedValue([opportunity]);
    const repository = new CrmOpportunitiesRepository(
      mockPrisma({ updateManyAndReturn }),
    );

    await repository.updateOpen(workspaceId, id, { title: "Updated" });
    await repository.moveOpenToStage(
      workspaceId,
      id,
      opportunity.stageId,
      CrmOpportunityStatus.WON,
    );
    expect(updateManyAndReturn).toHaveBeenNthCalledWith(1, {
      where: { id, workspaceId, status: CrmOpportunityStatus.OPEN },
      data: { title: "Updated" },
    });
    expect(updateManyAndReturn).toHaveBeenNthCalledWith(2, {
      where: { id, workspaceId, status: CrmOpportunityStatus.OPEN },
      data: {
        stageId: opportunity.stageId,
        status: CrmOpportunityStatus.WON,
      },
    });
  });

  it("validates workspace-scoped business partner, contact, and member references", async () => {
    const businessPartnerFindFirst = jest.fn().mockResolvedValue({ id: "bp" });
    const contactFindFirst = jest.fn().mockResolvedValue({
      id: "contact",
      businessPartnerId: opportunity.businessPartnerId,
    });
    const memberFindFirst = jest.fn().mockResolvedValue({ id: "member" });
    const repository = new CrmOpportunitiesRepository(
      mockPrisma({
        businessPartnerFindFirst,
        contactFindFirst,
        memberFindFirst,
      }),
    );

    await expect(
      repository.businessPartnerExists(workspaceId, opportunity.businessPartnerId),
    ).resolves.toBe(true);
    await repository.findContact(workspaceId, "contact");
    await expect(repository.memberExists(workspaceId, "member")).resolves.toBe(
      true,
    );
    expect(contactFindFirst).toHaveBeenCalledWith({
      where: { id: "contact", workspaceId },
      select: { id: true, businessPartnerId: true },
    });
  });
});

function mockPrisma(methods: Record<string, jest.Mock>): PrismaService {
  return {
    crmOpportunity: {
      create: methods.create ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findFirst: methods.findFirst ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
      updateManyAndReturn: methods.updateManyAndReturn ?? jest.fn(),
    },
    businessPartner: {
      findFirst: methods.businessPartnerFindFirst ?? jest.fn(),
    },
    businessPartnerContact: {
      findFirst: methods.contactFindFirst ?? jest.fn(),
    },
    member: { findFirst: methods.memberFindFirst ?? jest.fn() },
  } as unknown as PrismaService;
}
