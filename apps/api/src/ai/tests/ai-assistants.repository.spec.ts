import { AiAssistantStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AiAssistantsRepository } from "../ai-assistants.repository";

describe("AiAssistantsRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const assistant = {
    id: "20000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "CRM-SUMMARY",
    name: "CRM summary",
    description: null,
    instructions: "Summarize the supplied CRM context.",
    status: AiAssistantStatus.DRAFT,
    createdAt: new Date("2026-08-13T12:00:00.000Z"),
    updatedAt: new Date("2026-08-13T12:00:00.000Z"),
  };

  it("creates and lists Workspace assistants", async () => {
    const create = jest.fn().mockResolvedValue(assistant);
    const findMany = jest.fn().mockResolvedValue([assistant]);
    const repository = new AiAssistantsRepository(
      mockPrisma({ create, findMany }),
    );
    const data = {
      workspaceId,
      code: assistant.code,
      name: assistant.name,
      instructions: assistant.instructions,
    };

    await repository.create(data);
    await repository.findByWorkspace(workspaceId);

    expect(create).toHaveBeenCalledWith({ data });
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  });

  it("finds an assistant by Workspace and code", async () => {
    const findUnique = jest.fn().mockResolvedValue(assistant);
    const repository = new AiAssistantsRepository(mockPrisma({ findUnique }));

    await repository.findByCode(workspaceId, assistant.code);

    expect(findUnique).toHaveBeenCalledWith({
      where: {
        workspaceId_code: { workspaceId, code: assistant.code },
      },
    });
  });

  it("updates only draft or inactive assistants", async () => {
    const updateManyAndReturn = jest.fn().mockResolvedValue([assistant]);
    const repository = new AiAssistantsRepository(
      mockPrisma({ updateManyAndReturn }),
    );

    await repository.updateConfigurable(workspaceId, assistant.id, {
      name: "Updated",
    });

    expect(updateManyAndReturn).toHaveBeenCalledWith({
      where: {
        id: assistant.id,
        workspaceId,
        status: {
          in: [AiAssistantStatus.DRAFT, AiAssistantStatus.INACTIVE],
        },
      },
      data: { name: "Updated" },
    });
  });

  it("transitions and deletes only within the Workspace", async () => {
    const updateManyAndReturn = jest.fn().mockResolvedValue([assistant]);
    const deleteMany = jest.fn().mockResolvedValue({ count: 1 });
    const repository = new AiAssistantsRepository(
      mockPrisma({ updateManyAndReturn, deleteMany }),
    );

    await repository.transition(
      workspaceId,
      assistant.id,
      [AiAssistantStatus.DRAFT, AiAssistantStatus.INACTIVE],
      AiAssistantStatus.ACTIVE,
    );
    await expect(
      repository.deleteDraft(workspaceId, assistant.id),
    ).resolves.toBe(true);

    expect(updateManyAndReturn).toHaveBeenCalledWith({
      where: {
        id: assistant.id,
        workspaceId,
        status: {
          in: [AiAssistantStatus.DRAFT, AiAssistantStatus.INACTIVE],
        },
      },
      data: { status: AiAssistantStatus.ACTIVE },
    });
    expect(deleteMany).toHaveBeenCalledWith({
      where: {
        id: assistant.id,
        workspaceId,
        status: AiAssistantStatus.DRAFT,
      },
    });
  });
});

function mockPrisma(methods: Record<string, jest.Mock>): PrismaService {
  return {
    aiAssistant: {
      create: methods.create ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findUnique: methods.findUnique ?? jest.fn(),
      updateManyAndReturn: methods.updateManyAndReturn ?? jest.fn(),
      deleteMany: methods.deleteMany ?? jest.fn(),
    },
  } as unknown as PrismaService;
}
