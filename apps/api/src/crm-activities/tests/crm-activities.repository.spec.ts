import { CrmActivityStatus, CrmActivityType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CrmActivitiesRepository } from "../crm-activities.repository";

describe("CrmActivitiesRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const id = "20000000-0000-4000-8000-000000000001";
  const activity = {
    id,
    workspaceId,
    businessPartnerId: "30000000-0000-4000-8000-000000000001",
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

  it("creates and lists workspace activities", async () => {
    const create = jest.fn().mockResolvedValue(activity);
    const findMany = jest.fn().mockResolvedValue([activity]);
    const repository = new CrmActivitiesRepository(mockPrisma({ create, findMany }));
    const data = {
      workspaceId,
      businessPartnerId: activity.businessPartnerId,
      type: activity.type,
      title: activity.title,
    };

    await expect(repository.create(data)).resolves.toEqual(activity);
    await expect(repository.findByWorkspace(workspaceId)).resolves.toEqual([
      activity,
    ]);
    expect(create).toHaveBeenCalledWith({ data });
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
    });
  });

  it("updates and transitions only planned activities", async () => {
    const updateManyAndReturn = jest.fn().mockResolvedValue([activity]);
    const repository = new CrmActivitiesRepository(
      mockPrisma({ updateManyAndReturn }),
    );
    const completedAt = new Date("2026-08-12T10:00:00.000Z");

    await repository.updatePlanned(workspaceId, id, { title: "Updated" });
    await repository.transitionPlanned(
      workspaceId,
      id,
      CrmActivityStatus.COMPLETED,
      completedAt,
    );
    expect(updateManyAndReturn).toHaveBeenNthCalledWith(1, {
      where: { id, workspaceId, status: CrmActivityStatus.PLANNED },
      data: { title: "Updated" },
    });
    expect(updateManyAndReturn).toHaveBeenNthCalledWith(2, {
      where: { id, workspaceId, status: CrmActivityStatus.PLANNED },
      data: { status: CrmActivityStatus.COMPLETED, completedAt },
    });
  });

  it("finds activities and validates workspace-scoped references", async () => {
    const activityFindFirst = jest.fn().mockResolvedValue(activity);
    const businessPartnerFindFirst = jest.fn().mockResolvedValue({ id: "bp" });
    const contactFindFirst = jest.fn().mockResolvedValue({
      id: "contact",
      businessPartnerId: activity.businessPartnerId,
    });
    const memberFindFirst = jest.fn().mockResolvedValue({ id: "member" });
    const repository = new CrmActivitiesRepository(
      mockPrisma({
        activityFindFirst,
        businessPartnerFindFirst,
        contactFindFirst,
        memberFindFirst,
      }),
    );

    await repository.findById(workspaceId, id);
    await expect(
      repository.businessPartnerExists(workspaceId, activity.businessPartnerId),
    ).resolves.toBe(true);
    await repository.findContact(workspaceId, "contact");
    await expect(repository.memberExists(workspaceId, "member")).resolves.toBe(
      true,
    );
    expect(activityFindFirst).toHaveBeenCalledWith({
      where: { id, workspaceId },
    });
  });
});

function mockPrisma(methods: Record<string, jest.Mock>): PrismaService {
  return {
    crmActivity: {
      create: methods.create ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findFirst: methods.activityFindFirst ?? jest.fn(),
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
