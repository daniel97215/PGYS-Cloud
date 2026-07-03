import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DeprovisionWorkspaceDto } from "./dto/deprovision-workspace.dto";
import { ProvisionWorkspaceDto } from "./dto/provision-workspace.dto";
import { ReprovisionWorkspaceDto } from "./dto/reprovision-workspace.dto";
import { ProvisioningOrchestratorService } from "./provisioning-orchestrator.service";
import {
  PROVISIONING_OPERATION,
  ProvisioningJobRecord,
  ProvisioningRepository,
} from "./provisioning.repository";

@Injectable()
export class ProvisioningService {
  constructor(
    private readonly provisioningRepository: ProvisioningRepository,
    private readonly provisioningOrchestrator: ProvisioningOrchestratorService,
  ) {}

  provisionWorkspace(
    workspaceId: string,
    data: ProvisionWorkspaceDto,
  ): Promise<ProvisioningJobRecord> {
    return this.provisioningOrchestrator.run(
      PROVISIONING_OPERATION.PROVISION,
      this.normalizeId(workspaceId, "Workspace id"),
      this.normalizeId(data.subscriptionId, "Subscription id"),
    );
  }

  reprovisionWorkspace(
    workspaceId: string,
    data: ReprovisionWorkspaceDto,
  ): Promise<ProvisioningJobRecord> {
    return this.provisioningOrchestrator.run(
      PROVISIONING_OPERATION.REPROVISION,
      this.normalizeId(workspaceId, "Workspace id"),
      this.normalizeId(data.subscriptionId, "Subscription id"),
    );
  }

  deprovisionWorkspace(
    workspaceId: string,
    data: DeprovisionWorkspaceDto,
  ): Promise<ProvisioningJobRecord> {
    return this.provisioningOrchestrator.run(
      PROVISIONING_OPERATION.DEPROVISION,
      this.normalizeId(workspaceId, "Workspace id"),
      this.normalizeId(data.subscriptionId, "Subscription id"),
    );
  }

  async getProvisioningJob(jobId: string): Promise<ProvisioningJobRecord> {
    const normalizedId = this.normalizeId(jobId, "Provisioning job id");
    const job = await this.provisioningRepository.findJobById(normalizedId);

    if (!job) {
      throw new NotFoundException(`Provisioning job "${jobId}" not found`);
    }

    return job;
  }

  private normalizeId(id: string, label: string): string {
    const normalizedId = id.trim();

    if (normalizedId.length === 0) {
      throw new BadRequestException(`${label} is required`);
    }

    return normalizedId;
  }
}
