import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { BillingService } from "./billing.service";
import { CreateBillingInvoiceDto } from "./dto/create-billing-invoice.dto";

@ApiTags("Billing")
@Controller("workspaces/:workspaceId/billing/invoices")
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @ApiOperation({ summary: "Create a draft subscription invoice" })
  @ApiCreatedResponse({ description: "Draft billing invoice created" })
  @ApiConflictResponse({ description: "Invoice period already billed" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Body() data: CreateBillingInvoiceDto,
  ) {
    return this.billingService.create(workspaceId, data);
  }

  @ApiOkResponse({ description: "Workspace billing invoices" })
  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
  ) {
    return this.billingService.list(workspaceId);
  }

  @ApiNotFoundResponse({ description: "Billing invoice not found" })
  @Get(":invoiceId")
  get(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("invoiceId", new ParseUUIDPipe({ version: "4" })) invoiceId: string,
  ) {
    return this.billingService.get(workspaceId, invoiceId);
  }

  @Post(":invoiceId/open")
  open(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("invoiceId", new ParseUUIDPipe({ version: "4" })) invoiceId: string,
  ) {
    return this.billingService.open(workspaceId, invoiceId);
  }

  @Post(":invoiceId/mark-paid")
  markPaid(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("invoiceId", new ParseUUIDPipe({ version: "4" })) invoiceId: string,
  ) {
    return this.billingService.markPaid(workspaceId, invoiceId);
  }

  @Post(":invoiceId/mark-overdue")
  markOverdue(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("invoiceId", new ParseUUIDPipe({ version: "4" })) invoiceId: string,
  ) {
    return this.billingService.markOverdue(workspaceId, invoiceId);
  }

  @Post(":invoiceId/void")
  void(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("invoiceId", new ParseUUIDPipe({ version: "4" })) invoiceId: string,
  ) {
    return this.billingService.void(workspaceId, invoiceId);
  }
}
