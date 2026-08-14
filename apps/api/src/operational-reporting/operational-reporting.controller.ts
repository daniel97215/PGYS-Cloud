import { Controller, Get, Param, ParseUUIDPipe, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { OperationalReportFilterDto } from "./dto/operational-report-filter.dto";
import { OperationalReportResponseDto } from "./dto/operational-report-response.dto";
import { OperationalReportingService } from "./operational-reporting.service";

@ApiTags("Operational Reporting")
@Controller("workspaces/:workspaceId/reports/operations")
export class OperationalReportingController {
  constructor(private readonly service: OperationalReportingService) {}

  @ApiOperation({ summary: "Get the workspace operational snapshot" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ type: OperationalReportResponseDto })
  @Get()
  snapshot(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Query() filter: OperationalReportFilterDto,
  ): Promise<OperationalReportResponseDto> {
    return this.service.snapshot(workspaceId, filter);
  }
}
