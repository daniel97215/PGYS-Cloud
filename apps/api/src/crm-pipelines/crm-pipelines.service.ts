import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCrmPipelineDto } from "./dto/create-crm-pipeline.dto";
import { CreateCrmPipelineStageDto } from "./dto/create-crm-pipeline-stage.dto";
import { UpdateCrmPipelineDto } from "./dto/update-crm-pipeline.dto";
import { UpdateCrmPipelineStageDto } from "./dto/update-crm-pipeline-stage.dto";
import {
  CrmPipelineRecord,
  CrmPipelineStageRecord,
  CrmPipelinesRepository,
} from "./crm-pipelines.repository";

@Injectable()
export class CrmPipelinesService {
  constructor(private readonly repository: CrmPipelinesRepository) {}

  async createPipeline(
    workspaceId: string,
    data: CreateCrmPipelineDto,
  ): Promise<CrmPipelineRecord> {
    const code = this.normalizeCode(data.code, "Pipeline");
    const existing = await this.repository.findPipelineByCode(workspaceId, code);

    if (existing) {
      throw new ConflictException(`Pipeline "${code}" already exists`);
    }

    return this.repository.createPipeline({ ...data, workspaceId, code });
  }

  listPipelines(workspaceId: string): Promise<CrmPipelineRecord[]> {
    return this.repository.findPipelinesByWorkspace(workspaceId);
  }

  getPipeline(workspaceId: string, code: string): Promise<CrmPipelineRecord> {
    return this.requirePipeline(workspaceId, code);
  }

  async updatePipeline(
    workspaceId: string,
    code: string,
    data: UpdateCrmPipelineDto,
  ): Promise<CrmPipelineRecord> {
    const pipeline = await this.requirePipeline(workspaceId, code);
    return this.repository.updatePipeline(workspaceId, pipeline.id, data);
  }

  async deactivatePipeline(
    workspaceId: string,
    code: string,
  ): Promise<void> {
    const pipeline = await this.requirePipeline(workspaceId, code);
    await this.repository.deactivatePipeline(workspaceId, pipeline.id);
  }

  async createStage(
    workspaceId: string,
    pipelineCode: string,
    data: CreateCrmPipelineStageDto,
  ): Promise<CrmPipelineStageRecord> {
    const pipeline = await this.requirePipeline(workspaceId, pipelineCode);
    const code = this.normalizeCode(data.code, "Pipeline stage");
    const [existingCode, existingPosition] = await Promise.all([
      this.repository.findStageByCode(workspaceId, pipeline.id, code),
      this.repository.findStageByPosition(
        workspaceId,
        pipeline.id,
        data.position,
      ),
    ]);

    if (existingCode) {
      throw new ConflictException(`Pipeline stage "${code}" already exists`);
    }

    if (existingPosition) {
      throw new ConflictException(
        `Pipeline stage position "${data.position}" already exists`,
      );
    }

    return this.repository.createStage({
      ...data,
      workspaceId,
      pipelineId: pipeline.id,
      code,
    });
  }

  async listStages(
    workspaceId: string,
    pipelineCode: string,
  ): Promise<CrmPipelineStageRecord[]> {
    const pipeline = await this.requirePipeline(workspaceId, pipelineCode);
    return this.repository.findStagesByPipeline(workspaceId, pipeline.id);
  }

  async getStage(
    workspaceId: string,
    pipelineCode: string,
    stageCode: string,
  ): Promise<CrmPipelineStageRecord> {
    const pipeline = await this.requirePipeline(workspaceId, pipelineCode);
    return this.requireStage(workspaceId, pipeline.id, stageCode);
  }

  async updateStage(
    workspaceId: string,
    pipelineCode: string,
    stageCode: string,
    data: UpdateCrmPipelineStageDto,
  ): Promise<CrmPipelineStageRecord> {
    const pipeline = await this.requirePipeline(workspaceId, pipelineCode);
    const stage = await this.requireStage(
      workspaceId,
      pipeline.id,
      stageCode,
    );

    if (data.position !== undefined && data.position !== stage.position) {
      const existingPosition = await this.repository.findStageByPosition(
        workspaceId,
        pipeline.id,
        data.position,
      );

      if (existingPosition && existingPosition.id !== stage.id) {
        throw new ConflictException(
          `Pipeline stage position "${data.position}" already exists`,
        );
      }
    }

    return this.repository.updateStage(
      workspaceId,
      pipeline.id,
      stage.id,
      data,
    );
  }

  async deactivateStage(
    workspaceId: string,
    pipelineCode: string,
    stageCode: string,
  ): Promise<void> {
    const pipeline = await this.requirePipeline(workspaceId, pipelineCode);
    const stage = await this.requireStage(
      workspaceId,
      pipeline.id,
      stageCode,
    );
    await this.repository.deactivateStage(workspaceId, pipeline.id, stage.id);
  }

  private async requirePipeline(
    workspaceId: string,
    code: string,
  ): Promise<CrmPipelineRecord> {
    const normalizedCode = this.normalizeCode(code, "Pipeline");
    const pipeline = await this.repository.findPipelineByCode(
      workspaceId,
      normalizedCode,
    );

    if (!pipeline) {
      throw new NotFoundException(`Pipeline "${code}" not found`);
    }

    return pipeline;
  }

  private async requireStage(
    workspaceId: string,
    pipelineId: string,
    code: string,
  ): Promise<CrmPipelineStageRecord> {
    const normalizedCode = this.normalizeCode(code, "Pipeline stage");
    const stage = await this.repository.findStageByCode(
      workspaceId,
      pipelineId,
      normalizedCode,
    );

    if (!stage) {
      throw new NotFoundException(`Pipeline stage "${code}" not found`);
    }

    return stage;
  }

  private normalizeCode(code: string, label: string): string {
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length === 0) {
      throw new BadRequestException(`${label} code is required`);
    }

    return normalizedCode;
  }
}
