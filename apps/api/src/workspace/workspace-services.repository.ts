import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { WORKSPACE_SERVICE_STATUSES } from "./workspace-services.constants";

export type WorkspaceServiceRecord =
  Prisma.WorkspaceServiceGetPayload<object>;
export type WorkspaceServiceConfiguration = Prisma.InputJsonObject;

@Injectable()
export class WorkspaceServicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByWorkspace(workspaceId: string): Promise<WorkspaceServiceRecord[]> {
    return this.prisma.workspaceService.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
    });
  }

  findByWorkspaceAndServiceKey(
    workspaceId: string,
    serviceKey: string,
  ): Promise<WorkspaceServiceRecord | null> {
    return this.prisma.workspaceService.findUnique({
      where: {
        workspaceId_serviceKey: {
          workspaceId,
          serviceKey,
        },
      },
    });
  }

  activate(
    workspaceId: string,
    serviceKey: string,
    configuration?: WorkspaceServiceConfiguration,
  ): Promise<WorkspaceServiceRecord> {
    const activatedAt = new Date();
    const configurationData =
      configuration === undefined ? {} : { configuration };

    return this.prisma.workspaceService.upsert({
      where: {
        workspaceId_serviceKey: {
          workspaceId,
          serviceKey,
        },
      },
      create: {
        workspaceId,
        serviceKey,
        status: WORKSPACE_SERVICE_STATUSES.ACTIVE,
        activatedAt,
        deactivatedAt: null,
        ...configurationData,
      },
      update: {
        status: WORKSPACE_SERVICE_STATUSES.ACTIVE,
        activatedAt,
        deactivatedAt: null,
        ...configurationData,
      },
    });
  }

  disable(
    workspaceId: string,
    serviceKey: string,
  ): Promise<WorkspaceServiceRecord> {
    return this.prisma.workspaceService.update({
      where: {
        workspaceId_serviceKey: {
          workspaceId,
          serviceKey,
        },
      },
      data: {
        status: WORKSPACE_SERVICE_STATUSES.INACTIVE,
        deactivatedAt: new Date(),
      },
    });
  }

  updateConfiguration(
    workspaceId: string,
    serviceKey: string,
    configuration: WorkspaceServiceConfiguration,
  ): Promise<WorkspaceServiceRecord> {
    return this.prisma.workspaceService.update({
      where: {
        workspaceId_serviceKey: {
          workspaceId,
          serviceKey,
        },
      },
      data: {
        configuration,
      },
    });
  }
}
