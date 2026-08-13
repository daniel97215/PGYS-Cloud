import { ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SmsProviderConfigService } from "../sms-provider-config.service";

describe("SmsProviderConfigService", () => {
  const createService = (values: Record<string, string | undefined>) =>
    new SmsProviderConfigService({
      get: jest.fn((name: string) => values[name]),
    } as unknown as ConfigService);

  it("loads and normalizes the provider and optional sender", () => {
    const service = createService({
      SMS_PROVIDER: " provider-a ",
      SMS_FROM: " PGYS ",
    });

    expect(service.getConfiguration()).toEqual({
      provider: "PROVIDER-A",
      from: "PGYS",
    });
  });

  it("supports a provider without a configured sender", () => {
    const service = createService({ SMS_PROVIDER: "PROVIDER-A" });

    expect(service.getConfiguration()).toEqual({ provider: "PROVIDER-A" });
  });

  it("rejects missing or invalid configuration", () => {
    expect(() => createService({}).getConfiguration()).toThrow(
      ServiceUnavailableException,
    );
    expect(() =>
      createService({
        SMS_PROVIDER: "PROVIDER-A",
        SMS_FROM: "X".repeat(33),
      }).getConfiguration(),
    ).toThrow(ServiceUnavailableException);
  });
});
