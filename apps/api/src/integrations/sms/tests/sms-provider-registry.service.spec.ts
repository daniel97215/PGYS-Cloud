import { ServiceUnavailableException } from "@nestjs/common";
import { SMS_DELIVERY_STATUS } from "../sms.constants";
import { SmsProviderAdapter } from "../sms-provider.contract";
import { SmsProviderRegistryService } from "../sms-provider-registry.service";

describe("SmsProviderRegistryService", () => {
  const adapter: SmsProviderAdapter = {
    providerId: "PROVIDER-A",
    send: jest.fn().mockResolvedValue({
      status: SMS_DELIVERY_STATUS.ACCEPTED,
      externalReference: "external-a",
    }),
  };

  it("resolves an adapter without case sensitivity", () => {
    const registry = new SmsProviderRegistryService([adapter]);

    expect(registry.get("provider-a")).toBe(adapter);
  });

  it("fails cleanly when no adapter is registered", () => {
    const registry = new SmsProviderRegistryService([]);

    expect(() => registry.get("PROVIDER-A")).toThrow(
      ServiceUnavailableException,
    );
  });
});
