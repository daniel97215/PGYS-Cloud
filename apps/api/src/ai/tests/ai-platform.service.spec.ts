import { BadRequestException } from "@nestjs/common";
import {
  AI_FINISH_REASON,
  AI_MESSAGE_ROLE,
  AI_PROVIDER,
} from "../ai.constants";
import { AiProviderAdapter } from "../ai-provider.contract";
import { AiPlatformService } from "../ai-platform.service";
import { AiProviderConfigService } from "../ai-provider-config.service";
import { AiProviderRegistryService } from "../ai-provider-registry.service";
import { AiUsageAuditService } from "../ai-usage-audit.service";

describe("AiPlatformService", () => {
  const providerResponse = {
    content: "Generated response",
    finishReason: AI_FINISH_REASON.STOP,
    usage: { inputTokens: 4, outputTokens: 2, totalTokens: 6 },
  };
  let adapter: jest.Mocked<AiProviderAdapter>;
  let audit: jest.Mocked<AiUsageAuditService>;
  let service: AiPlatformService;

  beforeEach(() => {
    adapter = {
      providerId: AI_PROVIDER.OPENAI,
      generateText: jest.fn().mockResolvedValue(providerResponse),
    };
    const config = {
      getConfiguration: jest.fn().mockReturnValue({
        provider: AI_PROVIDER.OPENAI,
        model: "model-a",
      }),
    } as unknown as AiProviderConfigService;
    const registry = {
      get: jest.fn().mockReturnValue(adapter),
    } as unknown as AiProviderRegistryService;
    audit = {
      assertContext: jest.fn().mockResolvedValue(undefined),
      recordSuccess: jest.fn().mockResolvedValue({}),
      recordFailure: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<AiUsageAuditService>;

    service = new AiPlatformService(config, registry, audit);
  });

  it("normalizes a text request and returns a provider-independent response", async () => {
    const result = await service.generateText({
      workspaceId: "workspace-a",
      actorId: "user-a",
      sourceModule: "CRM",
      useCase: "OPPORTUNITY_SUMMARY",
      messages: [{ role: AI_MESSAGE_ROLE.USER, content: "  Hello  " }],
    });

    expect(adapter.generateText).toHaveBeenCalledWith({
      model: "model-a",
      messages: [{ role: AI_MESSAGE_ROLE.USER, content: "Hello" }],
    });
    expect(result).toEqual({
      ...providerResponse,
      provider: AI_PROVIDER.OPENAI,
      model: "model-a",
    });
    expect(audit.assertContext).toHaveBeenCalledWith("workspace-a", "user-a");
    expect(audit.recordSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "workspace-a",
        actorId: "user-a",
        sourceModule: "CRM",
        useCase: "OPPORTUNITY_SUMMARY",
        provider: AI_PROVIDER.OPENAI,
        model: "model-a",
        inputTokens: 4,
        outputTokens: 2,
        totalTokens: 6,
        durationMs: expect.any(Number),
      }),
    );
  });

  it("records a sanitized failure and preserves the provider error", async () => {
    const providerError = new Error("sensitive provider detail");
    adapter.generateText.mockRejectedValueOnce(providerError);

    await expect(
      service.generateText({
        workspaceId: "workspace-a",
        sourceModule: "CRM",
        useCase: "OPPORTUNITY_SUMMARY",
        messages: [{ role: AI_MESSAGE_ROLE.USER, content: "Hello" }],
      }),
    ).rejects.toBe(providerError);
    expect(audit.recordFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: "AI_PROVIDER_ERROR",
        errorMessage: "AI provider request failed",
      }),
    );
    expect(audit.recordSuccess).not.toHaveBeenCalled();
  });

  it("requires a workspace", async () => {
    await expect(
      service.generateText({
        workspaceId: " ",
        sourceModule: "CRM",
        useCase: "SUMMARY",
        messages: [{ role: AI_MESSAGE_ROLE.USER, content: "Hello" }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("requires at least one non-empty message", async () => {
    await expect(
      service.generateText({
        workspaceId: "workspace-a",
        sourceModule: "CRM",
        useCase: "SUMMARY",
        messages: [],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.generateText({
        workspaceId: "workspace-a",
        sourceModule: "CRM",
        useCase: "SUMMARY",
        messages: [{ role: AI_MESSAGE_ROLE.USER, content: " " }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
