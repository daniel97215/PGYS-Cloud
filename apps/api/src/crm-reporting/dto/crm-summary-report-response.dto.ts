import { ApiProperty } from "@nestjs/swagger";
import { CrmActivityReportResponseDto } from "./crm-activity-report-response.dto";
import { CrmOpportunityReportResponseDto } from "./crm-opportunity-report-response.dto";

export class CrmSummaryReportResponseDto {
  @ApiProperty({ format: "date-time" })
  generatedAt!: string;

  @ApiProperty({ type: CrmOpportunityReportResponseDto })
  opportunities!: CrmOpportunityReportResponseDto;

  @ApiProperty({ type: CrmActivityReportResponseDto })
  activities!: CrmActivityReportResponseDto;
}
