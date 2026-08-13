import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { OVH_HOSTING_TERMINATION_STATUS } from "./ovh-hosting.constants";
import { OvhHostingConfigService } from "./ovh-hosting-config.service";
import {
  ChangeOvhHostingInstanceStateRequest,
  CreateOvhHostingInstanceRequest,
  OvhHostingInstanceResponse,
  OvhHostingServiceReference,
  OvhHostingTerminationPreparation,
  ReadOvhHostingInstanceRequest,
} from "./ovh-hosting-provider.contract";
import { OvhHostingProviderRegistryService } from "./ovh-hosting-provider-registry.service";
import { OvhHostingRepository } from "./ovh-hosting.repository";

@Injectable()
export class OvhHostingService {
  constructor(
    private readonly repository: OvhHostingRepository,
    private readonly config: OvhHostingConfigService,
    private readonly providerRegistry: OvhHostingProviderRegistryService,
  ) {}

  async createHostingInstance(
    request: CreateOvhHostingInstanceRequest,
  ): Promise<OvhHostingInstanceResponse> {
    const normalized = this.normalizeStateChange(request);
    await this.requireWorkspaceHostingService(normalized);
    const response = await this.providerRegistry.get().createHostingInstance({
      ...normalized,
      ...this.config.getConfiguration(),
    });

    return {
      workspaceId: normalized.workspaceId,
      workspaceServiceId: normalized.workspaceServiceId,
      ...response,
      provider: "OVH",
    };
  }

  async getHostingInstance(
    request: ReadOvhHostingInstanceRequest,
  ): Promise<OvhHostingInstanceResponse> {
    const normalized = this.normalizeRead(request);
    await this.requireWorkspaceHostingService(normalized);
    const response = await this.providerRegistry
      .get()
      .getHostingInstance(normalized);

    return {
      workspaceId: normalized.workspaceId,
      workspaceServiceId: normalized.workspaceServiceId,
      ...response,
      provider: "OVH",
    };
  }

  suspendHostingInstance(
    request: ChangeOvhHostingInstanceStateRequest,
  ): Promise<OvhHostingInstanceResponse> {
    return this.changeState(request, "suspendHostingInstance");
  }

  reactivateHostingInstance(
    request: ChangeOvhHostingInstanceStateRequest,
  ): Promise<OvhHostingInstanceResponse> {
    return this.changeState(request, "reactivateHostingInstance");
  }

  async prepareTermination(
    request: ReadOvhHostingInstanceRequest,
  ): Promise<OvhHostingTerminationPreparation> {
    const normalized = this.normalizeRead(request);
    await this.requireWorkspaceHostingService(normalized);

    return {
      ...normalized,
      provider: "OVH",
      status: OVH_HOSTING_TERMINATION_STATUS.PREPARED,
      destructiveExecutionAllowed: false,
    };
  }

  private async changeState(
    request: ChangeOvhHostingInstanceStateRequest,
    operation: "suspendHostingInstance" | "reactivateHostingInstance",
  ): Promise<OvhHostingInstanceResponse> {
    const normalized = this.normalizeStateChange(request);
    await this.requireWorkspaceHostingService(normalized);
    const response = await this.providerRegistry.get()[operation](normalized);

    return {
      workspaceId: normalized.workspaceId,
      workspaceServiceId: normalized.workspaceServiceId,
      ...response,
      provider: "OVH",
    };
  }

  private async requireWorkspaceHostingService(
    reference: OvhHostingServiceReference,
  ): Promise<void> {
    const service = await this.repository.findWorkspaceHostingService(
      reference.workspaceId,
      reference.workspaceServiceId,
    );

    if (!service) {
      throw new NotFoundException("Workspace HOSTING service not found");
    }
  }

  private normalizeRead(
    request: ReadOvhHostingInstanceRequest,
  ): ReadOvhHostingInstanceRequest {
    return {
      workspaceId: this.required(request.workspaceId, "Workspace id"),
      workspaceServiceId: this.required(
        request.workspaceServiceId,
        "Workspace service id",
      ),
      externalServiceId: this.required(
        request.externalServiceId,
        "OVH external service id",
      ),
    };
  }

  private normalizeStateChange<T extends OvhHostingServiceReference & {
    idempotencyKey: string;
    externalServiceId?: string;
  }>(request: T): T {
    return {
      ...request,
      workspaceId: this.required(request.workspaceId, "Workspace id"),
      workspaceServiceId: this.required(
        request.workspaceServiceId,
        "Workspace service id",
      ),
      idempotencyKey: this.required(
        request.idempotencyKey,
        "OVH idempotency key",
      ),
      ...(request.externalServiceId === undefined
        ? {}
        : {
            externalServiceId: this.required(
              request.externalServiceId,
              "OVH external service id",
            ),
          }),
    };
  }

  private required(value: string, label: string): string {
    const normalized = value.trim();
    if (!normalized || normalized.length > 120) {
      throw new BadRequestException(`${label} is invalid`);
    }
    return normalized;
  }
}
