import { Module } from "@nestjs/common";
import { AI_PROVIDER_ADAPTERS } from "./ai.constants";
import { AiPlatformService } from "./ai-platform.service";
import { AiProviderConfigService } from "./ai-provider-config.service";
import { AiProviderRegistryService } from "./ai-provider-registry.service";
import { AiUsageAuditController } from "./ai-usage-audit.controller";
import { AiUsageAuditRepository } from "./ai-usage-audit.repository";
import { AiUsageAuditService } from "./ai-usage-audit.service";
import { AiAssistantsController } from "./ai-assistants.controller";
import { AiAssistantsRepository } from "./ai-assistants.repository";
import { AiAssistantsService } from "./ai-assistants.service";

@Module({
  controllers: [AiAssistantsController, AiUsageAuditController],
  providers: [
    { provide: AI_PROVIDER_ADAPTERS, useValue: [] },
    AiProviderConfigService,
    AiProviderRegistryService,
    AiUsageAuditRepository,
    AiUsageAuditService,
    AiAssistantsRepository,
    AiAssistantsService,
    AiPlatformService,
  ],
  exports: [AiPlatformService],
})
export class AiModule {}
