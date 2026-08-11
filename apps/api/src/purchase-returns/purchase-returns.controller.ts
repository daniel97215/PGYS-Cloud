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
import { AddPurchaseReturnLineDto } from "./dto/add-purchase-return-line.dto";
import { CreatePurchaseReturnDto } from "./dto/create-purchase-return.dto";
import { UpdatePurchaseReturnDto } from "./dto/update-purchase-return.dto";
import { PurchaseReturnsService } from "./purchase-returns.service";

@ApiTags("Purchase Returns")
@Controller("workspaces/:workspaceId/purchase-returns")
export class PurchaseReturnsController {
  constructor(
    private readonly purchaseReturnsService: PurchaseReturnsService,
  ) {}

  @ApiOperation({ summary: "Create a draft purchase return" })
  @ApiBody({ type: CreatePurchaseReturnDto })
  @ApiCreatedResponse({ description: "Purchase return created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreatePurchaseReturnDto,
  ) {
    return this.purchaseReturnsService.create(workspaceId, data);
  }

  @ApiOkResponse({ description: "Workspace purchase returns" })
  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.purchaseReturnsService.list(workspaceId);
  }

  @ApiNotFoundResponse({ description: "Purchase return not found" })
  @Get(":purchaseReturnId")
  get(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseReturnId", new ParseUUIDPipe({ version: "4" }))
    purchaseReturnId: string,
  ) {
    return this.purchaseReturnsService.get(workspaceId, purchaseReturnId);
  }

  @ApiBody({ type: UpdatePurchaseReturnDto })
  @ApiBadRequestResponse({ description: "Purchase return is not a draft" })
  @Patch(":purchaseReturnId")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseReturnId", new ParseUUIDPipe({ version: "4" }))
    purchaseReturnId: string,
    @Body() data: UpdatePurchaseReturnDto,
  ) {
    return this.purchaseReturnsService.update(workspaceId, purchaseReturnId, data);
  }

  @ApiBody({ type: AddPurchaseReturnLineDto })
  @Post(":purchaseReturnId/lines")
  addLine(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseReturnId", new ParseUUIDPipe({ version: "4" }))
    purchaseReturnId: string,
    @Body() data: AddPurchaseReturnLineDto,
  ) {
    return this.purchaseReturnsService.addLine(
      workspaceId,
      purchaseReturnId,
      data,
    );
  }

  @ApiBody({ type: AddPurchaseReturnLineDto })
  @Patch(":purchaseReturnId/lines/:lineId")
  updateLine(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseReturnId", new ParseUUIDPipe({ version: "4" }))
    purchaseReturnId: string,
    @Param("lineId", new ParseUUIDPipe({ version: "4" })) lineId: string,
    @Body() data: AddPurchaseReturnLineDto,
  ) {
    return this.purchaseReturnsService.updateLine(
      workspaceId,
      purchaseReturnId,
      lineId,
      data,
    );
  }

  @ApiBadRequestResponse({ description: "Purchase return cannot be confirmed" })
  @Post(":purchaseReturnId/confirm")
  confirm(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseReturnId", new ParseUUIDPipe({ version: "4" }))
    purchaseReturnId: string,
  ) {
    return this.purchaseReturnsService.confirm(workspaceId, purchaseReturnId);
  }

  @Post(":purchaseReturnId/cancel")
  cancel(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("purchaseReturnId", new ParseUUIDPipe({ version: "4" }))
    purchaseReturnId: string,
  ) {
    return this.purchaseReturnsService.cancel(workspaceId, purchaseReturnId);
  }
}
