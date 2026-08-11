import { Controller, Get, Param, ParseUUIDPipe, Query } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CrmReportingService } from "./crm-reporting.service";
import { CrmActivityReportResponseDto } from "./dto/crm-activity-report-response.dto";
import { CrmOpportunityReportResponseDto } from "./dto/crm-opportunity-report-response.dto";
import { CrmReportFilterDto } from "./dto/crm-report-filter.dto";

@ApiTags("CRM Reporting")
@Controller("workspaces/:workspaceId/crm/reports")
export class CrmReportingController {
  constructor(private readonly service: CrmReportingService) {}

  @ApiOperation({ summary: "Get the CRM opportunity snapshot" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ type: CrmOpportunityReportResponseDto })
  @ApiNotFoundResponse({ description: "CRM pipeline not found" })
  @Get("opportunities")
  opportunities(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Query() filter: CrmReportFilterDto,
  ): Promise<CrmOpportunityReportResponseDto> {
    return this.service.opportunities(workspaceId, filter);
  }

  @ApiOperation({ summary: "Get the CRM activity snapshot" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ type: CrmActivityReportResponseDto })
  @ApiNotFoundResponse({ description: "CRM pipeline not found" })
  @Get("activities")
  activities(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Query() filter: CrmReportFilterDto,
  ): Promise<CrmActivityReportResponseDto> {
    return this.service.activities(workspaceId, filter);
  }
}
