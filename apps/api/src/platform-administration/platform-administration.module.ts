import { Module } from "@nestjs/common";
import { PlatformAdministrationController } from "./platform-administration.controller";
import { PlatformAdministrationRepository } from "./platform-administration.repository";
import { PlatformAdministrationService } from "./platform-administration.service";
import { PlatformAuditController } from "./platform-audit.controller";
import { PlatformAuditRepository } from "./platform-audit.repository";
import { PlatformAuditService } from "./platform-audit.service";
import { PlatformSubscriptionsController } from "./platform-subscriptions.controller";
import { PlatformSubscriptionsRepository } from "./platform-subscriptions.repository";
import { PlatformSubscriptionsService } from "./platform-subscriptions.service";
import { PlatformRolesGuard } from "./platform-roles.guard";

@Module({
  controllers: [
    PlatformAdministrationController,
    PlatformAuditController,
    PlatformSubscriptionsController,
  ],
  providers: [
    PlatformAdministrationRepository,
    PlatformAdministrationService,
    PlatformAuditRepository,
    PlatformAuditService,
    PlatformSubscriptionsRepository,
    PlatformSubscriptionsService,
    PlatformRolesGuard,
  ],
})
export class PlatformAdministrationModule {}
