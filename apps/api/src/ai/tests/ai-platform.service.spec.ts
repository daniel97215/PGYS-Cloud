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

describe("AiPlatformService", () => {
  const providerResponse = {
    content: "Generated response",
    finishReason: AI_FINISH_REASON.STOP,
    usage: { inputTokens: 4, outputTokens: 2, totalTokens: 6 },
  };
  let adapter: jest.Mocked<AiProviderAdapter>;
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

    service = new AiPlatformService(config, registry);
  });

  it("normalizes a text request and returns a provider-independent response", async () => {
    const result = await service.generateText({
      workspaceId: "workspace-a",
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
  });

  it("requires a workspace", async () => {
    await expect(
      service.generateText({
        workspaceId: " ",
        messages: [{ role: AI_MESSAGE_ROLE.USER, content: "Hello" }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("requires at least one non-empty message", async () => {
    await expect(
      service.generateText({ workspaceId: "workspace-a", messages: [] }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.generateText({
        workspaceId: "workspace-a",
        messages: [{ role: AI_MESSAGE_ROLE.USER, content: " " }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
