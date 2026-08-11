import { Injectable } from "@nestjs/common";
import { CrmPipelineStageType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export type CrmPipelineRecord = Prisma.CrmPipelineGetPayload<object>;
export type CrmPipelineStageRecord = Prisma.CrmPipelineStageGetPayload<object>;

export interface CreateCrmPipelineData {
  workspaceId: string;
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateCrmPipelineData = Omit<
  Partial<CreateCrmPipelineData>,
  "workspaceId" | "code"
>;

export interface CreateCrmPipelineStageData {
  workspaceId: string;
  pipelineId: string;
  code: string;
  name: string;
  description?: string;
  position: number;
  type: CrmPipelineStageType;
  isActive?: boolean;
}

export type UpdateCrmPipelineStageData = Omit<
  Partial<CreateCrmPipelineStageData>,
  "workspaceId" | "pipelineId" | "code"
>;

@Injectable()
export class CrmPipelinesRepository {
  constructor(private readonly prisma: PrismaService) {}

  createPipeline(data: CreateCrmPipelineData): Promise<CrmPipelineRecord> {
    return this.prisma.crmPipeline.create({ data });
  }

  updatePipeline(
    workspaceId: string,
    pipelineId: string,
    data: UpdateCrmPipelineData,
  ): Promise<CrmPipelineRecord> {
    return this.prisma.crmPipeline.update({
      where: { id: pipelineId, workspaceId },
      data,
    });
  }

  deactivatePipeline(
    workspaceId: string,
    pipelineId: string,
  ): Promise<CrmPipelineRecord> {
    return this.prisma.crmPipeline.update({
      where: { id: pipelineId, workspaceId },
      data: { isActive: false },
    });
  }

  findPipelinesByWorkspace(workspaceId: string): Promise<CrmPipelineRecord[]> {
    return this.prisma.crmPipeline.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  }

  findPipelineByCode(
    workspaceId: string,
    code: string,
  ): Promise<CrmPipelineRecord | null> {
    return this.prisma.crmPipeline.findUnique({
      where: { workspaceId_code: { workspaceId, code } },
    });
  }

  findPipelineById(
    workspaceId: string,
    id: string,
  ): Promise<CrmPipelineRecord | null> {
    return this.prisma.crmPipeline.findFirst({
      where: { id, workspaceId },
    });
  }

  createStage(data: CreateCrmPipelineStageData): Promise<CrmPipelineStageRecord> {
    return this.prisma.crmPipelineStage.create({ data });
  }

  updateStage(
    workspaceId: string,
    pipelineId: string,
    stageId: string,
    data: UpdateCrmPipelineStageData,
  ): Promise<CrmPipelineStageRecord> {
    return this.prisma.crmPipelineStage.update({
      where: { id: stageId, workspaceId, pipelineId },
      data,
    });
  }

  deactivateStage(
    workspaceId: string,
    pipelineId: string,
    stageId: string,
  ): Promise<CrmPipelineStageRecord> {
    return this.prisma.crmPipelineStage.update({
      where: { id: stageId, workspaceId, pipelineId },
      data: { isActive: false },
    });
  }

  findStagesByPipeline(
    workspaceId: string,
    pipelineId: string,
  ): Promise<CrmPipelineStageRecord[]> {
    return this.prisma.crmPipelineStage.findMany({
      where: { workspaceId, pipelineId },
      orderBy: [{ position: "asc" }, { code: "asc" }],
    });
  }

  findStageByCode(
    workspaceId: string,
    pipelineId: string,
    code: string,
  ): Promise<CrmPipelineStageRecord | null> {
    return this.prisma.crmPipelineStage.findFirst({
      where: { workspaceId, pipelineId, code },
    });
  }

  findStageByPosition(
    workspaceId: string,
    pipelineId: string,
    position: number,
  ): Promise<CrmPipelineStageRecord | null> {
    return this.prisma.crmPipelineStage.findFirst({
      where: { workspaceId, pipelineId, position },
    });
  }

  findStageById(
    workspaceId: string,
    pipelineId: string,
    id: string,
  ): Promise<CrmPipelineStageRecord | null> {
    return this.prisma.crmPipelineStage.findFirst({
      where: { id, workspaceId, pipelineId },
    });
  }

  async stageHasOpportunities(
    workspaceId: string,
    stageId: string,
  ): Promise<boolean> {
    const count = await this.prisma.crmOpportunity.count({
      where: { workspaceId, stageId },
    });
    return count > 0;
  }
}
