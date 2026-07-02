import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  WorkspaceServiceRecord,
  WorkspaceServicesRepository,
} from "./workspace-services.repository";

@Injectable()
export class WorkspaceServicesService {
  constructor(
    private readonly workspaceServicesRepository: WorkspaceServicesRepository,
  ) {}

  listWorkspaceServices(workspaceId: string) {
    return this.workspaceServicesRepository.findByWorkspace(workspaceId);
  }

  enableService(
    workspaceId: string,
    serviceKey: string,
    configuration?: unknown,
  ) {
    return this.workspaceServicesRepository.activate(
      workspaceId,
      this.normalizeServiceKey(serviceKey),
      configuration === undefined
        ? undefined
        : this.toJsonObject(configuration),
    );
  }

  async disableService(workspaceId: string, serviceKey: string) {
    const normalizedServiceKey = this.normalizeServiceKey(serviceKey);
    await this.requireWorkspaceService(workspaceId, normalizedServiceKey);

    return this.workspaceServicesRepository.disable(
      workspaceId,
      normalizedServiceKey,
    );
  }

  async getConfiguration(workspaceId: string, serviceKey: string) {
    const workspaceService = await this.requireWorkspaceService(
      workspaceId,
      this.normalizeServiceKey(serviceKey),
    );

    return workspaceService.configuration;
  }

  async updateConfiguration(
    workspaceId: string,
    serviceKey: string,
    configuration: unknown,
  ) {
    const normalizedServiceKey = this.normalizeServiceKey(serviceKey);
    await this.requireWorkspaceService(workspaceId, normalizedServiceKey);

    const workspaceService =
      await this.workspaceServicesRepository.updateConfiguration(
        workspaceId,
        normalizedServiceKey,
        this.toJsonObject(configuration),
      );

    return workspaceService.configuration;
  }

  private async requireWorkspaceService(
    workspaceId: string,
    serviceKey: string,
  ): Promise<WorkspaceServiceRecord> {
    const workspaceService =
      await this.workspaceServicesRepository.findByWorkspaceAndServiceKey(
        workspaceId,
        serviceKey,
      );

    if (!workspaceService) {
      throw new NotFoundException("Workspace service not found");
    }

    return workspaceService;
  }

  private normalizeServiceKey(serviceKey: string): string {
    const normalizedServiceKey = serviceKey.trim();

    if (normalizedServiceKey.length === 0) {
      throw new BadRequestException("Service key is required");
    }

    return normalizedServiceKey;
  }

  private toJsonObject(value: unknown): Prisma.InputJsonObject {
    if (
      value === null ||
      Array.isArray(value) ||
      typeof value !== "object"
    ) {
      throw new BadRequestException("Configuration must be a JSON object");
    }

    return value as Prisma.InputJsonObject;
  }
}
