import { Module } from "@nestjs/common";
import { AI_PROVIDER_ADAPTERS } from "./ai.constants";
import { AiPlatformService } from "./ai-platform.service";
import { AiProviderConfigService } from "./ai-provider-config.service";
import { AiProviderRegistryService } from "./ai-provider-registry.service";
import { AiUsageAuditController } from "./ai-usage-audit.controller";
import { AiUsageAuditRepository } from "./ai-usage-audit.repository";
import { AiUsageAuditService } from "./ai-usage-audit.service";

@Module({
  controllers: [AiUsageAuditController],
  providers: [
    { provide: AI_PROVIDER_ADAPTERS, useValue: [] },
    AiProviderConfigService,
    AiProviderRegistryService,
    AiUsageAuditRepository,
    AiUsageAuditService,
    AiPlatformService,
  ],
  exports: [AiPlatformService],
})
export class AiModule {}
