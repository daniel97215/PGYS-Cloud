import { Injectable, NotFoundException } from "@nestjs/common";
import { PlatformOperatorRole } from "@prisma/client";
import { SearchPlatformWorkspacesDto } from "./dto/search-platform-workspaces.dto";
import {
  PlatformWorkspacePageResponseDto,
  PlatformWorkspaceResponseDto,
} from "./dto/platform-workspace-response.dto";
import {
  PlatformAdministrationRepository,
  PlatformWorkspaceRecord,
} from "./platform-administration.repository";

@Injectable()
export class PlatformAdministrationService {
  constructor(private readonly repository: PlatformAdministrationRepository) {}

  async searchWorkspaces(
    criteria: SearchPlatformWorkspacesDto,
    accessRole: PlatformOperatorRole,
  ): Promise<PlatformWorkspacePageResponseDto> {
    const result = await this.repository.searchWorkspaces(criteria);

    return {
      items: result.items.map((item) => this.toWorkspaceView(item)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      accessRole,
    };
  }

  async getWorkspace(id: string): Promise<PlatformWorkspaceResponseDto> {
    const workspace = await this.repository.findWorkspaceById(id);

    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    return this.toWorkspaceView(workspace);
  }

  private toWorkspaceView(
    workspace: PlatformWorkspaceRecord,
  ): PlatformWorkspaceResponseDto {
    return {
      id: workspace.id,
      displayName: workspace.displayName,
      slug: workspace.slug,
      status: workspace.status,
      billingEmail: workspace.billingEmail,
      memberCount: workspace._count.members,
      serviceCount: workspace._count.services,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }
}
