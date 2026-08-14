import { BadRequestException, Injectable } from "@nestjs/common";
import {
  SUBSCRIPTION_STATUSES,
  SubscriptionStatus,
} from "../subscriptions/subscriptions.constants";
import { CommercialReportFilterDto } from "./dto/commercial-report-filter.dto";
import {
  CommercialInvoiceReportResponseDto,
  CommercialSubscriptionReportResponseDto,
} from "./dto/commercial-report-response.dto";
import {
  CommercialReportQuery,
  CommercialReportingRepository,
} from "./commercial-reporting.repository";

const subscriptionStatuses = new Set<string>(
  Object.values(SUBSCRIPTION_STATUSES),
);

@Injectable()
export class CommercialReportingService {
  constructor(private readonly repository: CommercialReportingRepository) {}

  async subscriptions(
    workspaceId: string,
    filter: CommercialReportFilterDto,
  ): Promise<CommercialSubscriptionReportResponseDto> {
    const query = this.toQuery(filter);
    const groups = await this.repository.subscriptionGroups(workspaceId, query);

    return {
      generatedAt: new Date().toISOString(),
      groups: groups.map((group) => ({
        offerId: group.offerId,
        status: this.subscriptionStatus(group.status),
        count: group._count._all,
      })),
    };
  }

  async invoices(
    workspaceId: string,
    filter: CommercialReportFilterDto,
  ): Promise<CommercialInvoiceReportResponseDto> {
    const query = this.toQuery(filter);
    const groups = await this.repository.invoiceGroups(workspaceId, query);

    return {
      generatedAt: new Date().toISOString(),
      groups: groups.map((group) => ({
        status: group.status,
        currency: group.currency,
        count: group._count._all,
        subtotalAmount: group._sum.subtotalAmount?.toFixed(2) ?? "0.00",
        discountAmount: group._sum.discountAmount?.toFixed(2) ?? "0.00",
        taxAmount: group._sum.taxAmount?.toFixed(2) ?? "0.00",
        totalAmount: group._sum.totalAmount?.toFixed(2) ?? "0.00",
      })),
    };
  }

  private toQuery(filter: CommercialReportFilterDto): CommercialReportQuery {
    const from = filter.from === undefined ? undefined : new Date(filter.from);
    const to = filter.to === undefined ? undefined : new Date(filter.to);

    if (from !== undefined && to !== undefined && from > to) {
      throw new BadRequestException(
        "Report start date cannot be after end date",
      );
    }

    return {
      ...(filter.offerId === undefined ? {} : { offerId: filter.offerId }),
      ...(from === undefined ? {} : { from }),
      ...(to === undefined ? {} : { to }),
    };
  }

  private subscriptionStatus(value: string): SubscriptionStatus {
    if (!subscriptionStatuses.has(value)) {
      throw new BadRequestException(`Unsupported subscription status "${value}"`);
    }
    return value as SubscriptionStatus;
  }
}
