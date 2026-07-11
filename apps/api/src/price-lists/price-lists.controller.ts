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
import { CreatePriceListDto } from "./dto/create-price-list.dto";
import { UpdatePriceListDto } from "./dto/update-price-list.dto";
import { PriceListsService } from "./price-lists.service";

@ApiTags("Price Lists")
@Controller("workspaces/:workspaceId/price-lists")
export class PriceListsController {
  constructor(private readonly priceListsService: PriceListsService) {}

  @ApiOperation({ summary: "Create a price list" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreatePriceListDto })
  @ApiCreatedResponse({ description: "Price list created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreatePriceListDto,
  ) {
    return this.priceListsService.create(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace price lists" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace price lists" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.priceListsService.list(workspaceId);
  }

  @ApiOperation({ summary: "Get a price list by code" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiOkResponse({ description: "Price list" })
  @ApiNotFoundResponse({ description: "Price list not found" })
  @Get(":code")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ) {
    return this.priceListsService.getByCode(workspaceId, code);
  }

  @ApiOperation({ summary: "Update a price list" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiBody({ type: UpdatePriceListDto })
  @ApiOkResponse({ description: "Price list updated" })
  @ApiNotFoundResponse({ description: "Price list not found" })
  @Patch(":code")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
    @Body() data: UpdatePriceListDto,
  ) {
    return this.priceListsService.update(workspaceId, code, data);
  }

  @ApiOperation({ summary: "Deactivate a price list" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiNoContentResponse({ description: "Price list deactivated" })
  @ApiNotFoundResponse({ description: "Price list not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":code")
  async deactivate(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ): Promise<void> {
    await this.priceListsService.deactivate(workspaceId, code);
  }
}
