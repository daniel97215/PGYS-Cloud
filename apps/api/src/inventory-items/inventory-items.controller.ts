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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CreateInventoryItemDto } from "./dto/create-inventory-item.dto";
import { UpdateInventoryItemDto } from "./dto/update-inventory-item.dto";
import { InventoryItemsService } from "./inventory-items.service";

@ApiTags("Inventory Items")
@Controller("workspaces/:workspaceId/inventory-items")
export class InventoryItemsController {
  constructor(private readonly inventoryItemsService: InventoryItemsService) {}

  @ApiOperation({ summary: "Create an inventory item" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateInventoryItemDto })
  @ApiCreatedResponse({ description: "Inventory item created" })
  @ApiNotFoundResponse({ description: "Referenced resource not found" })
  @ApiConflictResponse({ description: "Inventory item already exists" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateInventoryItemDto,
  ) {
    return this.inventoryItemsService.create(workspaceId, data);
  }

  @ApiOperation({ summary: "List inventory items by storage location" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "storageLocationId", format: "uuid" })
  @ApiOkResponse({ description: "Storage location inventory items" })
  @ApiNotFoundResponse({ description: "Storage location not found" })
  @Get("locations/:storageLocationId")
  listByLocation(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("storageLocationId", new ParseUUIDPipe({ version: "4" }))
    storageLocationId: string,
  ) {
    return this.inventoryItemsService.listByLocation(
      workspaceId,
      storageLocationId,
    );
  }

  @ApiOperation({ summary: "List inventory items by product" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "productId", format: "uuid" })
  @ApiOkResponse({ description: "Product inventory items" })
  @ApiNotFoundResponse({ description: "Product not found" })
  @Get("products/:productId")
  listByProduct(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("productId", new ParseUUIDPipe({ version: "4" }))
    productId: string,
  ) {
    return this.inventoryItemsService.listByProduct(workspaceId, productId);
  }

  @ApiOperation({ summary: "Get an inventory item" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "inventoryItemId", format: "uuid" })
  @ApiOkResponse({ description: "Inventory item" })
  @ApiNotFoundResponse({ description: "Inventory item not found" })
  @Get(":inventoryItemId")
  get(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("inventoryItemId", new ParseUUIDPipe({ version: "4" }))
    inventoryItemId: string,
  ) {
    return this.inventoryItemsService.get(workspaceId, inventoryItemId);
  }

  @ApiOperation({ summary: "Update an inventory item" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "inventoryItemId", format: "uuid" })
  @ApiBody({ type: UpdateInventoryItemDto })
  @ApiOkResponse({ description: "Inventory item updated" })
  @ApiNotFoundResponse({ description: "Inventory item not found" })
  @Patch(":inventoryItemId")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("inventoryItemId", new ParseUUIDPipe({ version: "4" }))
    inventoryItemId: string,
    @Body() data: UpdateInventoryItemDto,
  ) {
    return this.inventoryItemsService.update(
      workspaceId,
      inventoryItemId,
      data,
    );
  }

  @ApiOperation({ summary: "Deactivate an inventory item" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "inventoryItemId", format: "uuid" })
  @ApiNoContentResponse({ description: "Inventory item deactivated" })
  @ApiNotFoundResponse({ description: "Inventory item not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":inventoryItemId")
  async deactivate(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("inventoryItemId", new ParseUUIDPipe({ version: "4" }))
    inventoryItemId: string,
  ): Promise<void> {
    await this.inventoryItemsService.deactivate(workspaceId, inventoryItemId);
  }
}
