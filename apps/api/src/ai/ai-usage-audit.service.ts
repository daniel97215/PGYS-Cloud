import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { AiUsageStatus } from "@prisma/client";
import { AiProviderId } from "./ai.constants";
import {
  AiUsageAuditRecord,
  AiUsageAuditRepository,
  AiUsageAuditSearchResult,
} from "./ai-usage-audit.repository";
import { SearchAiUsageDto } from "./dto/search-ai-usage.dto";

export interface RecordSuccessfulAiUsage {
  workspaceId: string;
  actorId?: string;
  sourceModule: string;
  useCase: string;
  provider: AiProviderId;
  model: string;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface RecordFailedAiUsage {
  workspaceId: string;
  actorId?: string;
  sourceModule: string;
  useCase: string;
  provider: AiProviderId;
  model: string;
  durationMs: number;
  errorCode: string;
  errorMessage: string;
}

@Injectable()
export class AiUsageAuditService {
  constructor(private readonly repository: AiUsageAuditRepository) {}

  recordSuccess(data: RecordSuccessfulAiUsage): Promise<AiUsageAuditRecord> {
    return this.repository.create({ ...data, status: AiUsageStatus.SUCCESS });
  }

  recordFailure(data: RecordFailedAiUsage): Promise<AiUsageAuditRecord> {
    return this.repository.create({ ...data, status: AiUsageStatus.FAILED });
  }

  async assertContext(workspaceId: string, actorId?: string): Promise<void> {
    if (!(await this.repository.workspaceExists(workspaceId))) {
      throw new BadRequestException("AI usage Workspace does not exist");
    }

    if (
      actorId !== undefined &&
      !(await this.repository.isActiveWorkspaceMember(workspaceId, actorId))
    ) {
      throw new BadRequestException(
        "AI usage actor must be an active Workspace member",
      );
    }
  }

  async list(
    workspaceId: string,
    requestingUserId: string,
    query: SearchAiUsageDto,
  ): Promise<AiUsageAuditSearchResult> {
    if (!(await this.repository.isActiveWorkspaceMember(workspaceId, requestingUserId))) {
      throw new ForbiddenException("Workspace access is required");
    }

    const from = query.from === undefined ? undefined : new Date(query.from);
    const to = query.to === undefined ? undefined : new Date(query.to);

    if (from !== undefined && to !== undefined && from > to) {
      throw new BadRequestException("AI usage period is invalid");
    }

    return this.repository.search(workspaceId, {
      status: query.status,
      provider: query.provider,
      useCase: query.useCase,
      from,
      to,
      page: query.page,
      pageSize: query.pageSize,
    });
  }
}
