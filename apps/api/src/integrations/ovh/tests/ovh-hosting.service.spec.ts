import { NotFoundException } from "@nestjs/common";
import { OVH_HOSTING_INSTANCE_STATUS } from "../ovh-hosting.constants";
import { OvhHostingConfigService } from "../ovh-hosting-config.service";
import { OvhHostingProviderAdapter } from "../ovh-hosting-provider.contract";
import { OvhHostingProviderRegistryService } from "../ovh-hosting-provider-registry.service";
import { OvhHostingRepository } from "../ovh-hosting.repository";
import { OvhHostingService } from "../ovh-hosting.service";

describe("OvhHostingService", () => {
  const workspaceId = "workspace-id";
  const workspaceServiceId = "hosting-service-id";
  const externalServiceId = "ovh-service-id";
  let repository: jest.Mocked<OvhHostingRepository>;
  let adapter: jest.Mocked<OvhHostingProviderAdapter>;
  let service: OvhHostingService;

  beforeEach(() => {
    repository = {
      findWorkspaceHostingService: jest.fn().mockResolvedValue({ id: workspaceServiceId }),
    } as unknown as jest.Mocked<OvhHostingRepository>;
    adapter = {
      providerId: "OVH",
      createHostingInstance: jest.fn().mockResolvedValue({
        externalServiceId,
        status: OVH_HOSTING_INSTANCE_STATUS.PENDING,
      }),
      getHostingInstance: jest.fn().mockResolvedValue({
        externalServiceId,
        status: OVH_HOSTING_INSTANCE_STATUS.ACTIVE,
      }),
      suspendHostingInstance: jest.fn().mockResolvedValue({
        externalServiceId,
        status: OVH_HOSTING_INSTANCE_STATUS.SUSPENDED,
      }),
      reactivateHostingInstance: jest.fn().mockResolvedValue({
        externalServiceId,
        status: OVH_HOSTING_INSTANCE_STATUS.ACTIVE,
      }),
    };
    service = new OvhHostingService(
      repository,
      {
        getConfiguration: jest.fn().mockReturnValue({
          apiEndpoint: "https://eu.api.ovh.com",
          hostingProfile: "web-pro-v1",
        }),
      } as unknown as OvhHostingConfigService,
      new OvhHostingProviderRegistryService([adapter]),
    );
  });

  it("creates an instance with workspace attachment and idempotence", async () => {
    await expect(
      service.createHostingInstance({
        workspaceId: ` ${workspaceId} `,
        workspaceServiceId,
        idempotencyKey: " create-1 ",
      }),
    ).resolves.toEqual({
      workspaceId,
      workspaceServiceId,
      provider: "OVH",
      externalServiceId,
      status: OVH_HOSTING_INSTANCE_STATUS.PENDING,
    });
    expect(adapter.createHostingInstance).toHaveBeenCalledWith({
      workspaceId,
      workspaceServiceId,
      idempotencyKey: "create-1",
      apiEndpoint: "https://eu.api.ovh.com",
      hostingProfile: "web-pro-v1",
    });
  });

  it("consults, suspends and reactivates through the fake adapter", async () => {
    await service.getHostingInstance({
      workspaceId,
      workspaceServiceId,
      externalServiceId,
    });
    await service.suspendHostingInstance({
      workspaceId,
      workspaceServiceId,
      externalServiceId,
      idempotencyKey: "suspend-1",
    });
    await service.reactivateHostingInstance({
      workspaceId,
      workspaceServiceId,
      externalServiceId,
      idempotencyKey: "reactivate-1",
    });

    expect(adapter.getHostingInstance).toHaveBeenCalledTimes(1);
    expect(adapter.suspendHostingInstance).toHaveBeenCalledTimes(1);
    expect(adapter.reactivateHostingInstance).toHaveBeenCalledTimes(1);
  });

  it("prepares termination without calling a destructive adapter operation", async () => {
    await expect(
      service.prepareTermination({
        workspaceId,
        workspaceServiceId,
        externalServiceId,
      }),
    ).resolves.toEqual({
      workspaceId,
      workspaceServiceId,
      externalServiceId,
      provider: "OVH",
      status: "PREPARED",
      destructiveExecutionAllowed: false,
    });
    expect(adapter.createHostingInstance).not.toHaveBeenCalled();
    expect(adapter.suspendHostingInstance).not.toHaveBeenCalled();
    expect(adapter.reactivateHostingInstance).not.toHaveBeenCalled();
  });

  it("rejects a missing, foreign or non-HOSTING workspace service", async () => {
    repository.findWorkspaceHostingService.mockResolvedValue(null);

    await expect(
      service.getHostingInstance({
        workspaceId,
        workspaceServiceId,
        externalServiceId,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(adapter.getHostingInstance).not.toHaveBeenCalled();
  });
});
