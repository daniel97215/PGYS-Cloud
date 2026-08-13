import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Request } from "express";
import { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AiAssistantsService } from "./ai-assistants.service";
import { CreateAiAssistantDto } from "./dto/create-ai-assistant.dto";
import { ExecuteAiAssistantDto } from "./dto/execute-ai-assistant.dto";
import { UpdateAiAssistantDto } from "./dto/update-ai-assistant.dto";

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags("AI Assistants")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/ai/assistants")
export class AiAssistantsController {
  constructor(private readonly service: AiAssistantsService) {}

  @ApiOperation({ summary: "Create a draft AI assistant" })
  @ApiBody({ type: CreateAiAssistantDto })
  @ApiCreatedResponse({ description: "AI assistant created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() data: CreateAiAssistantDto,
  ) {
    return this.service.create(workspaceId, request.user.id, data);
  }

  @ApiOperation({ summary: "List AI assistants" })
  @ApiOkResponse({ description: "AI assistants" })
  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.service.list(workspaceId, request.user.id);
  }

  @ApiOperation({ summary: "Get an AI assistant" })
  @ApiParam({ name: "code" })
  @Get(":code")
  get(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Param("code") code: string,
  ) {
    return this.service.get(workspaceId, request.user.id, code);
  }

  @ApiOperation({ summary: "Update a draft or inactive AI assistant" })
  @ApiBody({ type: UpdateAiAssistantDto })
  @Patch(":code")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Param("code") code: string,
    @Body() data: UpdateAiAssistantDto,
  ) {
    return this.service.update(workspaceId, request.user.id, code, data);
  }

  @ApiOperation({ summary: "Activate an AI assistant" })
  @Post(":code/activate")
  activate(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Param("code") code: string,
  ) {
    return this.service.activate(workspaceId, request.user.id, code);
  }

  @ApiOperation({ summary: "Deactivate an AI assistant" })
  @Post(":code/deactivate")
  deactivate(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Param("code") code: string,
  ) {
    return this.service.deactivate(workspaceId, request.user.id, code);
  }

  @ApiOperation({ summary: "Execute an active AI assistant once" })
  @ApiBody({ type: ExecuteAiAssistantDto })
  @Post(":code/execute")
  execute(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Param("code") code: string,
    @Body() data: ExecuteAiAssistantDto,
  ) {
    return this.service.execute(workspaceId, request.user.id, code, data);
  }

  @ApiOperation({ summary: "Delete a draft AI assistant" })
  @ApiNoContentResponse({ description: "AI assistant deleted" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":code")
  remove(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Param("code") code: string,
  ): Promise<void> {
    return this.service.remove(workspaceId, request.user.id, code);
  }
}
