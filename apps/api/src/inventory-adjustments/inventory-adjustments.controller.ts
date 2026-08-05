import { Body, Controller, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CreateInventoryAdjustmentDto } from "./dto/create-inventory-adjustment.dto";
import { InventoryAdjustmentsService } from "./inventory-adjustments.service";

@ApiTags("Inventory Adjustments")
@Controller("inventory-adjustments")
export class InventoryAdjustmentsController {
  constructor(
    private readonly inventoryAdjustmentsService: InventoryAdjustmentsService,
  ) {}

  @ApiOperation({ summary: "Adjust an inventory item to a counted quantity" })
  @ApiBody({ type: CreateInventoryAdjustmentDto })
  @ApiCreatedResponse({ description: "Inventory adjustment created" })
  @ApiNotFoundResponse({ description: "Inventory item not found" })
  @ApiBadRequestResponse({
    description: "Invalid count, inactive item, or unchanged quantity",
  })
  @Post()
  create(@Body() data: CreateInventoryAdjustmentDto) {
    return this.inventoryAdjustmentsService.create(data);
  }
}
