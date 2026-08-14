import { ApiProperty } from "@nestjs/swagger";
import { ServiceStatus, ServiceType } from "@prisma/client";
import {
  PROVISIONING_JOB_STATUSES,
  PROVISIONING_OPERATIONS,
  ProvisioningJobStatus,
  ProvisioningOperation,
} from "../../provisioning/provisioning.constants";

export class OperationalServiceGroupDto {
  @ApiProperty({ enum: ServiceType })
  type!: ServiceType;

  @ApiProperty({ enum: ServiceStatus })
  status!: ServiceStatus;

  @ApiProperty({ example: 3 })
  count!: number;
}

export class OperationalProvisioningJobGroupDto {
  @ApiProperty({ enum: Object.values(PROVISIONING_OPERATIONS) })
  operation!: ProvisioningOperation;

  @ApiProperty({ enum: Object.values(PROVISIONING_JOB_STATUSES) })
  status!: ProvisioningJobStatus;

  @ApiProperty({ example: 2 })
  count!: number;
}

export class OperationalReportResponseDto {
  @ApiProperty({ format: "date-time" })
  generatedAt!: string;

  @ApiProperty({ type: [OperationalServiceGroupDto] })
  services!: OperationalServiceGroupDto[];

  @ApiProperty({ type: [OperationalProvisioningJobGroupDto] })
  provisioningJobs!: OperationalProvisioningJobGroupDto[];
}
