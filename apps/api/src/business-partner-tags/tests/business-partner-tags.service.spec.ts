import { BadRequestException, NotFoundException } from "@nestjs/common";
import { BusinessPartnerTagsRepository } from "../business-partner-tags.repository";
import { BusinessPartnerTagsService } from "../business-partner-tags.service";

describe("BusinessPartnerTagsService", () => {
  let repository: jest.Mocked<BusinessPartnerTagsRepository>;
  let service: BusinessPartnerTagsService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const tag = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "VIP",
    name: "VIP",
    color: "#1D4ED8",
    isSystem: false,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(tag),
      update: jest.fn().mockResolvedValue(tag),
      disable: jest.fn().mockResolvedValue({
        ...tag,
        isActive: false,
      }),
      findByWorkspace: jest.fn().mockResolvedValue([tag]),
      findByWorkspaceAndCode: jest.fn().mockResolvedValue(tag),
    } as unknown as jest.Mocked<BusinessPartnerTagsRepository>;

    service = new BusinessPartnerTagsService(repository);
  });

  it("creates a business partner tag", async () => {
    const result = await service.createTag(workspaceId, {
      code: "vip",
      name: tag.name,
      color: tag.color,
      isSystem: tag.isSystem,
    });

    expect(result).toEqual(tag);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      code: tag.code,
      name: tag.name,
      color: tag.color,
      isSystem: tag.isSystem,
    });
  });

  it("lists workspace business partner tags", async () => {
    const result = await service.listWorkspaceTags(workspaceId);

    expect(result).toEqual([tag]);
    expect(repository.findByWorkspace).toHaveBeenCalledWith(workspaceId);
  });

  it("gets a business partner tag by code", async () => {
    const result = await service.getTag(workspaceId, "vip");

    expect(result).toEqual(tag);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      tag.code,
    );
  });

  it("updates a business partner tag", async () => {
    const result = await service.updateTag(workspaceId, tag.code, {
      name: "Important",
    });

    expect(result).toEqual(tag);
    expect(repository.update).toHaveBeenCalledWith(workspaceId, tag.code, {
      name: "Important",
    });
  });

  it("disables a business partner tag", async () => {
    const result = await service.disableTag(workspaceId, tag.code);

    expect(result.isActive).toBe(false);
    expect(repository.disable).toHaveBeenCalledWith(workspaceId, tag.code);
  });

  it("throws NotFoundException when tag is unknown", async () => {
    repository.findByWorkspaceAndCode.mockResolvedValueOnce(null);

    await expect(service.getTag(workspaceId, "unknown")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("throws BadRequestException when code is blank", async () => {
    await expect(service.getTag(workspaceId, " ")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
