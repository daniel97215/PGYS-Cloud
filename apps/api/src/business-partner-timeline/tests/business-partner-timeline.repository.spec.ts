import { PrismaService } from "../../prisma/prisma.service";
import { BusinessPartnerTimelineRepository } from "../business-partner-timeline.repository";

describe("BusinessPartnerTimelineRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const businessPartnerId = "20000000-0000-4000-8000-000000000001";
  const entryId = "30000000-0000-4000-8000-000000000001";
  const occurredAt = new Date("2026-01-01T00:00:00.000Z");
  const entry = {
    id: entryId,
    workspaceId,
    businessPartnerId,
    eventType: "NOTE_CREATED",
    title: "Internal note created",
    description: "A new internal note was added.",
    sourceModule: "business-partner-notes",
    sourceId: "40000000-0000-4000-8000-000000000001",
    metadata: { importance: "normal" },
    occurredAt,
    createdAt: new Date("2026-01-01T00:01:00.000Z"),
  };

  it("creates a business partner timeline entry through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(entry);
    const repository = new BusinessPartnerTimelineRepository(
      createPrismaMock({ create }),
    );

    const result = await repository.create({
      workspaceId,
      businessPartnerId,
      eventType: entry.eventType,
      title: entry.title,
      description: entry.description,
      sourceModule: entry.sourceModule,
      sourceId: entry.sourceId,
      metadata: entry.metadata,
      occurredAt,
    });

    expect(result).toEqual(entry);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        businessPartnerId,
        eventType: entry.eventType,
        title: entry.title,
        description: entry.description,
        sourceModule: entry.sourceModule,
        sourceId: entry.sourceId,
        metadata: entry.metadata,
        occurredAt,
      },
    });
  });

  it("lists business partner timeline entries for a customer through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([entry]);
    const repository = new BusinessPartnerTimelineRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.findByBusinessPartner(workspaceId, businessPartnerId);

    expect(result).toEqual([entry]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId, businessPartnerId },
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
    });
  });

  it("finds a business partner timeline entry by id through Prisma", async () => {
    const findFirst = jest.fn().mockResolvedValue(entry);
    const repository = new BusinessPartnerTimelineRepository(
      createPrismaMock({ findFirst }),
    );

    const result = await repository.findById(workspaceId, businessPartnerId, entryId);

    expect(result).toEqual(entry);
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: entryId,
        workspaceId,
        businessPartnerId,
      },
    });
  });
});

function createPrismaMock(methods: {
  create?: jest.Mock;
  findMany?: jest.Mock;
  findFirst?: jest.Mock;
}): PrismaService {
  const prisma = {
    businessPartnerTimelineEntry: {
      create: methods.create ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findFirst: methods.findFirst ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
