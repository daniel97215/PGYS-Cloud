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
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { AddSalesOrderLineDto } from "./dto/add-sales-order-line.dto";
import {
  ConvertSalesQuoteDto,
  CreateSalesOrderDto,
} from "./dto/create-sales-order.dto";
import { UpdateSalesOrderDto } from "./dto/update-sales-order.dto";
import { SalesOrdersService } from "./sales-orders.service";

@ApiTags("Sales Orders")
@Controller("workspaces/:workspaceId/sales-orders")
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @ApiOperation({ summary: "Create a sales order" })
  @ApiBody({ type: CreateSalesOrderDto })
  @ApiCreatedResponse({ description: "Sales order created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateSalesOrderDto,
  ) {
    return this.salesOrdersService.create(workspaceId, data);
  }

  @ApiOperation({ summary: "Convert an accepted quote into a draft order" })
  @ApiParam({ name: "salesQuoteId", format: "uuid" })
  @ApiBody({ type: ConvertSalesQuoteDto })
  @ApiCreatedResponse({ description: "Sales order created from quote" })
  @ApiBadRequestResponse({ description: "Sales quote is not accepted" })
  @Post("from-quote/:salesQuoteId")
  createFromQuote(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesQuoteId", new ParseUUIDPipe({ version: "4" }))
    salesQuoteId: string,
    @Body() data: ConvertSalesQuoteDto,
  ) {
    return this.salesOrdersService.createFromQuote(
      workspaceId,
      salesQuoteId,
      data,
    );
  }

  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.salesOrdersService.list(workspaceId);
  }

  @ApiNotFoundResponse({ description: "Sales order not found" })
  @Get(":salesOrderId")
  get(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesOrderId", new ParseUUIDPipe({ version: "4" }))
    salesOrderId: string,
  ) {
    return this.salesOrdersService.get(workspaceId, salesOrderId);
  }

  @ApiBody({ type: UpdateSalesOrderDto })
  @Patch(":salesOrderId")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesOrderId", new ParseUUIDPipe({ version: "4" }))
    salesOrderId: string,
    @Body() data: UpdateSalesOrderDto,
  ) {
    return this.salesOrdersService.update(workspaceId, salesOrderId, data);
  }

  @ApiBody({ type: AddSalesOrderLineDto })
  @Post(":salesOrderId/lines")
  addLine(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesOrderId", new ParseUUIDPipe({ version: "4" }))
    salesOrderId: string,
    @Body() data: AddSalesOrderLineDto,
  ) {
    return this.salesOrdersService.addLine(workspaceId, salesOrderId, data);
  }

  @ApiBody({ type: AddSalesOrderLineDto })
  @Patch(":salesOrderId/lines/:lineId")
  updateLine(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesOrderId", new ParseUUIDPipe({ version: "4" }))
    salesOrderId: string,
    @Param("lineId", new ParseUUIDPipe({ version: "4" })) lineId: string,
    @Body() data: AddSalesOrderLineDto,
  ) {
    return this.salesOrdersService.updateLine(
      workspaceId,
      salesOrderId,
      lineId,
      data,
    );
  }

  @ApiNoContentResponse({ description: "Sales order line removed" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":salesOrderId/lines/:lineId")
  removeLine(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesOrderId", new ParseUUIDPipe({ version: "4" }))
    salesOrderId: string,
    @Param("lineId", new ParseUUIDPipe({ version: "4" })) lineId: string,
  ): Promise<void> {
    return this.salesOrdersService.removeLine(
      workspaceId,
      salesOrderId,
      lineId,
    );
  }

  @ApiOkResponse({ description: "Sales order confirmed" })
  @Post(":salesOrderId/confirm")
  confirm(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesOrderId", new ParseUUIDPipe({ version: "4" }))
    salesOrderId: string,
  ) {
    return this.salesOrdersService.confirm(workspaceId, salesOrderId);
  }

  @Post(":salesOrderId/start")
  start(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesOrderId", new ParseUUIDPipe({ version: "4" }))
    salesOrderId: string,
  ) {
    return this.salesOrdersService.start(workspaceId, salesOrderId);
  }

  @Post(":salesOrderId/complete")
  complete(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesOrderId", new ParseUUIDPipe({ version: "4" }))
    salesOrderId: string,
  ) {
    return this.salesOrdersService.complete(workspaceId, salesOrderId);
  }

  @Post(":salesOrderId/cancel")
  cancel(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesOrderId", new ParseUUIDPipe({ version: "4" }))
    salesOrderId: string,
  ) {
    return this.salesOrdersService.cancel(workspaceId, salesOrderId);
  }
}
