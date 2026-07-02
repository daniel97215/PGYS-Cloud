import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { OfferFeaturesService } from "./offer-features.service";

@ApiTags("Offer Features")
@Controller()
export class OfferFeaturesController {
  constructor(private readonly offerFeaturesService: OfferFeaturesService) {}

  @ApiOperation({ summary: "Add a feature to an offer" })
  @ApiParam({ name: "offerKey" })
  @ApiParam({ name: "featureKey" })
  @ApiCreatedResponse({ description: "Feature added to offer" })
  @ApiNotFoundResponse({ description: "Offer or feature not found" })
  @Post("offers/:offerKey/features/:featureKey")
  addFeatureToOffer(
    @Param("offerKey") offerKey: string,
    @Param("featureKey") featureKey: string,
  ) {
    return this.offerFeaturesService.addFeatureToOffer(offerKey, featureKey);
  }

  @ApiOperation({ summary: "List features for an offer" })
  @ApiParam({ name: "offerKey" })
  @ApiOkResponse({ description: "Offer features" })
  @ApiNotFoundResponse({ description: "Offer not found" })
  @Get("offers/:offerKey/features")
  listFeaturesForOffer(@Param("offerKey") offerKey: string) {
    return this.offerFeaturesService.listFeaturesForOffer(offerKey);
  }

  @ApiOperation({ summary: "List offers using a feature" })
  @ApiParam({ name: "featureKey" })
  @ApiOkResponse({ description: "Offers using feature" })
  @ApiNotFoundResponse({ description: "Feature not found" })
  @Get("features/:featureKey/offers")
  listOffersForFeature(@Param("featureKey") featureKey: string) {
    return this.offerFeaturesService.listOffersForFeature(featureKey);
  }

  @ApiOperation({ summary: "Remove a feature from an offer" })
  @ApiParam({ name: "offerKey" })
  @ApiParam({ name: "featureKey" })
  @ApiNoContentResponse({ description: "Feature removed from offer" })
  @ApiNotFoundResponse({ description: "Offer, feature or relation not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete("offers/:offerKey/features/:featureKey")
  async removeFeatureFromOffer(
    @Param("offerKey") offerKey: string,
    @Param("featureKey") featureKey: string,
  ): Promise<void> {
    await this.offerFeaturesService.removeFeatureFromOffer(
      offerKey,
      featureKey,
    );
  }
}
