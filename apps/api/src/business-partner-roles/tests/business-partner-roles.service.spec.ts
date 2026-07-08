import { BadRequestException, NotFoundException } from "@nestjs/common";
import { BusinessPartnerRolesRepository } from "../business-partner-roles.repository";
import { BusinessPartnerRolesService } from "../business-partner-roles.service";

describe("BusinessPartnerRolesService", () => {
  let repository: jest.Mocked<BusinessPartnerRolesRepository>;
  let service: BusinessPartnerRolesService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const role = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "CUSTOMER",
    name: "Customer",
    description: "Customer role",
    isSystem: true,
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(role),
      update: jest.fn().mockResolvedValue(role),
      disable: jest.fn().mockResolvedValue({
        ...role,
        isActive: false,
      }),
      findByWorkspace: jest.fn().mockResolvedValue([role]),
      findByWorkspaceAndCode: jest.fn().mockResolvedValue(role),
    } as unknown as jest.Mocked<BusinessPartnerRolesRepository>;

    service = new BusinessPartnerRolesService(repository);
  });

  it("creates a business partner role", async () => {
    const result = await service.createRole(workspaceId, {
      code: "customer",
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
    });

    expect(result).toEqual(role);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      code: role.code,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
    });
  });

  it("lists workspace business partner roles", async () => {
    const result = await service.listWorkspaceRoles(workspaceId);

    expect(result).toEqual([role]);
    expect(repository.findByWorkspace).toHaveBeenCalledWith(workspaceId);
  });

  it("gets a business partner role by code", async () => {
    const result = await service.getRole(workspaceId, "customer");

    expect(result).toEqual(role);
    expect(repository.findByWorkspaceAndCode).toHaveBeenCalledWith(
      workspaceId,
      role.code,
    );
  });

  it("updates a business partner role", async () => {
    const result = await service.updateRole(workspaceId, role.code, {
      name: "Prospect",
    });

    expect(result).toEqual(role);
    expect(repository.update).toHaveBeenCalledWith(workspaceId, role.code, {
      name: "Prospect",
    });
  });

  it("disables a business partner role", async () => {
    const result = await service.disableRole(workspaceId, role.code);

    expect(result.isActive).toBe(false);
    expect(repository.disable).toHaveBeenCalledWith(workspaceId, role.code);
  });

  it("throws NotFoundException when role is unknown", async () => {
    repository.findByWorkspaceAndCode.mockResolvedValueOnce(null);

    await expect(
      service.getRole(workspaceId, "unknown"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws BadRequestException when code is blank", async () => {
    await expect(service.getRole(workspaceId, " ")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
