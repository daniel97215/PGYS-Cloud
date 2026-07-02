import { BadRequestException, NotFoundException } from "@nestjs/common";
import {
  FEATURE_STATUS_ARCHIVED,
  FeaturesRepository,
} from "../features.repository";
import { FeaturesService } from "../features.service";

describe("FeaturesService", () => {
  let repository: jest.Mocked<FeaturesRepository>;
  let service: FeaturesService;

  const feature = {
    id: "10000000-0000-4000-8000-000000000001",
    key: "crm.contacts",
    name: "CRM Contacts",
    description: "Manage CRM contacts",
    category: "crm",
    status: "active",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(feature),
      update: jest.fn().mockResolvedValue(feature),
      findAll: jest.fn().mockResolvedValue([feature]),
      findByKey: jest.fn().mockResolvedValue(feature),
      archive: jest.fn().mockResolvedValue({
        ...feature,
        status: FEATURE_STATUS_ARCHIVED,
      }),
    } as unknown as jest.Mocked<FeaturesRepository>;

    service = new FeaturesService(repository);
  });

  it("creates a feature", async () => {
    const result = await service.createFeature({
      key: "CRM.Contacts",
      name: "CRM Contacts",
      description: "Manage CRM contacts",
      category: "crm",
    });

    expect(result).toEqual(feature);
    expect(repository.create).toHaveBeenCalledWith({
      key: feature.key,
      name: feature.name,
      description: feature.description,
      category: feature.category,
    });
  });

  it("updates a feature", async () => {
    const result = await service.updateFeature(feature.key, {
      name: "CRM Contacts Pro",
    });

    expect(result).toEqual(feature);
    expect(repository.findByKey).toHaveBeenCalledWith(feature.key);
    expect(repository.update).toHaveBeenCalledWith(feature.key, {
      name: "CRM Contacts Pro",
    });
  });

  it("lists features", async () => {
    const result = await service.listFeatures();

    expect(result).toEqual([feature]);
    expect(repository.findAll).toHaveBeenCalledWith();
  });

  it("gets a feature", async () => {
    const result = await service.getFeature(feature.key);

    expect(result).toEqual(feature);
    expect(repository.findByKey).toHaveBeenCalledWith(feature.key);
  });

  it("archives a feature", async () => {
    const result = await service.archiveFeature(feature.key);

    expect(result.status).toBe(FEATURE_STATUS_ARCHIVED);
    expect(repository.archive).toHaveBeenCalledWith(feature.key);
  });

  it("throws NotFoundException when a feature is unknown", async () => {
    repository.findByKey.mockResolvedValueOnce(null);

    await expect(service.getFeature("unknown")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("throws BadRequestException when key is blank", async () => {
    await expect(service.getFeature(" ")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
