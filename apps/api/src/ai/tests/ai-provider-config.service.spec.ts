import { ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AI_PROVIDER } from "../ai.constants";
import { AiProviderConfigService } from "../ai-provider-config.service";

describe("AiProviderConfigService", () => {
  const createService = (values: Record<string, string | undefined>) =>
    new AiProviderConfigService({
      get: jest.fn((name: string) => values[name]),
    } as unknown as ConfigService);

  it("loads and normalizes the server-side provider configuration", () => {
    const service = createService({
      AI_PROVIDER: " openai ",
      AI_MODEL: " model-a ",
    });

    expect(service.getConfiguration()).toEqual({
      provider: AI_PROVIDER.OPENAI,
      model: "model-a",
    });
  });

  it("rejects missing configuration", () => {
    expect(() => createService({}).getConfiguration()).toThrow(
      ServiceUnavailableException,
    );
  });

  it("rejects unsupported providers", () => {
    expect(() =>
      createService({ AI_PROVIDER: "unknown", AI_MODEL: "model-a" })
        .getConfiguration(),
    ).toThrow(ServiceUnavailableException);
  });
});
