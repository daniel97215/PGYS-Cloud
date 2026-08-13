import { ServiceUnavailableException } from "@nestjs/common";
import { EMAIL_DELIVERY_STATUS } from "../email.constants";
import { EmailProviderAdapter } from "../email-provider.contract";
import { EmailProviderRegistryService } from "../email-provider-registry.service";

describe("EmailProviderRegistryService", () => {
  const adapter: EmailProviderAdapter = {
    providerId: "PROVIDER-A",
    send: jest.fn().mockResolvedValue({
      status: EMAIL_DELIVERY_STATUS.ACCEPTED,
      externalReference: "external-a",
    }),
  };

  it("resolves an adapter without case sensitivity", () => {
    const registry = new EmailProviderRegistryService([adapter]);

    expect(registry.get("provider-a")).toBe(adapter);
  });

  it("fails cleanly when no adapter is registered", () => {
    const registry = new EmailProviderRegistryService([]);

    expect(() => registry.get("PROVIDER-A")).toThrow(
      ServiceUnavailableException,
    );
  });
});
