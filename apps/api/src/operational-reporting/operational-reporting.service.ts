import { BadRequestException, Injectable } from "@nestjs/common";
import {
  PROVISIONING_JOB_STATUSES,
  PROVISIONING_OPERATIONS,
  ProvisioningJobStatus,
  ProvisioningOperation,
} from "../provisioning/provisioning.constants";
import { OperationalReportFilterDto } from "./dto/operational-report-filter.dto";
import { OperationalReportResponseDto } from "./dto/operational-report-response.dto";
import {
  OperationalReportQuery,
  OperationalReportingRepository,
} from "./operational-reporting.repository";

const provisioningOperations = new Set<string>(
  Object.values(PROVISIONING_OPERATIONS),
);
const provisioningStatuses = new Set<string>(
  Object.values(PROVISIONING_JOB_STATUSES),
);

@Injectable()
export class OperationalReportingService {
  constructor(private readonly repository: OperationalReportingRepository) {}

  async snapshot(
    workspaceId: string,
    filter: OperationalReportFilterDto,
  ): Promise<OperationalReportResponseDto> {
    const query = this.toQuery(filter);
    const [services, provisioningJobs] = await Promise.all([
      this.repository.serviceGroups(workspaceId, query),
      this.repository.provisioningJobGroups(workspaceId, query),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      services: services.map((group) => ({
        type: group.type,
        status: group.status,
        count: group._count._all,
      })),
      provisioningJobs: provisioningJobs.map((group) => ({
        operation: this.provisioningOperation(group.operation),
        status: this.provisioningStatus(group.status),
        count: group._count._all,
      })),
    };
  }

  private toQuery(filter: OperationalReportFilterDto): OperationalReportQuery {
    const from = filter.from === undefined ? undefined : new Date(filter.from);
    const to = filter.to === undefined ? undefined : new Date(filter.to);

    if (from !== undefined && to !== undefined && from > to) {
      throw new BadRequestException(
        "Report start date cannot be after end date",
      );
    }

    return {
      ...(from === undefined ? {} : { from }),
      ...(to === undefined ? {} : { to }),
    };
  }

  private provisioningOperation(value: string): ProvisioningOperation {
    if (!provisioningOperations.has(value)) {
      throw new BadRequestException(
        `Unsupported provisioning operation "${value}"`,
      );
    }
    return value as ProvisioningOperation;
  }

  private provisioningStatus(value: string): ProvisioningJobStatus {
    if (!provisioningStatuses.has(value)) {
      throw new BadRequestException(
        `Unsupported provisioning status "${value}"`,
      );
    }
    return value as ProvisioningJobStatus;
  }
}
