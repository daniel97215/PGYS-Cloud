import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { CrmPipelineStageType } from "@prisma/client";
import { CrmPipelinesRepository } from "../crm-pipelines.repository";
import { CrmPipelinesService } from "../crm-pipelines.service";

describe("CrmPipelinesService", () => {
  let repository: jest.Mocked<CrmPipelinesRepository>;
  let service: CrmPipelinesService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const pipelineId = "20000000-0000-4000-8000-000000000001";
  const stageId = "30000000-0000-4000-8000-000000000001";
  const pipeline = {
    id: pipelineId,
    workspaceId,
    code: "SALES",
    name: "Sales pipeline",
    description: null,
    isActive: true,
    createdAt: new Date("2026-08-11T00:00:00.000Z"),
    updatedAt: new Date("2026-08-11T00:00:00.000Z"),
  };
  const stage = {
    id: stageId,
    workspaceId,
    pipelineId,
    code: "QUALIFIED",
    name: "Qualified",
    description: null,
    position: 1,
    type: CrmPipelineStageType.OPEN,
    isActive: true,
    createdAt: new Date("2026-08-11T00:00:00.000Z"),
    updatedAt: new Date("2026-08-11T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      createPipeline: jest.fn().mockResolvedValue(pipeline),
      updatePipeline: jest.fn().mockResolvedValue(pipeline),
      deactivatePipeline: jest.fn().mockResolvedValue({
        ...pipeline,
        isActive: false,
      }),
      findPipelinesByWorkspace: jest.fn().mockResolvedValue([pipeline]),
      findPipelineByCode: jest.fn().mockResolvedValue(pipeline),
      createStage: jest.fn().mockResolvedValue(stage),
      updateStage: jest.fn().mockResolvedValue(stage),
      deactivateStage: jest.fn().mockResolvedValue({
        ...stage,
        isActive: false,
      }),
      findStagesByPipeline: jest.fn().mockResolvedValue([stage]),
      findStageByCode: jest.fn().mockResolvedValue(stage),
      findStageByPosition: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<CrmPipelinesRepository>;
    service = new CrmPipelinesService(repository);
  });

  it("creates a pipeline with an uppercase workspace-scoped code", async () => {
    repository.findPipelineByCode.mockResolvedValueOnce(null);

    await expect(
      service.createPipeline(workspaceId, {
        code: "sales",
        name: pipeline.name,
      }),
    ).resolves.toEqual(pipeline);
    expect(repository.findPipelineByCode).toHaveBeenCalledWith(
      workspaceId,
      pipeline.code,
    );
    expect(repository.createPipeline).toHaveBeenCalledWith({
      workspaceId,
      code: pipeline.code,
      name: pipeline.name,
    });
  });

  it("rejects a duplicate pipeline code in the workspace", async () => {
    await expect(
      service.createPipeline(workspaceId, {
        code: pipeline.code,
        name: pipeline.name,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.createPipeline).not.toHaveBeenCalled();
  });

  it("lists, updates, and deactivates a workspace pipeline", async () => {
    await expect(service.listPipelines(workspaceId)).resolves.toEqual([pipeline]);
    await service.updatePipeline(workspaceId, "sales", {
      name: "Updated pipeline",
    });
    await service.deactivatePipeline(workspaceId, "sales");

    expect(repository.updatePipeline).toHaveBeenCalledWith(
      workspaceId,
      pipelineId,
      { name: "Updated pipeline" },
    );
    expect(repository.deactivatePipeline).toHaveBeenCalledWith(
      workspaceId,
      pipelineId,
    );
  });

  it("rejects an unknown pipeline", async () => {
    repository.findPipelineByCode.mockResolvedValueOnce(null);
    await expect(service.getPipeline(workspaceId, "unknown")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("creates an ordered stage in a workspace pipeline", async () => {
    repository.findStageByCode.mockResolvedValueOnce(null);

    await expect(
      service.createStage(workspaceId, "sales", {
        code: "qualified",
        name: stage.name,
        position: 1,
        type: CrmPipelineStageType.OPEN,
      }),
    ).resolves.toEqual(stage);
    expect(repository.createStage).toHaveBeenCalledWith({
      workspaceId,
      pipelineId,
      code: stage.code,
      name: stage.name,
      position: 1,
      type: CrmPipelineStageType.OPEN,
    });
  });

  it("rejects duplicate stage codes and positions", async () => {
    await expect(
      service.createStage(workspaceId, "sales", {
        code: stage.code,
        name: stage.name,
        position: 2,
        type: CrmPipelineStageType.OPEN,
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    repository.findStageByCode.mockResolvedValueOnce(null);
    repository.findStageByPosition.mockResolvedValueOnce(stage);
    await expect(
      service.createStage(workspaceId, "sales", {
        code: "proposal",
        name: "Proposal",
        position: stage.position,
        type: CrmPipelineStageType.OPEN,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.createStage).not.toHaveBeenCalled();
  });

  it("lists and gets stages only through their workspace pipeline", async () => {
    await expect(service.listStages(workspaceId, "sales")).resolves.toEqual([
      stage,
    ]);
    await expect(
      service.getStage(workspaceId, "sales", "qualified"),
    ).resolves.toEqual(stage);
    expect(repository.findStagesByPipeline).toHaveBeenCalledWith(
      workspaceId,
      pipelineId,
    );
  });

  it("updates a stage and prevents a duplicate position", async () => {
    await service.updateStage(workspaceId, "sales", "qualified", {
      name: "Updated stage",
      position: 1,
    });
    expect(repository.updateStage).toHaveBeenCalledWith(
      workspaceId,
      pipelineId,
      stageId,
      { name: "Updated stage", position: 1 },
    );

    repository.findStageByPosition.mockResolvedValueOnce({
      ...stage,
      id: "40000000-0000-4000-8000-000000000001",
      position: 2,
    });
    await expect(
      service.updateStage(workspaceId, "sales", "qualified", { position: 2 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("deactivates a stage without deleting it", async () => {
    await service.deactivateStage(workspaceId, "sales", "qualified");
    expect(repository.deactivateStage).toHaveBeenCalledWith(
      workspaceId,
      pipelineId,
      stageId,
    );
  });

  it("rejects blank pipeline and stage codes", async () => {
    await expect(service.getPipeline(workspaceId, " ")).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(
      service.getStage(workspaceId, "sales", " "),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
