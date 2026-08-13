import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { OVH_HOSTING_PROVIDER_ADAPTERS } from "./ovh-hosting.constants";
import { OvhHostingProviderAdapter } from "./ovh-hosting-provider.contract";

@Injectable()
export class OvhHostingProviderRegistryService {
  constructor(
    @Inject(OVH_HOSTING_PROVIDER_ADAPTERS)
    private readonly adapters: readonly OvhHostingProviderAdapter[],
  ) {}

  get(): OvhHostingProviderAdapter {
    const adapter = this.adapters.find(
      (candidate) => candidate.providerId === "OVH",
    );

    if (!adapter) {
      throw new ServiceUnavailableException(
        "OVH hosting provider is unavailable",
      );
    }
    return adapter;
  }
}
