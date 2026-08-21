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
  PlatformAuditPageResponseDto,
  PlatformAuditResponseDto,
} from "./dto/platform-audit-response.dto";
import { SearchPlatformAuditDto } from "./dto/search-platform-audit.dto";
import { PlatformAuditService } from "./platform-audit.service";
import { PlatformRoles } from "./platform-roles.decorator";
import { PlatformRolesGuard } from "./platform-roles.guard";

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
@Controller("platform/audit")
export class PlatformAuditController {
  constructor(private readonly service: PlatformAuditService) {}

  @ApiOperation({ summary: "List audit entries for a platform operator" })
  @ApiOkResponse({ type: PlatformAuditPageResponseDto })
  @Get()
  search(
    @Query() query: SearchPlatformAuditDto,
    @Req() request: PlatformAuthenticatedRequest,
  ) {
    return this.service.search(query, request.platformOperator.role);
  }

  @ApiOperation({ summary: "Get an audit entry for a platform operator" })
  @ApiOkResponse({ type: PlatformAuditResponseDto })
  @ApiNotFoundResponse({ description: "Audit entry not found" })
  @Get(":id")
  getOne(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string) {
    return this.service.getOne(id);
  }
}
