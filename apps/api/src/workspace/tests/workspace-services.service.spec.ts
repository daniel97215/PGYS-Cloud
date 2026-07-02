import { BadRequestException, NotFoundException } from "@nestjs/common";
import {
  WORKSPACE_SERVICE_STATUS_ACTIVE,
  WORKSPACE_SERVICE_STATUS_INACTIVE,
  WorkspaceServicesRepository,
} from "../workspace-services.repository";
import { WorkspaceServicesService } from "../workspace-services.service";

describe("WorkspaceServicesService", () => {
  let repository: jest.Mocked<WorkspaceServicesRepository>;
  let service: WorkspaceServicesService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const serviceKey = "erp";
  const workspaceService = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    serviceKey,
    status: WORKSPACE_SERVICE_STATUS_ACTIVE,
    configuration: { defaultCurrency: "EUR" },
    activatedAt: new Date("2026-01-01T00:00:00.000Z"),
    deactivatedAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      findByWorkspace: jest.fn().mockResolvedValue([workspaceService]),
      findByWorkspaceAndServiceKey: jest
        .fn()
        .mockResolvedValue(workspaceService),
      activate: jest.fn().mockResolvedValue(workspaceService),
      disable: jest.fn().mockResolvedValue({
        ...workspaceService,
        status: WORKSPACE_SERVICE_STATUS_INACTIVE,
      }),
      updateConfiguration: jest.fn().mockResolvedValue(workspaceService),
    } as unknown as jest.Mocked<WorkspaceServicesRepository>;

    service = new WorkspaceServicesService(repository);
  });

  it("lists workspace services", async () => {
    const result = await service.listWorkspaceServices(workspaceId);

    expect(result).toEqual([workspaceService]);
    expect(repository.findByWorkspace).toHaveBeenCalledWith(workspaceId);
  });

  it("activates a service", async () => {
    const result = await service.enableService(workspaceId, serviceKey, {
      defaultCurrency: "EUR",
    });

    expect(result).toEqual(workspaceService);
    expect(repository.activate).toHaveBeenCalledWith(workspaceId, serviceKey, {
      defaultCurrency: "EUR",
    });
  });

  it("disables a service", async () => {
    const result = await service.disableService(workspaceId, serviceKey);

    expect(result.status).toBe(WORKSPACE_SERVICE_STATUS_INACTIVE);
    expect(repository.findByWorkspaceAndServiceKey).toHaveBeenCalledWith(
      workspaceId,
      serviceKey,
    );
    expect(repository.disable).toHaveBeenCalledWith(workspaceId, serviceKey);
  });

  it("gets service configuration", async () => {
    const result = await service.getConfiguration(workspaceId, serviceKey);

    expect(result).toEqual({ defaultCurrency: "EUR" });
    expect(repository.findByWorkspaceAndServiceKey).toHaveBeenCalledWith(
      workspaceId,
      serviceKey,
    );
  });

  it("updates service configuration", async () => {
    const result = await service.updateConfiguration(
      workspaceId,
      serviceKey,
      { defaultCurrency: "EUR" },
    );

    expect(result).toEqual({ defaultCurrency: "EUR" });
    expect(repository.updateConfiguration).toHaveBeenCalledWith(
      workspaceId,
      serviceKey,
      { defaultCurrency: "EUR" },
    );
  });

  it("throws NotFoundException when the workspace service is unknown", async () => {
    repository.findByWorkspaceAndServiceKey.mockResolvedValueOnce(null);

    await expect(
      service.getConfiguration(workspaceId, serviceKey),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it.each([null, [], "invalid", 42, true])(
    "throws BadRequestException when configuration is not a JSON object",
    async (configuration) => {
      await expect(
        service.updateConfiguration(workspaceId, serviceKey, configuration),
      ).rejects.toBeInstanceOf(BadRequestException);
    },
  );
});

