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
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Request } from "express";
import { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AiUsageAuditService } from "./ai-usage-audit.service";
import { AiUsagePageResponseDto } from "./dto/ai-usage-response.dto";
import { SearchAiUsageDto } from "./dto/search-ai-usage.dto";

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags("AI Usage")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/ai/usages")
export class AiUsageAuditController {
  constructor(private readonly auditService: AiUsageAuditService) {}

  @ApiOperation({ summary: "List immutable AI usage audit entries" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ type: AiUsagePageResponseDto })
  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Query() query: SearchAiUsageDto,
  ): Promise<AiUsagePageResponseDto> {
    return this.auditService.list(workspaceId, request.user.id, query);
  }
}
