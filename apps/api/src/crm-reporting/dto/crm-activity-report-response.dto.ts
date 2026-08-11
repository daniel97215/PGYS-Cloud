import { ApiProperty } from "@nestjs/swagger";
import { CrmActivityStatus, CrmActivityType } from "@prisma/client";

export class CrmActivityCountGroupDto {
  @ApiProperty({ enum: CrmActivityType })
  type!: CrmActivityType;

  @ApiProperty({ enum: CrmActivityStatus })
  status!: CrmActivityStatus;

  @ApiProperty({ example: 8 })
  count!: number;
}

export class CrmActivityReportResponseDto {
  @ApiProperty({ type: [CrmActivityCountGroupDto] })
  groups!: CrmActivityCountGroupDto[];

  @ApiProperty({ example: 3 })
  overduePlanned!: number;
}
