import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CreateInventoryCountDto } from "./dto/create-inventory-count.dto";
import { UpdateInventoryCountLineDto } from "./dto/update-inventory-count-line.dto";
import { InventoryCountsService } from "./inventory-counts.service";

@ApiTags("Inventory Counts")
@Controller("workspaces/:workspaceId/inventory-counts")
export class InventoryCountsController {
  constructor(
    private readonly inventoryCountsService: InventoryCountsService,
  ) {}

  @ApiOperation({ summary: "Create an inventory count with snapshot lines" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateInventoryCountDto })
  @ApiCreatedResponse({ description: "Inventory count created" })
  @ApiNotFoundResponse({ description: "Warehouse or location not found" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateInventoryCountDto,
  ) {
    return this.inventoryCountsService.create(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace inventory counts" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace inventory counts" })
  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.inventoryCountsService.list(workspaceId);
  }

  @ApiOperation({ summary: "Get an inventory count and its lines" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "inventoryCountId", format: "uuid" })
  @ApiOkResponse({ description: "Inventory count" })
  @ApiNotFoundResponse({ description: "Inventory count not found" })
  @Get(":inventoryCountId")
  get(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("inventoryCountId", new ParseUUIDPipe({ version: "4" }))
    inventoryCountId: string,
  ) {
    return this.inventoryCountsService.get(workspaceId, inventoryCountId);
  }

  @ApiOperation({ summary: "Record a counted quantity" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "inventoryCountId", format: "uuid" })
  @ApiParam({ name: "lineId", format: "uuid" })
  @ApiBody({ type: UpdateInventoryCountLineDto })
  @ApiOkResponse({ description: "Inventory count line updated" })
  @ApiNotFoundResponse({ description: "Inventory count or line not found" })
  @ApiBadRequestResponse({ description: "Inventory count is immutable" })
  @Patch(":inventoryCountId/lines/:lineId")
  updateLine(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("inventoryCountId", new ParseUUIDPipe({ version: "4" }))
    inventoryCountId: string,
    @Param("lineId", new ParseUUIDPipe({ version: "4" }))
    lineId: string,
    @Body() data: UpdateInventoryCountLineDto,
  ) {
    return this.inventoryCountsService.updateLine(
      workspaceId,
      inventoryCountId,
      lineId,
      data,
    );
  }

  @ApiOperation({ summary: "Start an inventory count" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "inventoryCountId", format: "uuid" })
  @ApiOkResponse({ description: "Inventory count started" })
  @ApiBadRequestResponse({ description: "Invalid inventory count state" })
  @Post(":inventoryCountId/start")
  start(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("inventoryCountId", new ParseUUIDPipe({ version: "4" }))
    inventoryCountId: string,
  ) {
    return this.inventoryCountsService.start(workspaceId, inventoryCountId);
  }

  @ApiOperation({ summary: "Complete an inventory count" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "inventoryCountId", format: "uuid" })
  @ApiOkResponse({ description: "Inventory count completed" })
  @ApiBadRequestResponse({ description: "Incomplete or immutable count" })
  @Post(":inventoryCountId/complete")
  complete(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("inventoryCountId", new ParseUUIDPipe({ version: "4" }))
    inventoryCountId: string,
  ) {
    return this.inventoryCountsService.complete(workspaceId, inventoryCountId);
  }

  @ApiOperation({ summary: "Cancel an inventory count" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "inventoryCountId", format: "uuid" })
  @ApiOkResponse({ description: "Inventory count cancelled" })
  @ApiBadRequestResponse({ description: "Inventory count is immutable" })
  @Post(":inventoryCountId/cancel")
  cancel(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("inventoryCountId", new ParseUUIDPipe({ version: "4" }))
    inventoryCountId: string,
  ) {
    return this.inventoryCountsService.cancel(workspaceId, inventoryCountId);
  }
}
