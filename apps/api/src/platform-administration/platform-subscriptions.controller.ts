import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { PlatformOperatorRole } from "@prisma/client";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  PlatformSubscriptionPageResponseDto,
  PlatformSubscriptionResponseDto,
} from "./dto/platform-subscription-response.dto";
import { SearchPlatformSubscriptionsDto } from "./dto/search-platform-subscriptions.dto";
import { PlatformRoles } from "./platform-roles.decorator";
import { PlatformRolesGuard } from "./platform-roles.guard";
import { PlatformSubscriptionsService } from "./platform-subscriptions.service";

interface PlatformAuthenticatedRequest extends Request {
  platformOperator: { role: PlatformOperatorRole };
}

@ApiTags("Platform Administration")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@ApiForbiddenResponse({ description: "Platform operator access required" })
@UseGuards(JwtAuthGuard, PlatformRolesGuard)
@PlatformRoles(
  PlatformOperatorRole.PLATFORM_ADMIN,
  PlatformOperatorRole.PLATFORM_SUPPORT,
)
@Controller("platform/subscriptions")
export class PlatformSubscriptionsController {
  constructor(private readonly service: PlatformSubscriptionsService) {}

  @ApiOperation({ summary: "List subscriptions for a platform operator" })
  @ApiOkResponse({ type: PlatformSubscriptionPageResponseDto })
  @Get()
  search(
    @Query() criteria: SearchPlatformSubscriptionsDto,
    @Req() request: PlatformAuthenticatedRequest,
  ) {
    return this.service.search(criteria, request.platformOperator.role);
  }

  @ApiOperation({ summary: "Get a subscription for a platform operator" })
  @ApiOkResponse({ type: PlatformSubscriptionResponseDto })
  @ApiNotFoundResponse({ description: "Subscription not found" })
  @Get(":id")
  getOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.service.getOne(id);
  }
}
