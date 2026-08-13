import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { AiUsageStatus } from "@prisma/client";
import { AI_PROVIDER } from "../ai.constants";
import { AiUsageAuditRepository } from "../ai-usage-audit.repository";
import { AiUsageAuditService } from "../ai-usage-audit.service";

describe("AiUsageAuditService", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const actorId = "20000000-0000-4000-8000-000000000001";
  let repository: jest.Mocked<AiUsageAuditRepository>;
  let service: AiUsageAuditService;

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue({}),
      workspaceExists: jest.fn().mockResolvedValue(true),
      isActiveWorkspaceMember: jest.fn().mockResolvedValue(true),
      search: jest.fn().mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 25,
      }),
    } as unknown as jest.Mocked<AiUsageAuditRepository>;
    service = new AiUsageAuditService(repository);
  });

  it("validates the Workspace and optional actor before an AI call", async () => {
    await service.assertContext(workspaceId, actorId);

    expect(repository.workspaceExists).toHaveBeenCalledWith(workspaceId);
    expect(repository.isActiveWorkspaceMember).toHaveBeenCalledWith(
      workspaceId,
      actorId,
    );
  });

  it("rejects an actor outside the Workspace", async () => {
    repository.isActiveWorkspaceMember.mockResolvedValueOnce(false);

    await expect(service.assertContext(workspaceId, actorId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("records success without prompt or response content", async () => {
    await service.recordSuccess({
      workspaceId,
      actorId,
      sourceModule: "CRM",
      useCase: "OPPORTUNITY_SUMMARY",
      provider: AI_PROVIDER.OPENAI,
      model: "model-a",
      durationMs: 20,
      inputTokens: 4,
      outputTokens: 2,
      totalTokens: 6,
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: AiUsageStatus.SUCCESS }),
    );
  });

  it("requires active membership to read usage entries", async () => {
    repository.isActiveWorkspaceMember.mockResolvedValueOnce(false);

    await expect(service.list(workspaceId, actorId, {})).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("rejects an inverted search period", async () => {
    await expect(
      service.list(workspaceId, actorId, {
        from: "2026-08-14T00:00:00.000Z",
        to: "2026-08-13T00:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
