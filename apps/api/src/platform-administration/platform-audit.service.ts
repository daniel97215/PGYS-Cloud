import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PlatformOperatorRole } from "@prisma/client";
import {
  PlatformAuditPageResponseDto,
  PlatformAuditResponseDto,
} from "./dto/platform-audit-response.dto";
import { SearchPlatformAuditDto } from "./dto/search-platform-audit.dto";
import {
  PlatformAuditRecord,
  PlatformAuditRepository,
} from "./platform-audit.repository";

@Injectable()
export class PlatformAuditService {
  constructor(private readonly repository: PlatformAuditRepository) {}

  async search(
    query: SearchPlatformAuditDto,
    accessRole: PlatformOperatorRole,
  ): Promise<PlatformAuditPageResponseDto> {
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;

    if (from && to && from > to) {
      throw new BadRequestException("Audit period is invalid");
    }

    const result = await this.repository.search({ ...query, from, to });
    return {
      items: result.items.map((item) => this.toView(item)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      accessRole,
    };
  }

  async getOne(id: string): Promise<PlatformAuditResponseDto> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException("Audit entry not found");
    }

    return this.toView(entry);
  }

  private toView(entry: PlatformAuditRecord): PlatformAuditResponseDto {
    return {
      id: entry.id,
      action: entry.action,
      workspace: entry.workspace,
      actor: entry.actor
        ? {
            id: entry.actor.id,
            displayName: `${entry.actor.firstName} ${entry.actor.lastName}`.trim(),
            email: entry.actor.email,
          }
        : null,
      targetType: entry.targetType,
      targetId: entry.targetId,
      metadataAvailable: entry.metadata !== null,
      createdAt: entry.createdAt,
    };
  }
}
