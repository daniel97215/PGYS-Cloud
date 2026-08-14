import { Controller, Get, Param, ParseUUIDPipe, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { CommercialReportingService } from "./commercial-reporting.service";
import { CommercialReportFilterDto } from "./dto/commercial-report-filter.dto";
import {
  CommercialInvoiceReportResponseDto,
  CommercialSubscriptionReportResponseDto,
} from "./dto/commercial-report-response.dto";

@ApiTags("Commercial Reporting")
@Controller("workspaces/:workspaceId/reports/commercial")
export class CommercialReportingController {
  constructor(private readonly service: CommercialReportingService) {}

  @ApiOperation({ summary: "Get the commercial subscription snapshot" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ type: CommercialSubscriptionReportResponseDto })
  @Get("subscriptions")
  subscriptions(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Query() filter: CommercialReportFilterDto,
  ): Promise<CommercialSubscriptionReportResponseDto> {
    return this.service.subscriptions(workspaceId, filter);
  }

  @ApiOperation({ summary: "Get the Billing invoice snapshot" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ type: CommercialInvoiceReportResponseDto })
  @Get("invoices")
  invoices(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Query() filter: CommercialReportFilterDto,
  ): Promise<CommercialInvoiceReportResponseDto> {
    return this.service.invoices(workspaceId, filter);
  }
}
