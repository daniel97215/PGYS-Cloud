import { Controller, Get, Param, ParseUUIDPipe, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import {
  ErpReportFilterDto,
  ErpStockMovementReportFilterDto,
} from "./dto/erp-report-filter.dto";
import {
  ErpPurchaseInvoiceReportResponseDto,
  ErpPurchaseOrderReportResponseDto,
  ErpSalesInvoiceReportResponseDto,
  ErpSalesOrderReportResponseDto,
  ErpStockMovementReportResponseDto,
} from "./dto/erp-report-response.dto";
import { ErpReportingService } from "./erp-reporting.service";

@ApiTags("ERP Reporting")
@Controller("workspaces/:workspaceId/reports/erp")
export class ErpReportingController {
  constructor(private readonly service: ErpReportingService) {}

  @ApiOperation({ summary: "Get the Sales order snapshot" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ type: ErpSalesOrderReportResponseDto })
  @Get("sales-orders")
  salesOrders(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Query() filter: ErpReportFilterDto,
  ): Promise<ErpSalesOrderReportResponseDto> {
    return this.service.salesOrders(workspaceId, filter);
  }

  @ApiOperation({ summary: "Get the Sales invoice snapshot" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ type: ErpSalesInvoiceReportResponseDto })
  @Get("sales-invoices")
  salesInvoices(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Query() filter: ErpReportFilterDto,
  ): Promise<ErpSalesInvoiceReportResponseDto> {
    return this.service.salesInvoices(workspaceId, filter);
  }

  @ApiOperation({ summary: "Get the Purchase order snapshot" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ type: ErpPurchaseOrderReportResponseDto })
  @Get("purchase-orders")
  purchaseOrders(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Query() filter: ErpReportFilterDto,
  ): Promise<ErpPurchaseOrderReportResponseDto> {
    return this.service.purchaseOrders(workspaceId, filter);
  }

  @ApiOperation({ summary: "Get the Purchase invoice snapshot" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ type: ErpPurchaseInvoiceReportResponseDto })
  @Get("purchase-invoices")
  purchaseInvoices(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Query() filter: ErpReportFilterDto,
  ): Promise<ErpPurchaseInvoiceReportResponseDto> {
    return this.service.purchaseInvoices(workspaceId, filter);
  }

  @ApiOperation({ summary: "Get the stock movement snapshot" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ type: ErpStockMovementReportResponseDto })
  @Get("stock-movements")
  stockMovements(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Query() filter: ErpStockMovementReportFilterDto,
  ): Promise<ErpStockMovementReportResponseDto> {
    return this.service.stockMovements(workspaceId, filter);
  }
}
