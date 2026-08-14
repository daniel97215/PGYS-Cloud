import { BadRequestException, Injectable } from "@nestjs/common";
import {
  ErpReportFilterDto,
  ErpStockMovementReportFilterDto,
} from "./dto/erp-report-filter.dto";
import {
  ErpPurchaseInvoiceReportResponseDto,
  ErpPurchaseOrderReportResponseDto,
  ErpSalesInvoiceReportResponseDto,
  ErpSalesOrderReportResponseDto,
  ErpStockMovementReportResponseDto,
} from "./dto/erp-report-response.dto";
import {
  ErpReportQuery,
  ErpReportingRepository,
} from "./erp-reporting.repository";

@Injectable()
export class ErpReportingService {
  constructor(private readonly repository: ErpReportingRepository) {}

  async salesOrders(
    workspaceId: string,
    filter: ErpReportFilterDto,
  ): Promise<ErpSalesOrderReportResponseDto> {
    const groups = await this.repository.salesOrderGroups(
      workspaceId,
      this.toQuery(filter),
    );
    return this.documentResponse(groups);
  }

  async salesInvoices(
    workspaceId: string,
    filter: ErpReportFilterDto,
  ): Promise<ErpSalesInvoiceReportResponseDto> {
    const groups = await this.repository.salesInvoiceGroups(
      workspaceId,
      this.toQuery(filter),
    );
    return {
      generatedAt: new Date().toISOString(),
      groups: groups.map((group) => ({
        ...this.documentGroup(group),
        paidAmount: group._sum.paidAmount?.toFixed(4) ?? "0.0000",
      })),
    };
  }

  async purchaseOrders(
    workspaceId: string,
    filter: ErpReportFilterDto,
  ): Promise<ErpPurchaseOrderReportResponseDto> {
    const groups = await this.repository.purchaseOrderGroups(
      workspaceId,
      this.toQuery(filter),
    );
    return this.documentResponse(groups);
  }

  async purchaseInvoices(
    workspaceId: string,
    filter: ErpReportFilterDto,
  ): Promise<ErpPurchaseInvoiceReportResponseDto> {
    const groups = await this.repository.purchaseInvoiceGroups(
      workspaceId,
      this.toQuery(filter),
    );
    return {
      generatedAt: new Date().toISOString(),
      groups: groups.map((group) => ({
        ...this.documentGroup(group),
        paidAmount: group._sum.paidAmount?.toFixed(4) ?? "0.0000",
      })),
    };
  }

  async stockMovements(
    workspaceId: string,
    filter: ErpStockMovementReportFilterDto,
  ): Promise<ErpStockMovementReportResponseDto> {
    const groups = await this.repository.stockMovementGroups(
      workspaceId,
      this.toQuery(filter),
    );
    return {
      generatedAt: new Date().toISOString(),
      groups: groups.map((group) => ({
        direction: group.direction,
        count: group._count._all,
        quantity: group._sum.quantity?.toFixed(4) ?? "0.0000",
      })),
    };
  }

  private documentResponse<
    TStatus extends string,
    T extends {
      status: TStatus;
      currencyCode: string;
      _count: { _all: number };
      _sum: {
        subtotalAmount: { toFixed(digits: number): string } | null;
        taxAmount: { toFixed(digits: number): string } | null;
        totalAmount: { toFixed(digits: number): string } | null;
      };
    },
  >(groups: T[]) {
    return {
      generatedAt: new Date().toISOString(),
      groups: groups.map((group) => this.documentGroup(group)),
    };
  }

  private documentGroup<TStatus extends string>(group: {
    status: TStatus;
    currencyCode: string;
    _count: { _all: number };
    _sum: {
      subtotalAmount: { toFixed(digits: number): string } | null;
      taxAmount: { toFixed(digits: number): string } | null;
      totalAmount: { toFixed(digits: number): string } | null;
    };
  }) {
    return {
      status: group.status,
      currency: group.currencyCode,
      count: group._count._all,
      subtotalAmount: group._sum.subtotalAmount?.toFixed(4) ?? "0.0000",
      taxAmount: group._sum.taxAmount?.toFixed(4) ?? "0.0000",
      totalAmount: group._sum.totalAmount?.toFixed(4) ?? "0.0000",
    };
  }

  private toQuery(
    filter: ErpReportFilterDto | ErpStockMovementReportFilterDto,
  ): ErpReportQuery {
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
      ...("warehouseId" in filter && filter.warehouseId !== undefined
        ? { warehouseId: filter.warehouseId }
        : {}),
    };
  }
}
