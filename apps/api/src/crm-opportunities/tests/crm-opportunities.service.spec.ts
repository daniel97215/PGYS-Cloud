import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import {
  CrmOpportunityStatus,
  CrmPipelineStageType,
  Prisma,
} from "@prisma/client";
import { CrmPipelinesService } from "../../crm-pipelines/crm-pipelines.service";
import { CrmOpportunitiesRepository } from "../crm-opportunities.repository";
import { CrmOpportunitiesService } from "../crm-opportunities.service";

describe("CrmOpportunitiesService", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const id = "20000000-0000-4000-8000-000000000001";
  const pipelineId = "30000000-0000-4000-8000-000000000001";
  const stageId = "40000000-0000-4000-8000-000000000001";
  const businessPartnerId = "50000000-0000-4000-8000-000000000001";
  const opportunity = {
    id,
    workspaceId,
    code: "OPP-001",
    title: "Cloud migration",
    businessPartnerId,
    contactId: null,
    pipelineId,
    stageId,
    amount: new Prisma.Decimal(2500),
    currency: "EUR",
    dueAt: null,
    responsibleMemberId: null,
    status: CrmOpportunityStatus.OPEN,
    createdAt: new Date("2026-08-12T00:00:00.000Z"),
    updatedAt: new Date("2026-08-12T00:00:00.000Z"),
  };
  let repository: jest.Mocked<CrmOpportunitiesRepository>;
  let pipelines: jest.Mocked<CrmPipelinesService>;
  let service: CrmOpportunitiesService;

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(opportunity),
      findByWorkspace: jest.fn().mockResolvedValue([opportunity]),
      findById: jest.fn().mockResolvedValue(opportunity),
      findByCode: jest.fn().mockResolvedValue(null),
      updateOpen: jest.fn().mockResolvedValue(opportunity),
      moveOpenToStage: jest.fn().mockResolvedValue(opportunity),
      businessPartnerExists: jest.fn().mockResolvedValue(true),
      findContact: jest.fn().mockResolvedValue({ id: "contact", businessPartnerId }),
      memberExists: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<CrmOpportunitiesRepository>;
    pipelines = {
      getPipelineStageByIds: jest.fn().mockResolvedValue({
        pipeline: { id: pipelineId, isActive: true },
        stage: { id: stageId, type: CrmPipelineStageType.OPEN, isActive: true },
      }),
    } as unknown as jest.Mocked<CrmPipelinesService>;
    service = new CrmOpportunitiesService(repository, pipelines);
  });

  it("creates an opportunity with status derived from its stage", async () => {
    await service.create(workspaceId, {
      code: "opp-001",
      title: opportunity.title,
      businessPartnerId,
      pipelineId,
      stageId,
      amount: 2500,
      currency: "eur",
    });
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      code: "OPP-001",
      title: opportunity.title,
      businessPartnerId,
      pipelineId,
      stageId,
      amount: new Prisma.Decimal(2500),
      currency: "EUR",
      status: CrmOpportunityStatus.OPEN,
    });
  });

  it("rejects duplicate codes and invalid workspace references", async () => {
    repository.findByCode.mockResolvedValueOnce(opportunity);
    await expect(
      service.create(workspaceId, {
        code: opportunity.code,
        title: opportunity.title,
        businessPartnerId,
        pipelineId,
        stageId,
        currency: "EUR",
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    repository.findByCode.mockResolvedValueOnce(null);
    repository.businessPartnerExists.mockResolvedValueOnce(false);
    await expect(
      service.create(workspaceId, {
        code: "OPP-002",
        title: opportunity.title,
        businessPartnerId,
        pipelineId,
        stageId,
        currency: "EUR",
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects a contact belonging to another business partner", async () => {
    repository.findContact.mockResolvedValueOnce({
      id: "contact",
      businessPartnerId: "60000000-0000-4000-8000-000000000001",
    });
    await expect(
      service.create(workspaceId, {
        code: "OPP-002",
        title: opportunity.title,
        businessPartnerId,
        contactId: "70000000-0000-4000-8000-000000000001",
        pipelineId,
        stageId,
        currency: "EUR",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("updates only open opportunities", async () => {
    await service.update(workspaceId, id, { title: "Updated" });
    expect(repository.updateOpen).toHaveBeenCalledWith(workspaceId, id, {
      title: "Updated",
    });

    repository.findById.mockResolvedValueOnce({
      ...opportunity,
      status: CrmOpportunityStatus.WON,
    });
    await expect(
      service.update(workspaceId, id, { title: "Forbidden" }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("moves within the same pipeline and derives terminal status", async () => {
    pipelines.getPipelineStageByIds.mockResolvedValueOnce({
      pipeline: { id: pipelineId },
      stage: { id: stageId, type: CrmPipelineStageType.WON },
    } as never);
    await service.moveStage(workspaceId, id, { stageId });
    expect(pipelines.getPipelineStageByIds).toHaveBeenCalledWith(
      workspaceId,
      pipelineId,
      stageId,
    );
    expect(repository.moveOpenToStage).toHaveBeenCalledWith(
      workspaceId,
      id,
      stageId,
      CrmOpportunityStatus.WON,
    );
  });

  it("lists and rejects unknown opportunities", async () => {
    await expect(service.list(workspaceId)).resolves.toEqual([opportunity]);
    repository.findById.mockResolvedValueOnce(null);
    await expect(service.get(workspaceId, id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
