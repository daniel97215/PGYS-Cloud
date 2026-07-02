import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
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
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { OffersService } from "./offers.service";

@ApiTags("Offers")
@Controller("offers")
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @ApiOperation({ summary: "Create an offer" })
  @ApiBody({ type: CreateOfferDto })
  @ApiCreatedResponse({ description: "Offer created" })
  @Post()
  create(@Body() data: CreateOfferDto) {
    return this.offersService.createOffer(data);
  }

  @ApiOperation({ summary: "List offers" })
  @ApiOkResponse({ description: "Offers" })
  @Get()
  findAll() {
    return this.offersService.listOffers();
  }

  @ApiOperation({ summary: "Get an offer by key" })
  @ApiParam({ name: "key" })
  @ApiOkResponse({ description: "Offer" })
  @ApiNotFoundResponse({ description: "Offer not found" })
  @Get(":key")
  findOne(@Param("key") key: string) {
    return this.offersService.getOffer(key);
  }

  @ApiOperation({ summary: "Update an offer" })
  @ApiParam({ name: "key" })
  @ApiBody({ type: UpdateOfferDto })
  @ApiOkResponse({ description: "Offer updated" })
  @ApiNotFoundResponse({ description: "Offer not found" })
  @Patch(":key")
  update(@Param("key") key: string, @Body() data: UpdateOfferDto) {
    return this.offersService.updateOffer(key, data);
  }

  @ApiOperation({ summary: "Archive an offer" })
  @ApiParam({ name: "key" })
  @ApiNoContentResponse({ description: "Offer archived" })
  @ApiNotFoundResponse({ description: "Offer not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":key")
  async archive(@Param("key") key: string): Promise<void> {
    await this.offersService.archiveOffer(key);
  }
}
