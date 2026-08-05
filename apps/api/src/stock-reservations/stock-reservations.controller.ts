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
import { CreateStockReservationDto } from "./dto/create-stock-reservation.dto";
import { StockReservationsService } from "./stock-reservations.service";

@ApiTags("Stock Reservations")
@Controller("workspaces/:workspaceId/stock-reservations")
export class StockReservationsController {
  constructor(
    private readonly stockReservationsService: StockReservationsService,
  ) {}

  @ApiOperation({ summary: "Create a stock reservation" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateStockReservationDto })
  @ApiCreatedResponse({ description: "Stock reservation created" })
  @ApiBadRequestResponse({ description: "Insufficient available stock" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateStockReservationDto,
  ) {
    return this.stockReservationsService.create(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace stock reservations" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace stock reservations" })
  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.stockReservationsService.list(workspaceId);
  }

  @ApiOperation({ summary: "List reservations by inventory item" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "inventoryItemId", format: "uuid" })
  @ApiOkResponse({ description: "Inventory item stock reservations" })
  @Get("inventory-items/:inventoryItemId")
  listByInventoryItem(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("inventoryItemId", new ParseUUIDPipe({ version: "4" }))
    inventoryItemId: string,
  ) {
    return this.stockReservationsService.listByInventoryItem(
      workspaceId,
      inventoryItemId,
    );
  }

  @ApiOperation({ summary: "Get a stock reservation" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "reservationId", format: "uuid" })
  @ApiOkResponse({ description: "Stock reservation" })
  @ApiNotFoundResponse({ description: "Stock reservation not found" })
  @Get(":reservationId")
  get(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("reservationId", new ParseUUIDPipe({ version: "4" }))
    reservationId: string,
  ) {
    return this.stockReservationsService.get(workspaceId, reservationId);
  }

  @Post(":reservationId/release")
  release(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("reservationId", new ParseUUIDPipe({ version: "4" }))
    reservationId: string,
  ) {
    return this.stockReservationsService.release(workspaceId, reservationId);
  }

  @Post(":reservationId/cancel")
  cancel(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("reservationId", new ParseUUIDPipe({ version: "4" }))
    reservationId: string,
  ) {
    return this.stockReservationsService.cancel(workspaceId, reservationId);
  }

  @Post(":reservationId/consume")
  consume(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("reservationId", new ParseUUIDPipe({ version: "4" }))
    reservationId: string,
  ) {
    return this.stockReservationsService.consume(workspaceId, reservationId);
  }
}
