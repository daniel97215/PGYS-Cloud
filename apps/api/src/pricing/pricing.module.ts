import { Module } from "@nestjs/common";
import { PlatformAuthorizationModule } from "../platform-administration/platform-authorization.module";
import { OffersModule } from "../offers/offers.module";
import { PRICING_CONTRACT } from "../shared/contracts/pricing.contract";
import { PricingController } from "./pricing.controller";
import { PricingRepository } from "./pricing.repository";
import { PricingService } from "./pricing.service";

@Module({
  imports: [PlatformAuthorizationModule, OffersModule],
  controllers: [PricingController],
  providers: [
    PricingRepository,
    PricingService,
    { provide: PRICING_CONTRACT, useExisting: PricingService },
  ],
  exports: [PRICING_CONTRACT],
})
export class PricingModule {}
