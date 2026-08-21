import { Module } from "@nestjs/common";
import { PlatformAdministrationController } from "./platform-administration.controller";
import { PlatformAdministrationRepository } from "./platform-administration.repository";
import { PlatformAdministrationService } from "./platform-administration.service";
import { PlatformSubscriptionsController } from "./platform-subscriptions.controller";
import { PlatformSubscriptionsRepository } from "./platform-subscriptions.repository";
import { PlatformSubscriptionsService } from "./platform-subscriptions.service";
import { PlatformRolesGuard } from "./platform-roles.guard";

@Module({
  controllers: [
    PlatformAdministrationController,
    PlatformSubscriptionsController,
  ],
  providers: [
    PlatformAdministrationRepository,
    PlatformAdministrationService,
    PlatformSubscriptionsRepository,
    PlatformSubscriptionsService,
    PlatformRolesGuard,
  ],
})
export class PlatformAdministrationModule {}
