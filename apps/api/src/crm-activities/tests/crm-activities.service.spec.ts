import { BadRequestException, NotFoundException } from "@nestjs/common";
import {
  CrmActivityStatus,
  CrmActivityType,
  CrmOpportunityStatus,
  Prisma,
} from "@prisma/client";
import { CrmOpportunitiesService } from "../../crm-opportunities/crm-opportunities.service";
import { CrmActivitiesRepository } from "../crm-activities.repository";
import { CrmActivitiesService } from "../crm-activities.service";

describe("CrmActivitiesService", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const id = "20000000-0000-4000-8000-000000000001";
  const businessPartnerId = "30000000-0000-4000-8000-000000000001";
  const opportunityId = "40000000-0000-4000-8000-000000000001";
  const activity = {
    id,
    workspaceId,
    businessPartnerId,
    opportunityId: null,
    contactId: null,
    responsibleMemberId: null,
    type: CrmActivityType.CALL,
    status: CrmActivityStatus.PLANNED,
    title: "Qualification call",
    description: null,
    scheduledAt: null,
    completedAt: null,
    createdAt: new Date("2026-08-12T00:00:00.000Z"),
    updatedAt: new Date("2026-08-12T00:00:00.000Z"),
  };
  const opportunity = {
    id: opportunityId,
    workspaceId,
    code: "OPP-001",
    title: "Opportunity",
    businessPartnerId,
    contactId: null,
    pipelineId: "50000000-0000-4000-8000-000000000001",
    stageId: "60000000-0000-4000-8000-000000000001",
    amount: new Prisma.Decimal(100),
    currency: "EUR",
    dueAt: null,
    responsibleMemberId: null,
    status: CrmOpportunityStatus.OPEN,
    createdAt: new Date("2026-08-12T00:00:00.000Z"),
    updatedAt: new Date("2026-08-12T00:00:00.000Z"),
  };
  let repository: jest.Mocked<CrmActivitiesRepository>;
  let opportunities: jest.Mocked<CrmOpportunitiesService>;
  let service: CrmActivitiesService;

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(activity),
      findByWorkspace: jest.fn().mockResolvedValue([activity]),
      findById: jest.fn().mockResolvedValue(activity),
      updatePlanned: jest.fn().mockResolvedValue(activity),
      transitionPlanned: jest.fn().mockResolvedValue(activity),
      businessPartnerExists: jest.fn().mockResolvedValue(true),
      findContact: jest.fn().mockResolvedValue({ id: "contact", businessPartnerId }),
      memberExists: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<CrmActivitiesRepository>;
    opportunities = {
      get: jest.fn().mockResolvedValue(opportunity),
    } as unknown as jest.Mocked<CrmOpportunitiesService>;
    service = new CrmActivitiesService(repository, opportunities);
  });

  it("creates a planned activity with workspace-scoped references", async () => {
    await service.create(workspaceId, {
      businessPartnerId,
      opportunityId,
      type: CrmActivityType.CALL,
      title: activity.title,
      scheduledAt: "2026-08-13T10:00:00.000Z",
    });
    expect(opportunities.get).toHaveBeenCalledWith(workspaceId, opportunityId);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      businessPartnerId,
      opportunityId,
      type: CrmActivityType.CALL,
      title: activity.title,
      scheduledAt: new Date("2026-08-13T10:00:00.000Z"),
    });
  });

  it("rejects opportunity and contact references for another partner", async () => {
    opportunities.get.mockResolvedValueOnce({
      ...opportunity,
      businessPartnerId: "70000000-0000-4000-8000-000000000001",
    });
    await expect(
      service.create(workspaceId, {
        businessPartnerId,
        opportunityId,
        type: CrmActivityType.TASK,
        title: "Follow up",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    repository.findContact.mockResolvedValueOnce({
      id: "contact",
      businessPartnerId: "70000000-0000-4000-8000-000000000001",
    });
    await expect(
      service.create(workspaceId, {
        businessPartnerId,
        contactId: "80000000-0000-4000-8000-000000000001",
        type: CrmActivityType.EMAIL,
        title: "Email",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("updates only planned activities", async () => {
    await service.update(workspaceId, id, { title: "Updated" });
    expect(repository.updatePlanned).toHaveBeenCalledWith(workspaceId, id, {
      title: "Updated",
    });

    repository.findById.mockResolvedValueOnce({
      ...activity,
      status: CrmActivityStatus.COMPLETED,
    });
    await expect(
      service.update(workspaceId, id, { title: "Forbidden" }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("completes with a completion date and cancels without one", async () => {
    await service.complete(workspaceId, id);
    expect(repository.transitionPlanned).toHaveBeenCalledWith(
      workspaceId,
      id,
      CrmActivityStatus.COMPLETED,
      expect.any(Date),
    );
    await service.cancel(workspaceId, id);
    expect(repository.transitionPlanned).toHaveBeenCalledWith(
      workspaceId,
      id,
      CrmActivityStatus.CANCELLED,
      null,
    );
  });

  it("lists and rejects unknown activities", async () => {
    await expect(service.list(workspaceId)).resolves.toEqual([activity]);
    repository.findById.mockResolvedValueOnce(null);
    await expect(service.get(workspaceId, id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
