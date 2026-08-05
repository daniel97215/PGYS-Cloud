import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
import { AddSalesDeliveryLineDto } from "./dto/add-sales-delivery-line.dto";
import { CreateSalesDeliveryDto } from "./dto/create-sales-delivery.dto";
import { SalesDeliveriesService } from "./sales-deliveries.service";

@ApiTags("Sales Deliveries")
@Controller("workspaces/:workspaceId/sales-deliveries")
export class SalesDeliveriesController {
  constructor(
    private readonly salesDeliveriesService: SalesDeliveriesService,
  ) {}

  @ApiOperation({ summary: "Create a sales delivery" })
  @ApiBody({ type: CreateSalesDeliveryDto })
  @ApiCreatedResponse({ description: "Sales delivery created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateSalesDeliveryDto,
  ) {
    return this.salesDeliveriesService.create(workspaceId, data);
  }

  @ApiOkResponse({ description: "Workspace sales deliveries" })
  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.salesDeliveriesService.list(workspaceId);
  }

  @ApiNotFoundResponse({ description: "Sales delivery not found" })
  @Get(":salesDeliveryId")
  get(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesDeliveryId", new ParseUUIDPipe({ version: "4" }))
    salesDeliveryId: string,
  ) {
    return this.salesDeliveriesService.get(workspaceId, salesDeliveryId);
  }

  @ApiBody({ type: AddSalesDeliveryLineDto })
  @ApiCreatedResponse({ description: "Sales delivery line added" })
  @Post(":salesDeliveryId/lines")
  addLine(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesDeliveryId", new ParseUUIDPipe({ version: "4" }))
    salesDeliveryId: string,
    @Body() data: AddSalesDeliveryLineDto,
  ) {
    return this.salesDeliveriesService.addLine(
      workspaceId,
      salesDeliveryId,
      data,
    );
  }

  @ApiNoContentResponse({ description: "Sales delivery line removed" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":salesDeliveryId/lines/:lineId")
  removeLine(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesDeliveryId", new ParseUUIDPipe({ version: "4" }))
    salesDeliveryId: string,
    @Param("lineId", new ParseUUIDPipe({ version: "4" })) lineId: string,
  ): Promise<void> {
    return this.salesDeliveriesService.removeLine(
      workspaceId,
      salesDeliveryId,
      lineId,
    );
  }

  @ApiBadRequestResponse({ description: "Delivery has no lines" })
  @Post(":salesDeliveryId/ready")
  ready(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesDeliveryId", new ParseUUIDPipe({ version: "4" }))
    salesDeliveryId: string,
  ) {
    return this.salesDeliveriesService.ready(workspaceId, salesDeliveryId);
  }

  @ApiBadRequestResponse({ description: "Insufficient available stock" })
  @Post(":salesDeliveryId/ship")
  ship(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesDeliveryId", new ParseUUIDPipe({ version: "4" }))
    salesDeliveryId: string,
  ) {
    return this.salesDeliveriesService.ship(workspaceId, salesDeliveryId);
  }

  @Post(":salesDeliveryId/deliver")
  deliver(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesDeliveryId", new ParseUUIDPipe({ version: "4" }))
    salesDeliveryId: string,
  ) {
    return this.salesDeliveriesService.deliver(workspaceId, salesDeliveryId);
  }

  @Post(":salesDeliveryId/cancel")
  cancel(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesDeliveryId", new ParseUUIDPipe({ version: "4" }))
    salesDeliveryId: string,
  ) {
    return this.salesDeliveriesService.cancel(workspaceId, salesDeliveryId);
  }
}
