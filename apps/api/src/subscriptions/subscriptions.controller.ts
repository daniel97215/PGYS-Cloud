import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CancelSubscriptionDto } from "./dto/cancel-subscription.dto";
import { ChangeOfferDto } from "./dto/change-offer.dto";
import { CreateSubscriptionDto } from "./dto/create-subscription.dto";
import { ReactivateSubscriptionDto } from "./dto/reactivate-subscription.dto";
import { SubscriptionsService } from "./subscriptions.service";

@ApiTags("Subscriptions")
@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @ApiOperation({ summary: "Create a subscription" })
  @ApiBody({ type: CreateSubscriptionDto })
  @ApiCreatedResponse({ description: "Subscription created" })
  @ApiNotFoundResponse({ description: "Workspace, offer or price not found" })
  @Post()
  create(@Body() data: CreateSubscriptionDto) {
    return this.subscriptionsService.createSubscription(data);
  }

  @ApiOperation({ summary: "Get active subscription for a workspace" })
  @ApiParam({ name: "workspaceId" })
  @ApiOkResponse({ description: "Active subscription" })
  @ApiNotFoundResponse({ description: "Workspace or subscription not found" })
  @Get("workspaces/:workspaceId/active")
  findActive(@Param("workspaceId") workspaceId: string) {
    return this.subscriptionsService.getActiveSubscription(workspaceId);
  }

  @ApiOperation({ summary: "List subscriptions for a workspace" })
  @ApiParam({ name: "workspaceId" })
  @ApiOkResponse({ description: "Workspace subscriptions" })
  @ApiNotFoundResponse({ description: "Workspace not found" })
  @Get("workspaces/:workspaceId")
  findAllForWorkspace(@Param("workspaceId") workspaceId: string) {
    return this.subscriptionsService.listWorkspaceSubscriptions(workspaceId);
  }

  @ApiOperation({ summary: "Change subscription offer" })
  @ApiParam({ name: "subscriptionId" })
  @ApiBody({ type: ChangeOfferDto })
  @ApiOkResponse({ description: "Subscription offer changed" })
  @ApiNotFoundResponse({ description: "Subscription, offer or price not found" })
  @Patch(":subscriptionId/offer")
  changeOffer(
    @Param("subscriptionId") subscriptionId: string,
    @Body() data: ChangeOfferDto,
  ) {
    return this.subscriptionsService.changeOffer(subscriptionId, data);
  }

  @ApiOperation({ summary: "Suspend a subscription" })
  @ApiParam({ name: "subscriptionId" })
  @ApiOkResponse({ description: "Subscription suspended" })
  @ApiNotFoundResponse({ description: "Subscription not found" })
  @Patch(":subscriptionId/suspend")
  suspend(@Param("subscriptionId") subscriptionId: string) {
    return this.subscriptionsService.suspendSubscription(subscriptionId);
  }

  @ApiOperation({ summary: "Reactivate a subscription" })
  @ApiParam({ name: "subscriptionId" })
  @ApiBody({ type: ReactivateSubscriptionDto })
  @ApiOkResponse({ description: "Subscription reactivated" })
  @ApiNotFoundResponse({ description: "Subscription not found" })
  @Patch(":subscriptionId/reactivate")
  reactivate(
    @Param("subscriptionId") subscriptionId: string,
    @Body() data: ReactivateSubscriptionDto,
  ) {
    return this.subscriptionsService.reactivateSubscription(
      subscriptionId,
      data,
    );
  }

  @ApiOperation({ summary: "Cancel a subscription" })
  @ApiParam({ name: "subscriptionId" })
  @ApiBody({ type: CancelSubscriptionDto })
  @ApiOkResponse({ description: "Subscription cancelled" })
  @ApiNotFoundResponse({ description: "Subscription not found" })
  @Patch(":subscriptionId/cancel")
  cancel(
    @Param("subscriptionId") subscriptionId: string,
    @Body() data: CancelSubscriptionDto,
  ) {
    return this.subscriptionsService.cancelSubscription(subscriptionId, data);
  }
}
