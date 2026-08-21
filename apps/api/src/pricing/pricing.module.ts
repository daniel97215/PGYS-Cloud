import { Module } from "@nestjs/common";
import { PlatformAuthorizationModule } from "../platform-administration/platform-authorization.module";
import { PricingController } from "./pricing.controller";
import { PricingRepository } from "./pricing.repository";
import { PricingService } from "./pricing.service";

@Module({
  imports: [PlatformAuthorizationModule],
  controllers: [PricingController],
  providers: [PricingRepository, PricingService],
})
export class PricingModule {}
