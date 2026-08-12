import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { BusinessPartnerSearchService } from "../../business-partner-search/business-partner-search.service";
import { MarketingSegmentsRepository } from "../marketing-segments.repository";
import { MarketingSegmentsService } from "../marketing-segments.service";

describe("MarketingSegmentsService", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const segment = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "ACTIVE-PROSPECTS",
    name: "Active prospects",
    description: "Prospects in priority categories",
    roleCodes: ["PROSPECT"],
    categoryCodes: ["PRIORITY"],
    tagCodes: ["VIP"],
    activeOnly: true,
    isActive: true,
    createdAt: new Date("2026-08-12T00:00:00.000Z"),
    updatedAt: new Date("2026-08-12T00:00:00.000Z"),
  };
  const view = {
    id: segment.id,
    workspaceId,
    code: segment.code,
    name: segment.name,
    description: segment.description,
    rules: {
      roleCodes: segment.roleCodes,
      categoryCodes: segment.categoryCodes,
      tagCodes: segment.tagCodes,
      activeOnly: true,
    },
    isActive: true,
    createdAt: segment.createdAt,
    updatedAt: segment.updatedAt,
  };

  let repository: jest.Mocked<MarketingSegmentsRepository>;
  let businessPartnerSearchService: jest.Mocked<BusinessPartnerSearchService>;
  let service: MarketingSegmentsService;

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(segment),
      update: jest.fn().mockResolvedValue(segment),
      deactivate: jest.fn().mockResolvedValue({ ...segment, isActive: false }),
      findByWorkspace: jest.fn().mockResolvedValue([segment]),
      findByCode: jest.fn().mockResolvedValue(segment),
      findById: jest.fn().mockResolvedValue(segment),
    } as unknown as jest.Mocked<MarketingSegmentsRepository>;
    businessPartnerSearchService = {
      findKnownAudienceCodes: jest.fn().mockResolvedValue({
        roleCodes: segment.roleCodes,
        categoryCodes: segment.categoryCodes,
        tagCodes: segment.tagCodes,
      }),
      evaluateAudience: jest.fn().mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 25,
      }),
    } as unknown as jest.Mocked<BusinessPartnerSearchService>;
    service = new MarketingSegmentsService(
      repository,
      businessPartnerSearchService,
    );
  });

  it("creates a segment with normalized closed criteria", async () => {
    repository.findByCode.mockResolvedValueOnce(null);

    const result = await service.createSegment(workspaceId, {
      code: "active-prospects",
      name: segment.name,
      description: segment.description,
      rules: {
        roleCodes: ["prospect", "PROSPECT"],
        categoryCodes: ["priority"],
        tagCodes: ["vip"],
        activeOnly: true,
      },
    });

    expect(result).toEqual(view);
    expect(businessPartnerSearchService.findKnownAudienceCodes).toHaveBeenCalledWith(
      workspaceId,
      view.rules,
    );
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      code: segment.code,
      name: segment.name,
      description: segment.description,
      ...view.rules,
      isActive: undefined,
    });
  });

  it("rejects an existing segment code", async () => {
    await expect(
      service.createSegment(workspaceId, {
        code: segment.code,
        name: segment.name,
        rules: {},
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("rejects unknown or inactive criteria", async () => {
    repository.findByCode.mockResolvedValueOnce(null);
    businessPartnerSearchService.findKnownAudienceCodes.mockResolvedValueOnce({
      roleCodes: [],
      categoryCodes: segment.categoryCodes,
      tagCodes: segment.tagCodes,
    });

    await expect(
      service.createSegment(workspaceId, {
        code: segment.code,
        name: segment.name,
        rules: view.rules,
      }),
    ).rejects.toThrow("roles:PROSPECT");
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("lists and maps workspace segments", async () => {
    await expect(service.listSegments(workspaceId)).resolves.toEqual([view]);
    expect(repository.findByWorkspace).toHaveBeenCalledWith(workspaceId);
  });

  it("gets a segment by normalized workspace code", async () => {
    await expect(
      service.getSegment(workspaceId, "active-prospects"),
    ).resolves.toEqual(view);
    expect(repository.findByCode).toHaveBeenCalledWith(workspaceId, segment.code);
  });

  it("updates and revalidates complete rules", async () => {
    await expect(
      service.updateSegment(workspaceId, segment.code, {
        name: segment.name,
        rules: view.rules,
        isActive: true,
      }),
    ).resolves.toEqual(view);
    expect(repository.update).toHaveBeenCalledWith(workspaceId, segment.id, {
      name: segment.name,
      description: undefined,
      isActive: true,
      ...view.rules,
    });
  });

  it("deactivates a segment without deleting it", async () => {
    await service.deactivateSegment(workspaceId, segment.code);
    expect(repository.deactivate).toHaveBeenCalledWith(workspaceId, segment.id);
  });

  it("evaluates the segment dynamically with pagination", async () => {
    const result = await service.evaluateSegment(workspaceId, segment.code, {
      page: 2,
      pageSize: 10,
    });

    expect(result).toEqual({
      segment: view,
      items: [],
      total: 0,
      page: 1,
      pageSize: 25,
    });
    expect(businessPartnerSearchService.evaluateAudience).toHaveBeenCalledWith(
      workspaceId,
      view.rules,
      { page: 2, pageSize: 10 },
    );
  });

  it("rejects evaluation of an inactive segment", async () => {
    repository.findByCode.mockResolvedValueOnce({ ...segment, isActive: false });

    await expect(
      service.evaluateSegment(workspaceId, segment.code, {}),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(businessPartnerSearchService.evaluateAudience).not.toHaveBeenCalled();
  });

  it("isolates segment lookup by workspace", async () => {
    repository.findByCode.mockResolvedValueOnce(null);

    await expect(
      service.getSegment(workspaceId, segment.code),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("exposes only active workspace segments by id", async () => {
    await expect(service.getActiveSegmentById(workspaceId, segment.id)).resolves.toEqual(view);
    repository.findById.mockResolvedValueOnce({ ...segment, isActive: false });
    await expect(service.getActiveSegmentById(workspaceId, segment.id)).rejects.toBeInstanceOf(BadRequestException);
  });
});
