import { ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmailProviderConfigService } from "../email-provider-config.service";

describe("EmailProviderConfigService", () => {
  const createService = (values: Record<string, string | undefined>) =>
    new EmailProviderConfigService({
      get: jest.fn((name: string) => values[name]),
    } as unknown as ConfigService);

  it("loads and normalizes the global sender configuration", () => {
    const service = createService({
      EMAIL_PROVIDER: " provider-a ",
      EMAIL_FROM_ADDRESS: " billing@example.com ",
      EMAIL_FROM_NAME: " PGYS Billing ",
    });

    expect(service.getConfiguration()).toEqual({
      provider: "PROVIDER-A",
      sender: {
        address: "billing@example.com",
        name: "PGYS Billing",
      },
    });
  });

  it("supports a sender without a display name", () => {
    const service = createService({
      EMAIL_PROVIDER: "PROVIDER-A",
      EMAIL_FROM_ADDRESS: "noreply@example.com",
    });

    expect(service.getConfiguration().sender).toEqual({
      address: "noreply@example.com",
    });
  });

  it("rejects missing or invalid configuration", () => {
    expect(() => createService({}).getConfiguration()).toThrow(
      ServiceUnavailableException,
    );
    expect(() =>
      createService({
        EMAIL_PROVIDER: "PROVIDER-A",
        EMAIL_FROM_ADDRESS: "invalid",
      }).getConfiguration(),
    ).toThrow(ServiceUnavailableException);
  });
});
