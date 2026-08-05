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
import {
  ConvertSalesOrderToInvoiceDto,
  CreateSalesInvoiceDto,
} from "./dto/create-sales-invoice.dto";
import { UpdateSalesInvoiceDto } from "./dto/update-sales-invoice.dto";
import { SalesInvoicesService } from "./sales-invoices.service";

@ApiTags("Sales Invoices")
@Controller("workspaces/:workspaceId/sales-invoices")
export class SalesInvoicesController {
  constructor(private readonly salesInvoicesService: SalesInvoicesService) {}

  @ApiOperation({ summary: "Create a draft sales invoice" })
  @ApiBody({ type: CreateSalesInvoiceDto })
  @ApiCreatedResponse({ description: "Sales invoice created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateSalesInvoiceDto,
  ) {
    return this.salesInvoicesService.create(workspaceId, data);
  }

  @ApiOperation({ summary: "Convert a sales order into a draft invoice" })
  @ApiParam({ name: "salesOrderId", format: "uuid" })
  @ApiBody({ type: ConvertSalesOrderToInvoiceDto })
  @ApiCreatedResponse({ description: "Sales invoice created from order" })
  @Post("from-order/:salesOrderId")
  createFromOrder(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesOrderId", new ParseUUIDPipe({ version: "4" }))
    salesOrderId: string,
    @Body() data: ConvertSalesOrderToInvoiceDto,
  ) {
    return this.salesInvoicesService.createFromOrder(
      workspaceId,
      salesOrderId,
      data,
    );
  }

  @ApiOkResponse({ description: "Workspace sales invoices" })
  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.salesInvoicesService.list(workspaceId);
  }

  @ApiNotFoundResponse({ description: "Sales invoice not found" })
  @Get(":salesInvoiceId")
  get(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesInvoiceId", new ParseUUIDPipe({ version: "4" }))
    salesInvoiceId: string,
  ) {
    return this.salesInvoicesService.get(workspaceId, salesInvoiceId);
  }

  @ApiBody({ type: UpdateSalesInvoiceDto })
  @ApiBadRequestResponse({ description: "Sales invoice is not a draft" })
  @Patch(":salesInvoiceId")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesInvoiceId", new ParseUUIDPipe({ version: "4" }))
    salesInvoiceId: string,
    @Body() data: UpdateSalesInvoiceDto,
  ) {
    return this.salesInvoicesService.update(workspaceId, salesInvoiceId, data);
  }

  @ApiBadRequestResponse({ description: "Invoice has no lines" })
  @Post(":salesInvoiceId/issue")
  issue(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesInvoiceId", new ParseUUIDPipe({ version: "4" }))
    salesInvoiceId: string,
  ) {
    return this.salesInvoicesService.issue(workspaceId, salesInvoiceId);
  }

  @Post(":salesInvoiceId/cancel")
  cancel(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesInvoiceId", new ParseUUIDPipe({ version: "4" }))
    salesInvoiceId: string,
  ) {
    return this.salesInvoicesService.cancel(workspaceId, salesInvoiceId);
  }
}
