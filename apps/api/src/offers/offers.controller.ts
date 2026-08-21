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
import {
  PlatformAdminOnly,
  PlatformOperatorReadAccess,
} from "../platform-administration/platform-access.decorators";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { OffersService } from "./offers.service";

@ApiTags("Offers")
@PlatformOperatorReadAccess()
@Controller("offers")
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @ApiOperation({ summary: "Create an offer" })
  @ApiBody({ type: CreateOfferDto })
  @ApiCreatedResponse({ description: "Offer created" })
  @PlatformAdminOnly()
  @Post()
  create(@Body() data: CreateOfferDto) {
    return this.offersService.createOffer(data);
  }

  @ApiOperation({ summary: "List offers" })
  @ApiOkResponse({ description: "Offers" })
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.offersService.listOffers(query);
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
  @PlatformAdminOnly()
  @Patch(":key")
  update(@Param("key") key: string, @Body() data: UpdateOfferDto) {
    return this.offersService.updateOffer(key, data);
  }

  @ApiOperation({ summary: "Activate a draft offer" })
  @PlatformAdminOnly()
  @Post(":key/activate")
  activate(@Param("key") key: string) {
    return this.offersService.activateOffer(key);
  }

  @ApiOperation({ summary: "Archive an offer" })
  @ApiParam({ name: "key" })
  @ApiNoContentResponse({ description: "Offer archived" })
  @ApiNotFoundResponse({ description: "Offer not found" })
  @PlatformAdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":key")
  async archive(@Param("key") key: string): Promise<void> {
    await this.offersService.archiveOffer(key);
  }
}
