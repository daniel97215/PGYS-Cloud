import { Controller, Get, Param, ParseUUIDPipe, Query } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CrmReportingService } from "./crm-reporting.service";
import { CrmReportFilterDto } from "./dto/crm-report-filter.dto";
import { CrmSummaryReportResponseDto } from "./dto/crm-summary-report-response.dto";

@ApiTags("CRM Reporting")
@Controller("workspaces/:workspaceId/reports/crm")
export class CrmReportingSummaryController {
  constructor(private readonly service: CrmReportingService) {}

  @ApiOperation({ summary: "Get the consolidated CRM snapshot" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ type: CrmSummaryReportResponseDto })
  @ApiNotFoundResponse({ description: "CRM pipeline not found" })
  @Get("summary")
  summary(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Query() filter: CrmReportFilterDto,
  ): Promise<CrmSummaryReportResponseDto> {
    return this.service.summary(workspaceId, filter);
  }
}
