import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { CreateStockMovementDto } from "./dto/create-stock-movement.dto";
import { StockMovementsService } from "./stock-movements.service";

@ApiTags("Stock Movements")
@Controller("workspaces/:workspaceId/stock-movements")
export class StockMovementsController {
  constructor(
    private readonly stockMovementsService: StockMovementsService,
  ) {}

  @ApiOperation({ summary: "Create a stock movement" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateStockMovementDto })
  @ApiCreatedResponse({ description: "Stock movement created" })
  @ApiNotFoundResponse({ description: "Inventory item not found" })
  @ApiBadRequestResponse({
    description: "Invalid quantity, inactive item, or insufficient stock",
  })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateStockMovementDto,
  ) {
    return this.stockMovementsService.create(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace stock movements" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace stock movements" })
  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.stockMovementsService.list(workspaceId);
  }

  @ApiOperation({ summary: "List stock movements by inventory item" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "inventoryItemId", format: "uuid" })
  @ApiOkResponse({ description: "Inventory item stock movements" })
  @ApiNotFoundResponse({ description: "Inventory item not found" })
  @Get("inventory-items/:inventoryItemId")
  listByInventoryItem(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("inventoryItemId", new ParseUUIDPipe({ version: "4" }))
    inventoryItemId: string,
  ) {
    return this.stockMovementsService.listByInventoryItem(
      workspaceId,
      inventoryItemId,
    );
  }

  @ApiOperation({ summary: "Get a stock movement" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "stockMovementId", format: "uuid" })
  @ApiOkResponse({ description: "Stock movement" })
  @ApiNotFoundResponse({ description: "Stock movement not found" })
  @Get(":stockMovementId")
  get(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("stockMovementId", new ParseUUIDPipe({ version: "4" }))
    stockMovementId: string,
  ) {
    return this.stockMovementsService.get(workspaceId, stockMovementId);
  }
}
