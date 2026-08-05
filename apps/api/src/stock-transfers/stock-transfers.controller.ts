import { Body, Controller, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CreateStockTransferDto } from "./dto/create-stock-transfer.dto";
import { StockTransfersService } from "./stock-transfers.service";

@ApiTags("Stock Transfers")
@Controller("stock-transfers")
export class StockTransfersController {
  constructor(private readonly stockTransfersService: StockTransfersService) {}

  @ApiOperation({ summary: "Transfer stock between inventory items" })
  @ApiBody({ type: CreateStockTransferDto })
  @ApiCreatedResponse({ description: "Stock transfer created" })
  @ApiNotFoundResponse({ description: "Inventory item not found" })
  @ApiBadRequestResponse({
    description: "Invalid transfer or insufficient source stock",
  })
  @Post()
  create(@Body() data: CreateStockTransferDto) {
    return this.stockTransfersService.create(data);
  }
}
