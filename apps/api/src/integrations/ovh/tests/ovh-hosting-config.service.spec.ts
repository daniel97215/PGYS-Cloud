import { ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OvhHostingConfigService } from "../ovh-hosting-config.service";

describe("OvhHostingConfigService", () => {
  const createService = (values: Record<string, string | undefined>) =>
    new OvhHostingConfigService({
      get: jest.fn((name: string) => values[name]),
    } as unknown as ConfigService);

  it("loads the global non-secret OVH hosting configuration", () => {
    const service = createService({
      OVH_API_ENDPOINT: " https://eu.api.ovh.com ",
      OVH_HOSTING_PROFILE: " web-pro-v1 ",
    });

    expect(service.getConfiguration()).toEqual({
      apiEndpoint: "https://eu.api.ovh.com",
      hostingProfile: "web-pro-v1",
    });
  });

  it("rejects incomplete or unsafe configuration", () => {
    expect(() => createService({}).getConfiguration()).toThrow(
      ServiceUnavailableException,
    );
    expect(() =>
      createService({
        OVH_API_ENDPOINT: "http://eu.api.ovh.com",
        OVH_HOSTING_PROFILE: "web pro",
      }).getConfiguration(),
    ).toThrow(ServiceUnavailableException);
  });
});
