import { Module } from "@nestjs/common";
import { OfferFeaturesController } from "./offer-features.controller";
import { OfferFeaturesRepository } from "./offer-features.repository";
import { OfferFeaturesService } from "./offer-features.service";
import { OffersController } from "./offers.controller";
import { OffersRepository } from "./offers.repository";
import { OffersService } from "./offers.service";

@Module({
  controllers: [OffersController, OfferFeaturesController],
  providers: [
    OffersRepository,
    OffersService,
    OfferFeaturesRepository,
    OfferFeaturesService,
  ],
})
export class OffersModule {}
