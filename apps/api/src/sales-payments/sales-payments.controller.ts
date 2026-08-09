import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { AddSalesPaymentAllocationDto } from "./dto/add-sales-payment-allocation.dto";
import { CreateSalesPaymentDto } from "./dto/create-sales-payment.dto";
import { SalesPaymentsService } from "./sales-payments.service";

@ApiTags("Sales Payments")
@Controller("workspaces/:workspaceId/sales-payments")
export class SalesPaymentsController {
  constructor(private readonly salesPaymentsService: SalesPaymentsService) {}

  @ApiOperation({ summary: "Create a draft sales payment" })
  @ApiBody({ type: CreateSalesPaymentDto })
  @ApiCreatedResponse({ description: "Sales payment created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateSalesPaymentDto,
  ) {
    return this.salesPaymentsService.create(workspaceId, data);
  }

  @ApiOkResponse({ description: "Workspace sales payments" })
  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.salesPaymentsService.list(workspaceId);
  }

  @ApiOperation({ summary: "List payments allocated to an invoice" })
  @ApiOkResponse({ description: "Invoice sales payments" })
  @Get("by-invoice/:salesInvoiceId")
  listByInvoice(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesInvoiceId", new ParseUUIDPipe({ version: "4" }))
    salesInvoiceId: string,
  ) {
    return this.salesPaymentsService.listByInvoice(
      workspaceId,
      salesInvoiceId,
    );
  }

  @ApiNotFoundResponse({ description: "Sales payment not found" })
  @Get(":salesPaymentId")
  get(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesPaymentId", new ParseUUIDPipe({ version: "4" }))
    salesPaymentId: string,
  ) {
    return this.salesPaymentsService.get(workspaceId, salesPaymentId);
  }

  @ApiBody({ type: AddSalesPaymentAllocationDto })
  @ApiBadRequestResponse({ description: "Allocation is not allowed" })
  @Post(":salesPaymentId/allocations")
  addAllocation(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesPaymentId", new ParseUUIDPipe({ version: "4" }))
    salesPaymentId: string,
    @Body() data: AddSalesPaymentAllocationDto,
  ) {
    return this.salesPaymentsService.addAllocation(
      workspaceId,
      salesPaymentId,
      data,
    );
  }

  @ApiNoContentResponse({ description: "Allocation removed" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":salesPaymentId/allocations/:allocationId")
  async removeAllocation(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesPaymentId", new ParseUUIDPipe({ version: "4" }))
    salesPaymentId: string,
    @Param("allocationId", new ParseUUIDPipe({ version: "4" }))
    allocationId: string,
  ): Promise<void> {
    await this.salesPaymentsService.removeAllocation(
      workspaceId,
      salesPaymentId,
      allocationId,
    );
  }

  @ApiBadRequestResponse({ description: "Payment cannot be confirmed" })
  @Post(":salesPaymentId/confirm")
  confirm(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesPaymentId", new ParseUUIDPipe({ version: "4" }))
    salesPaymentId: string,
  ) {
    return this.salesPaymentsService.confirm(workspaceId, salesPaymentId);
  }

  @ApiBadRequestResponse({ description: "Payment cannot be cancelled" })
  @Post(":salesPaymentId/cancel")
  cancel(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesPaymentId", new ParseUUIDPipe({ version: "4" }))
    salesPaymentId: string,
  ) {
    return this.salesPaymentsService.cancel(workspaceId, salesPaymentId);
  }
}
