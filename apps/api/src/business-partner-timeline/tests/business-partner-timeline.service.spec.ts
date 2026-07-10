import { NotFoundException } from "@nestjs/common";
import { BusinessPartnerTimelineRepository } from "../business-partner-timeline.repository";
import { BusinessPartnerTimelineService } from "../business-partner-timeline.service";

describe("BusinessPartnerTimelineService", () => {
  let repository: jest.Mocked<BusinessPartnerTimelineRepository>;
  let service: BusinessPartnerTimelineService;

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

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(entry),
      findByBusinessPartner: jest.fn().mockResolvedValue([entry]),
      findById: jest.fn().mockResolvedValue(entry),
    } as unknown as jest.Mocked<BusinessPartnerTimelineRepository>;

    service = new BusinessPartnerTimelineService(repository);
  });

  it("creates a business partner timeline entry", async () => {
    const result = await service.createEntry(workspaceId, businessPartnerId, {
      eventType: entry.eventType,
      title: entry.title,
      description: entry.description,
      sourceModule: entry.sourceModule,
      sourceId: entry.sourceId,
      metadata: entry.metadata,
      occurredAt: occurredAt.toISOString(),
    });

    expect(result).toEqual(entry);
    expect(repository.create).toHaveBeenCalledWith({
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
  });

  it("lists customer business partner timeline entries", async () => {
    const result = await service.listBusinessPartnerEntries(workspaceId, businessPartnerId);

    expect(result).toEqual([entry]);
    expect(repository.findByBusinessPartner).toHaveBeenCalledWith(
      workspaceId,
      businessPartnerId,
    );
  });

  it("gets a business partner timeline entry", async () => {
    const result = await service.getEntry(workspaceId, businessPartnerId, entryId);

    expect(result).toEqual(entry);
    expect(repository.findById).toHaveBeenCalledWith(
      workspaceId,
      businessPartnerId,
      entryId,
    );
  });

  it("throws NotFoundException when entry is unknown", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(
      service.getEntry(workspaceId, businessPartnerId, entryId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
