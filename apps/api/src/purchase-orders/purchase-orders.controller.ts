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
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { AddPurchaseOrderLineDto } from "./dto/add-purchase-order-line.dto";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import { UpdatePurchaseOrderDto } from "./dto/update-purchase-order.dto";
import { PurchaseOrdersService } from "./purchase-orders.service";

@ApiTags("Purchase Orders")
@Controller("workspaces/:workspaceId/purchase-orders")
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @ApiOperation({ summary: "Create a draft purchase order" })
  @ApiBody({ type: CreatePurchaseOrderDto })
  @ApiCreatedResponse({ description: "Purchase order created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreatePurchaseOrderDto,
  ) {
    return this.purchaseOrdersService.create(workspaceId, data);
  }

  @ApiOkResponse({ description: "Workspace purchase orders" })
  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.purchaseOrdersService.list(workspaceId);
  }

  @ApiNotFoundResponse({ description: "Purchase order not found" })
  @Get(":purchaseOrderId")
  get(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseOrderId", new ParseUUIDPipe({ version: "4" }))
    purchaseOrderId: string,
  ) {
    return this.purchaseOrdersService.get(workspaceId, purchaseOrderId);
  }

  @ApiBody({ type: UpdatePurchaseOrderDto })
  @ApiBadRequestResponse({ description: "Purchase order is not a draft" })
  @Patch(":purchaseOrderId")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseOrderId", new ParseUUIDPipe({ version: "4" }))
    purchaseOrderId: string,
    @Body() data: UpdatePurchaseOrderDto,
  ) {
    return this.purchaseOrdersService.update(
      workspaceId,
      purchaseOrderId,
      data,
    );
  }

  @ApiBody({ type: AddPurchaseOrderLineDto })
  @Post(":purchaseOrderId/lines")
  addLine(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseOrderId", new ParseUUIDPipe({ version: "4" }))
    purchaseOrderId: string,
    @Body() data: AddPurchaseOrderLineDto,
  ) {
    return this.purchaseOrdersService.addLine(
      workspaceId,
      purchaseOrderId,
      data,
    );
  }

  @ApiBody({ type: AddPurchaseOrderLineDto })
  @Patch(":purchaseOrderId/lines/:lineId")
  updateLine(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseOrderId", new ParseUUIDPipe({ version: "4" }))
    purchaseOrderId: string,
    @Param("lineId", new ParseUUIDPipe({ version: "4" })) lineId: string,
    @Body() data: AddPurchaseOrderLineDto,
  ) {
    return this.purchaseOrdersService.updateLine(
      workspaceId,
      purchaseOrderId,
      lineId,
      data,
    );
  }

  @ApiNoContentResponse({ description: "Purchase order line removed" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":purchaseOrderId/lines/:lineId")
  removeLine(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseOrderId", new ParseUUIDPipe({ version: "4" }))
    purchaseOrderId: string,
    @Param("lineId", new ParseUUIDPipe({ version: "4" })) lineId: string,
  ): Promise<void> {
    return this.purchaseOrdersService.removeLine(
      workspaceId,
      purchaseOrderId,
      lineId,
    );
  }

  @ApiOkResponse({ description: "Purchase order sent" })
  @Post(":purchaseOrderId/send")
  send(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseOrderId", new ParseUUIDPipe({ version: "4" }))
    purchaseOrderId: string,
  ) {
    return this.purchaseOrdersService.send(workspaceId, purchaseOrderId);
  }

  @ApiOkResponse({ description: "Purchase order confirmed" })
  @Post(":purchaseOrderId/confirm")
  confirm(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseOrderId", new ParseUUIDPipe({ version: "4" }))
    purchaseOrderId: string,
  ) {
    return this.purchaseOrdersService.confirm(workspaceId, purchaseOrderId);
  }

  @Post(":purchaseOrderId/cancel")
  cancel(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseOrderId", new ParseUUIDPipe({ version: "4" }))
    purchaseOrderId: string,
  ) {
    return this.purchaseOrdersService.cancel(workspaceId, purchaseOrderId);
  }
}
