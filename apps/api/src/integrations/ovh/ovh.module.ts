import { Module } from "@nestjs/common";
import { OVH_HOSTING_PROVIDER_ADAPTERS } from "./ovh-hosting.constants";
import { OvhHostingConfigService } from "./ovh-hosting-config.service";
import { OvhHostingProviderRegistryService } from "./ovh-hosting-provider-registry.service";
import { OvhHostingRepository } from "./ovh-hosting.repository";
import { OvhHostingService } from "./ovh-hosting.service";

@Module({
  providers: [
    { provide: OVH_HOSTING_PROVIDER_ADAPTERS, useValue: [] },
    OvhHostingRepository,
    OvhHostingConfigService,
    OvhHostingProviderRegistryService,
    OvhHostingService,
  ],
  exports: [OvhHostingService],
})
export class OvhModule {}
