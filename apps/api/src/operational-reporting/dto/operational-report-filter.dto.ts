import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";

export class OperationalReportFilterDto {
  @ApiPropertyOptional({
    format: "date-time",
    description: "Created at or after",
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    format: "date-time",
    description: "Created at or before",
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
