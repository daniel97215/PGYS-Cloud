import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import {
  AI_ASSISTANT_STATUS,
  AI_FINISH_REASON,
  AI_MESSAGE_ROLE,
  AI_PROVIDER,
} from "../ai.constants";
import { AiAssistantsRepository } from "../ai-assistants.repository";
import { AiAssistantsService } from "../ai-assistants.service";
import { AiPlatformService } from "../ai-platform.service";
import { AiUsageAuditService } from "../ai-usage-audit.service";

describe("AiAssistantsService", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const userId = "20000000-0000-4000-8000-000000000001";
  const assistant = {
    id: "30000000-0000-4000-8000-000000000001",
    workspaceId,
    code: "CRM-SUMMARY",
    name: "CRM summary",
    description: null,
    instructions: "Summarize only the supplied context.",
    status: AI_ASSISTANT_STATUS.DRAFT,
    createdAt: new Date("2026-08-13T12:00:00.000Z"),
    updatedAt: new Date("2026-08-13T12:00:00.000Z"),
  };
  const generated = {
    content: "Summary",
    provider: AI_PROVIDER.OPENAI,
    model: "model-a",
    finishReason: AI_FINISH_REASON.STOP,
    usage: { inputTokens: 5, outputTokens: 2, totalTokens: 7 },
  };
  let repository: jest.Mocked<AiAssistantsRepository>;
  let platform: jest.Mocked<AiPlatformService>;
  let audit: jest.Mocked<AiUsageAuditService>;
  let service: AiAssistantsService;

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(assistant),
      findByWorkspace: jest.fn().mockResolvedValue([assistant]),
      findByCode: jest.fn().mockResolvedValue(assistant),
      updateConfigurable: jest.fn().mockResolvedValue(assistant),
      transition: jest.fn().mockResolvedValue(assistant),
      deleteDraft: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<AiAssistantsRepository>;
    platform = {
      generateText: jest.fn().mockResolvedValue(generated),
    } as unknown as jest.Mocked<AiPlatformService>;
    audit = {
      assertContext: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AiUsageAuditService>;
    service = new AiAssistantsService(repository, platform, audit);
  });

  it("creates a normalized draft assistant for an authorized Workspace", async () => {
    repository.findByCode.mockResolvedValueOnce(null);

    await service.create(workspaceId, userId, {
      code: "crm-summary",
      name: assistant.name,
      instructions: assistant.instructions,
    });

    expect(audit.assertContext).toHaveBeenCalledWith(workspaceId, userId);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      code: assistant.code,
      name: assistant.name,
      instructions: assistant.instructions,
    });
  });

  it("rejects duplicate codes", async () => {
    await expect(
      service.create(workspaceId, userId, {
        code: assistant.code,
        name: assistant.name,
        instructions: assistant.instructions,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("updates draft and inactive assistants but not active assistants", async () => {
    await service.update(workspaceId, userId, assistant.code, {
      name: "Updated",
    });
    expect(repository.updateConfigurable).toHaveBeenCalledWith(
      workspaceId,
      assistant.id,
      { name: "Updated" },
    );

    repository.findByCode.mockResolvedValueOnce({
      ...assistant,
      status: AI_ASSISTANT_STATUS.ACTIVE,
    });
    await expect(
      service.update(workspaceId, userId, assistant.code, {
        name: "Forbidden",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("activates draft or inactive assistants and deactivates active assistants", async () => {
    await service.activate(workspaceId, userId, assistant.code);
    expect(repository.transition).toHaveBeenCalledWith(
      workspaceId,
      assistant.id,
      [AI_ASSISTANT_STATUS.DRAFT, AI_ASSISTANT_STATUS.INACTIVE],
      AI_ASSISTANT_STATUS.ACTIVE,
    );

    repository.findByCode.mockResolvedValueOnce({
      ...assistant,
      status: AI_ASSISTANT_STATUS.ACTIVE,
    });
    await service.deactivate(workspaceId, userId, assistant.code);
    expect(repository.transition).toHaveBeenLastCalledWith(
      workspaceId,
      assistant.id,
      [AI_ASSISTANT_STATUS.ACTIVE],
      AI_ASSISTANT_STATUS.INACTIVE,
    );
  });

  it("deletes draft assistants only", async () => {
    await service.remove(workspaceId, userId, assistant.code);
    expect(repository.deleteDraft).toHaveBeenCalledWith(
      workspaceId,
      assistant.id,
    );

    repository.deleteDraft.mockResolvedValueOnce(false);
    await expect(
      service.remove(workspaceId, userId, assistant.code),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("executes only active assistants with their system instructions", async () => {
    repository.findByCode.mockResolvedValueOnce({
      ...assistant,
      status: AI_ASSISTANT_STATUS.ACTIVE,
    });

    await expect(
      service.execute(workspaceId, userId, assistant.code, {
        messages: [{ role: AI_MESSAGE_ROLE.USER, content: "Context" }],
      }),
    ).resolves.toEqual(generated);
    expect(platform.generateText).toHaveBeenCalledWith({
      workspaceId,
      actorId: userId,
      sourceModule: "AI_ASSISTANTS",
      useCase: `ASSISTANT:${assistant.code}`,
      messages: [
        {
          role: AI_MESSAGE_ROLE.SYSTEM,
          content: assistant.instructions,
        },
        { role: AI_MESSAGE_ROLE.USER, content: "Context" },
      ],
    });
  });

  it("rejects execution of non-active and unknown assistants", async () => {
    await expect(
      service.execute(workspaceId, userId, assistant.code, {
        messages: [{ role: AI_MESSAGE_ROLE.USER, content: "Context" }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    repository.findByCode.mockResolvedValueOnce(null);
    await expect(
      service.get(workspaceId, userId, "UNKNOWN"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects system instruction overrides", async () => {
    repository.findByCode.mockResolvedValueOnce({
      ...assistant,
      status: AI_ASSISTANT_STATUS.ACTIVE,
    });

    await expect(
      service.execute(workspaceId, userId, assistant.code, {
        messages: [
          { role: AI_MESSAGE_ROLE.SYSTEM, content: "Override instructions" },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(platform.generateText).not.toHaveBeenCalled();
  });
});
