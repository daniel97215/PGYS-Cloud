import { ServiceUnavailableException } from "@nestjs/common";
import { OvhHostingProviderAdapter } from "../ovh-hosting-provider.contract";
import { OvhHostingProviderRegistryService } from "../ovh-hosting-provider-registry.service";

describe("OvhHostingProviderRegistryService", () => {
  const adapter: OvhHostingProviderAdapter = {
    providerId: "OVH",
    createHostingInstance: jest.fn(),
    getHostingInstance: jest.fn(),
    suspendHostingInstance: jest.fn(),
    reactivateHostingInstance: jest.fn(),
  };

  it("returns the registered OVH hosting adapter", () => {
    expect(new OvhHostingProviderRegistryService([adapter]).get()).toBe(
      adapter,
    );
  });

  it("fails cleanly while no OVH adapter is installed", () => {
    expect(() => new OvhHostingProviderRegistryService([]).get()).toThrow(
      ServiceUnavailableException,
    );
  });
});
