import { Module } from "@nestjs/common";
import { PlatformAuthorizationModule } from "../platform-administration/platform-authorization.module";
import { OffersModule } from "../offers/offers.module";
import { PricingModule } from "../pricing/pricing.module";
import { SUBSCRIPTIONS_CONTRACT } from "../shared/contracts/subscriptions.contract";
import { WorkspaceModule } from "../workspace/workspace.module";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsRepository } from "./subscriptions.repository";
import { SubscriptionsService } from "./subscriptions.service";

@Module({
  imports: [
    PlatformAuthorizationModule,
    WorkspaceModule,
    OffersModule,
    PricingModule,
  ],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsRepository,
    SubscriptionsService,
    { provide: SUBSCRIPTIONS_CONTRACT, useExisting: SubscriptionsService },
  ],
  exports: [SUBSCRIPTIONS_CONTRACT],
})
export class SubscriptionsModule {}
