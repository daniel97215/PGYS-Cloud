import { ServiceUnavailableException } from "@nestjs/common";
import { AI_FINISH_REASON, AI_PROVIDER } from "../ai.constants";
import { AiProviderAdapter } from "../ai-provider.contract";
import { AiProviderRegistryService } from "../ai-provider-registry.service";

describe("AiProviderRegistryService", () => {
  const adapter: AiProviderAdapter = {
    providerId: AI_PROVIDER.OPENAI,
    generateText: jest.fn().mockResolvedValue({
      content: "response",
      finishReason: AI_FINISH_REASON.STOP,
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
    }),
  };

  it("returns the adapter matching the configured provider", () => {
    const registry = new AiProviderRegistryService([adapter]);

    expect(registry.get(AI_PROVIDER.OPENAI)).toBe(adapter);
  });

  it("fails cleanly when no adapter is registered", () => {
    const registry = new AiProviderRegistryService([]);

    expect(() => registry.get(AI_PROVIDER.MISTRAL)).toThrow(
      ServiceUnavailableException,
    );
  });
});
