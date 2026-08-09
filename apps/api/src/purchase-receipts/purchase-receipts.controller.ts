import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { AddPurchaseReceiptLineDto } from "./dto/add-purchase-receipt-line.dto";
import { CreatePurchaseReceiptDto } from "./dto/create-purchase-receipt.dto";
import { UpdatePurchaseReceiptDto } from "./dto/update-purchase-receipt.dto";
import { PurchaseReceiptsService } from "./purchase-receipts.service";

@ApiTags("Purchase Receipts")
@Controller("workspaces/:workspaceId/purchase-receipts")
export class PurchaseReceiptsController {
  constructor(
    private readonly purchaseReceiptsService: PurchaseReceiptsService,
  ) {}

  @ApiOperation({ summary: "Create a draft purchase receipt" })
  @ApiBody({ type: CreatePurchaseReceiptDto })
  @ApiCreatedResponse({ description: "Purchase receipt created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreatePurchaseReceiptDto,
  ) {
    return this.purchaseReceiptsService.create(workspaceId, data);
  }

  @ApiOkResponse({ description: "Workspace purchase receipts" })
  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.purchaseReceiptsService.list(workspaceId);
  }

  @ApiNotFoundResponse({ description: "Purchase receipt not found" })
  @Get(":purchaseReceiptId")
  get(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseReceiptId", new ParseUUIDPipe({ version: "4" }))
    purchaseReceiptId: string,
  ) {
    return this.purchaseReceiptsService.get(workspaceId, purchaseReceiptId);
  }

  @ApiBody({ type: UpdatePurchaseReceiptDto })
  @ApiBadRequestResponse({ description: "Purchase receipt is not a draft" })
  @Patch(":purchaseReceiptId")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseReceiptId", new ParseUUIDPipe({ version: "4" }))
    purchaseReceiptId: string,
    @Body() data: UpdatePurchaseReceiptDto,
  ) {
    return this.purchaseReceiptsService.update(
      workspaceId,
      purchaseReceiptId,
      data,
    );
  }

  @ApiBody({ type: AddPurchaseReceiptLineDto })
  @Post(":purchaseReceiptId/lines")
  addLine(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseReceiptId", new ParseUUIDPipe({ version: "4" }))
    purchaseReceiptId: string,
    @Body() data: AddPurchaseReceiptLineDto,
  ) {
    return this.purchaseReceiptsService.addLine(
      workspaceId,
      purchaseReceiptId,
      data,
    );
  }

  @ApiBody({ type: AddPurchaseReceiptLineDto })
  @Patch(":purchaseReceiptId/lines/:lineId")
  updateLine(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseReceiptId", new ParseUUIDPipe({ version: "4" }))
    purchaseReceiptId: string,
    @Param("lineId", new ParseUUIDPipe({ version: "4" })) lineId: string,
    @Body() data: AddPurchaseReceiptLineDto,
  ) {
    return this.purchaseReceiptsService.updateLine(
      workspaceId,
      purchaseReceiptId,
      lineId,
      data,
    );
  }

  @ApiBadRequestResponse({ description: "Purchase receipt cannot be confirmed" })
  @Post(":purchaseReceiptId/confirm")
  confirm(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseReceiptId", new ParseUUIDPipe({ version: "4" }))
    purchaseReceiptId: string,
  ) {
    return this.purchaseReceiptsService.confirm(workspaceId, purchaseReceiptId);
  }

  @Post(":purchaseReceiptId/cancel")
  cancel(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseReceiptId", new ParseUUIDPipe({ version: "4" }))
    purchaseReceiptId: string,
  ) {
    return this.purchaseReceiptsService.cancel(workspaceId, purchaseReceiptId);
  }
}
