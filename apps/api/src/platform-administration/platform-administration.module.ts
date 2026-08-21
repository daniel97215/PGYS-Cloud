import { Module } from "@nestjs/common";
import { PlatformAuthorizationModule } from "./platform-authorization.module";
import { PlatformAdministrationController } from "./platform-administration.controller";
import { PlatformAdministrationService } from "./platform-administration.service";
import { PlatformAuditController } from "./platform-audit.controller";
import { PlatformAuditRepository } from "./platform-audit.repository";
import { PlatformAuditService } from "./platform-audit.service";
import { PlatformSubscriptionsController } from "./platform-subscriptions.controller";
import { PlatformSubscriptionsRepository } from "./platform-subscriptions.repository";
import { PlatformSubscriptionsService } from "./platform-subscriptions.service";

@Module({
  imports: [PlatformAuthorizationModule],
  controllers: [
    PlatformAdministrationController,
    PlatformAuditController,
    PlatformSubscriptionsController,
  ],
  providers: [
    PlatformAdministrationService,
    PlatformAuditRepository,
    PlatformAuditService,
    PlatformSubscriptionsRepository,
    PlatformSubscriptionsService,
  ],
})
export class PlatformAdministrationModule {}
