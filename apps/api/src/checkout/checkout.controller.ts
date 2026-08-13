import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { CheckoutService } from "./checkout.service";
import { CreateCheckoutDto } from "./dto/create-checkout.dto";

@ApiTags("Checkout")
@Controller("workspaces/:workspaceId/checkouts")
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @ApiOperation({ summary: "Create an idempotent checkout" })
  @ApiCreatedResponse({ description: "Checkout created or replayed" })
  @ApiConflictResponse({ description: "Idempotency key conflict" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Body() data: CreateCheckoutDto,
  ) {
    return this.checkoutService.create(workspaceId, data);
  }

  @ApiOkResponse({ description: "Workspace checkouts" })
  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
  ) {
    return this.checkoutService.list(workspaceId);
  }

  @ApiNotFoundResponse({ description: "Checkout not found" })
  @Get(":checkoutId")
  get(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("checkoutId", new ParseUUIDPipe({ version: "4" })) checkoutId: string,
  ) {
    return this.checkoutService.get(workspaceId, checkoutId);
  }

  @ApiOperation({ summary: "Complete checkout and create subscription and invoice" })
  @Post(":checkoutId/complete")
  complete(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("checkoutId", new ParseUUIDPipe({ version: "4" })) checkoutId: string,
  ) {
    return this.checkoutService.complete(workspaceId, checkoutId);
  }

  @Post(":checkoutId/cancel")
  cancel(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("checkoutId", new ParseUUIDPipe({ version: "4" })) checkoutId: string,
  ) {
    return this.checkoutService.cancel(workspaceId, checkoutId);
  }
}
