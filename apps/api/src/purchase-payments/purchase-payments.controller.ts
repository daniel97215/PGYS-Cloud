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
import { CreatePurchasePaymentDto } from "./dto/create-purchase-payment.dto";
import { SearchPurchasePaymentsDto } from "./dto/search-purchase-payments.dto";
import { UpdatePurchasePaymentDto } from "./dto/update-purchase-payment.dto";
import { PurchasePaymentsService } from "./purchase-payments.service";

@ApiTags("Purchase Payments")
@Controller("workspaces/:workspaceId/purchase-payments")
export class PurchasePaymentsController {
  constructor(
    private readonly purchasePaymentsService: PurchasePaymentsService,
  ) {}

  @ApiOperation({ summary: "Create a draft purchase payment" })
  @ApiBody({ type: CreatePurchasePaymentDto })
  @ApiCreatedResponse({ description: "Purchase payment created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreatePurchasePaymentDto,
  ) {
    return this.purchasePaymentsService.create(workspaceId, data);
  }

  @ApiOkResponse({ description: "Workspace purchase payments" })
  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Query() filters: SearchPurchasePaymentsDto,
  ) {
    return this.purchasePaymentsService.list(workspaceId, filters);
  }

  @ApiNotFoundResponse({ description: "Purchase payment not found" })
  @Get(":purchasePaymentId")
  get(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchasePaymentId", new ParseUUIDPipe({ version: "4" }))
    purchasePaymentId: string,
  ) {
    return this.purchasePaymentsService.get(workspaceId, purchasePaymentId);
  }

  @ApiBody({ type: UpdatePurchasePaymentDto })
  @ApiBadRequestResponse({ description: "Purchase payment is not a draft" })
  @Patch(":purchasePaymentId")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchasePaymentId", new ParseUUIDPipe({ version: "4" }))
    purchasePaymentId: string,
    @Body() data: UpdatePurchasePaymentDto,
  ) {
    return this.purchasePaymentsService.update(
      workspaceId,
      purchasePaymentId,
      data,
    );
  }

  @ApiBadRequestResponse({ description: "Payment cannot be confirmed" })
  @Post(":purchasePaymentId/confirm")
  confirm(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchasePaymentId", new ParseUUIDPipe({ version: "4" }))
    purchasePaymentId: string,
  ) {
    return this.purchasePaymentsService.confirm(workspaceId, purchasePaymentId);
  }

  @ApiBadRequestResponse({ description: "Payment cannot be cancelled" })
  @Post(":purchasePaymentId/cancel")
  cancel(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchasePaymentId", new ParseUUIDPipe({ version: "4" }))
    purchasePaymentId: string,
  ) {
    return this.purchasePaymentsService.cancel(workspaceId, purchasePaymentId);
  }
}
