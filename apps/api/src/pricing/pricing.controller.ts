import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { CreatePriceDto } from "./dto/create-price.dto";
import { UpdatePriceDto } from "./dto/update-price.dto";
import { PricingService } from "./pricing.service";

@ApiTags("Pricing")
@Controller("pricing")
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @ApiOperation({ summary: "Create a price for an offer" })
  @ApiParam({ name: "offerKey" })
  @ApiBody({ type: CreatePriceDto })
  @ApiCreatedResponse({ description: "Price created" })
  @ApiNotFoundResponse({ description: "Offer not found" })
  @Post("offers/:offerKey/prices")
  create(
    @Param("offerKey") offerKey: string,
    @Body() data: CreatePriceDto,
  ) {
    return this.pricingService.createPrice(offerKey, data);
  }

  @ApiOperation({ summary: "List prices for an offer" })
  @ApiParam({ name: "offerKey" })
  @ApiOkResponse({ description: "Offer prices" })
  @ApiNotFoundResponse({ description: "Offer not found" })
  @Get("offers/:offerKey/prices")
  findAllForOffer(
    @Param("offerKey") offerKey: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.pricingService.listPricesForOffer(offerKey, query);
  }

  @ApiOperation({ summary: "Get active price for an offer" })
  @ApiParam({ name: "offerKey" })
  @ApiOkResponse({ description: "Active offer price" })
  @ApiNotFoundResponse({ description: "Offer or active price not found" })
  @Get("offers/:offerKey/prices/active")
  findActiveForOffer(@Param("offerKey") offerKey: string) {
    return this.pricingService.getActivePriceForOffer(offerKey);
  }

  @ApiOperation({ summary: "Update a price" })
  @ApiParam({ name: "priceId" })
  @ApiBody({ type: UpdatePriceDto })
  @ApiOkResponse({ description: "Price updated" })
  @ApiNotFoundResponse({ description: "Price not found" })
  @Patch("prices/:priceId")
  update(
    @Param("priceId", new ParseUUIDPipe({ version: "4" })) priceId: string,
    @Body() data: UpdatePriceDto,
  ) {
    return this.pricingService.updatePrice(priceId, data);
  }

  @ApiOperation({ summary: "Archive a price" })
  @ApiParam({ name: "priceId" })
  @ApiNoContentResponse({ description: "Price archived" })
  @ApiNotFoundResponse({ description: "Price not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete("prices/:priceId")
  async archive(
    @Param("priceId", new ParseUUIDPipe({ version: "4" })) priceId: string,
  ): Promise<void> {
    await this.pricingService.archivePrice(priceId);
  }
}
