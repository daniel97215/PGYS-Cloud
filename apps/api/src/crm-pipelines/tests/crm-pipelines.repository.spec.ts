import { CrmPipelineStageType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CrmPipelinesRepository } from "../crm-pipelines.repository";

describe("CrmPipelinesRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const pipelineId = "20000000-0000-4000-8000-000000000001";
  const stageId = "30000000-0000-4000-8000-000000000001";
  const pipeline = {
    id: pipelineId,
    workspaceId,
    code: "SALES",
    name: "Sales pipeline",
    description: "Default commercial pipeline",
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

  it("creates and lists workspace-scoped pipelines", async () => {
    const create = jest.fn().mockResolvedValue(pipeline);
    const findMany = jest.fn().mockResolvedValue([pipeline]);
    const repository = new CrmPipelinesRepository(
      createPrismaMock({ pipelineCreate: create, pipelineFindMany: findMany }),
    );

    await expect(
      repository.createPipeline({
        workspaceId,
        code: pipeline.code,
        name: pipeline.name,
      }),
    ).resolves.toEqual(pipeline);
    await expect(repository.findPipelinesByWorkspace(workspaceId)).resolves.toEqual([
      pipeline,
    ]);
    expect(create).toHaveBeenCalledWith({
      data: { workspaceId, code: pipeline.code, name: pipeline.name },
    });
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  });

  it("updates and deactivates a pipeline within its workspace", async () => {
    const update = jest.fn().mockResolvedValue(pipeline);
    const repository = new CrmPipelinesRepository(
      createPrismaMock({ pipelineUpdate: update }),
    );

    await repository.updatePipeline(workspaceId, pipelineId, {
      name: "Updated pipeline",
    });
    await repository.deactivatePipeline(workspaceId, pipelineId);

    expect(update).toHaveBeenNthCalledWith(1, {
      where: { id: pipelineId, workspaceId },
      data: { name: "Updated pipeline" },
    });
    expect(update).toHaveBeenNthCalledWith(2, {
      where: { id: pipelineId, workspaceId },
      data: { isActive: false },
    });
  });

  it("finds a pipeline by workspace and code", async () => {
    const findUnique = jest.fn().mockResolvedValue(pipeline);
    const repository = new CrmPipelinesRepository(
      createPrismaMock({ pipelineFindUnique: findUnique }),
    );

    await expect(
      repository.findPipelineByCode(workspaceId, pipeline.code),
    ).resolves.toEqual(pipeline);
    expect(findUnique).toHaveBeenCalledWith({
      where: { workspaceId_code: { workspaceId, code: pipeline.code } },
    });
  });

  it("creates and lists ordered workspace-scoped stages", async () => {
    const create = jest.fn().mockResolvedValue(stage);
    const findMany = jest.fn().mockResolvedValue([stage]);
    const repository = new CrmPipelinesRepository(
      createPrismaMock({ stageCreate: create, stageFindMany: findMany }),
    );

    await expect(
      repository.createStage({
        workspaceId,
        pipelineId,
        code: stage.code,
        name: stage.name,
        position: stage.position,
        type: stage.type,
      }),
    ).resolves.toEqual(stage);
    await expect(
      repository.findStagesByPipeline(workspaceId, pipelineId),
    ).resolves.toEqual([stage]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId, pipelineId },
      orderBy: [{ position: "asc" }, { code: "asc" }],
    });
  });

  it("updates and deactivates a stage within its workspace and pipeline", async () => {
    const update = jest.fn().mockResolvedValue(stage);
    const repository = new CrmPipelinesRepository(
      createPrismaMock({ stageUpdate: update }),
    );

    await repository.updateStage(workspaceId, pipelineId, stageId, {
      type: CrmPipelineStageType.WON,
    });
    await repository.deactivateStage(workspaceId, pipelineId, stageId);

    expect(update).toHaveBeenNthCalledWith(1, {
      where: { id: stageId, workspaceId, pipelineId },
      data: { type: CrmPipelineStageType.WON },
    });
    expect(update).toHaveBeenNthCalledWith(2, {
      where: { id: stageId, workspaceId, pipelineId },
      data: { isActive: false },
    });
  });

  it("finds stages by code and position within the pipeline", async () => {
    const findFirst = jest.fn().mockResolvedValue(stage);
    const repository = new CrmPipelinesRepository(
      createPrismaMock({ stageFindFirst: findFirst }),
    );

    await repository.findStageByCode(workspaceId, pipelineId, stage.code);
    await repository.findStageByPosition(workspaceId, pipelineId, stage.position);

    expect(findFirst).toHaveBeenNthCalledWith(1, {
      where: { workspaceId, pipelineId, code: stage.code },
    });
    expect(findFirst).toHaveBeenNthCalledWith(2, {
      where: { workspaceId, pipelineId, position: stage.position },
    });
  });
});

function createPrismaMock(methods: {
  pipelineCreate?: jest.Mock;
  pipelineUpdate?: jest.Mock;
  pipelineFindMany?: jest.Mock;
  pipelineFindUnique?: jest.Mock;
  stageCreate?: jest.Mock;
  stageUpdate?: jest.Mock;
  stageFindMany?: jest.Mock;
  stageFindFirst?: jest.Mock;
}): PrismaService {
  return {
    crmPipeline: {
      create: methods.pipelineCreate ?? jest.fn(),
      update: methods.pipelineUpdate ?? jest.fn(),
      findMany: methods.pipelineFindMany ?? jest.fn(),
      findUnique: methods.pipelineFindUnique ?? jest.fn(),
    },
    crmPipelineStage: {
      create: methods.stageCreate ?? jest.fn(),
      update: methods.stageUpdate ?? jest.fn(),
      findMany: methods.stageFindMany ?? jest.fn(),
      findFirst: methods.stageFindFirst ?? jest.fn(),
    },
  } as unknown as PrismaService;
}
