import { ApiProperty } from "@nestjs/swagger";
import { CrmOpportunityStatus } from "@prisma/client";

export class CrmOpportunityCountGroupDto {
  @ApiProperty({ format: "uuid" })
  pipelineId!: string;

  @ApiProperty({ format: "uuid" })
  stageId!: string;

  @ApiProperty({ enum: CrmOpportunityStatus })
  status!: CrmOpportunityStatus;

  @ApiProperty({ example: 4 })
  count!: number;
}

export class CrmOpportunityAmountGroupDto extends CrmOpportunityCountGroupDto {
  @ApiProperty({ example: "EUR" })
  currency!: string;

  @ApiProperty({ example: "12500.00", description: "Decimal amount serialized as a string" })
  amount!: string;
}

export class CrmOpportunityReportResponseDto {
  @ApiProperty({ type: [CrmOpportunityCountGroupDto] })
  groups!: CrmOpportunityCountGroupDto[];

  @ApiProperty({ type: [CrmOpportunityAmountGroupDto] })
  amountsByCurrency!: CrmOpportunityAmountGroupDto[];
}
