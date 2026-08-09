import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CreatePurchaseInvoiceDto } from "./dto/create-purchase-invoice.dto";
import { SearchPurchaseInvoicesDto } from "./dto/search-purchase-invoices.dto";
import { UpdatePurchaseInvoiceDto } from "./dto/update-purchase-invoice.dto";
import { PurchaseInvoicesService } from "./purchase-invoices.service";

@ApiTags("Purchase Invoices")
@Controller("workspaces/:workspaceId/purchase-invoices")
export class PurchaseInvoicesController {
  constructor(
    private readonly purchaseInvoicesService: PurchaseInvoicesService,
  ) {}

  @ApiOperation({ summary: "Create a draft purchase invoice" })
  @ApiBody({ type: CreatePurchaseInvoiceDto })
  @ApiCreatedResponse({ description: "Purchase invoice created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreatePurchaseInvoiceDto,
  ) {
    return this.purchaseInvoicesService.create(workspaceId, data);
  }

  @ApiOkResponse({ description: "Workspace purchase invoices" })
  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Query() filters: SearchPurchaseInvoicesDto,
  ) {
    return this.purchaseInvoicesService.list(workspaceId, filters);
  }

  @ApiNotFoundResponse({ description: "Purchase invoice not found" })
  @Get(":purchaseInvoiceId")
  get(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseInvoiceId", new ParseUUIDPipe({ version: "4" }))
    purchaseInvoiceId: string,
  ) {
    return this.purchaseInvoicesService.get(workspaceId, purchaseInvoiceId);
  }

  @ApiBody({ type: UpdatePurchaseInvoiceDto })
  @ApiBadRequestResponse({ description: "Purchase invoice is not a draft" })
  @Patch(":purchaseInvoiceId")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseInvoiceId", new ParseUUIDPipe({ version: "4" }))
    purchaseInvoiceId: string,
    @Body() data: UpdatePurchaseInvoiceDto,
  ) {
    return this.purchaseInvoicesService.update(
      workspaceId,
      purchaseInvoiceId,
      data,
    );
  }

  @ApiBadRequestResponse({ description: "Invoice cannot be confirmed" })
  @Post(":purchaseInvoiceId/confirm")
  confirm(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseInvoiceId", new ParseUUIDPipe({ version: "4" }))
    purchaseInvoiceId: string,
  ) {
    return this.purchaseInvoicesService.confirm(workspaceId, purchaseInvoiceId);
  }

  @ApiBadRequestResponse({ description: "Invoice cannot be cancelled" })
  @Post(":purchaseInvoiceId/cancel")
  cancel(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseInvoiceId", new ParseUUIDPipe({ version: "4" }))
    purchaseInvoiceId: string,
  ) {
    return this.purchaseInvoicesService.cancel(workspaceId, purchaseInvoiceId);
  }
}
