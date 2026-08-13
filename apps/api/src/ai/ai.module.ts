import { Module } from "@nestjs/common";
import { AI_PROVIDER_ADAPTERS } from "./ai.constants";
import { AiPlatformService } from "./ai-platform.service";
import { AiProviderConfigService } from "./ai-provider-config.service";
import { AiProviderRegistryService } from "./ai-provider-registry.service";

@Module({
  providers: [
    { provide: AI_PROVIDER_ADAPTERS, useValue: [] },
    AiProviderConfigService,
    AiProviderRegistryService,
    AiPlatformService,
  ],
  exports: [AiPlatformService],
})
export class AiModule {}
