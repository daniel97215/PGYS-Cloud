import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsUUID } from "class-validator";

export class CrmReportFilterDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  pipelineId?: string;

  @ApiPropertyOptional({ format: "date-time", description: "Created at or after" })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ format: "date-time", description: "Created at or before" })
  @IsOptional()
  @IsDateString()
  to?: string;
}
