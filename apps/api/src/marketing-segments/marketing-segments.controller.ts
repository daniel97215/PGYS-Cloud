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
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateMarketingSegmentDto } from "./dto/create-marketing-segment.dto";
import { EvaluateMarketingSegmentDto } from "./dto/evaluate-marketing-segment.dto";
import { UpdateMarketingSegmentDto } from "./dto/update-marketing-segment.dto";
import { MarketingSegmentsService } from "./marketing-segments.service";

@ApiTags("Marketing Segments")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/marketing/segments")
export class MarketingSegmentsController {
  constructor(private readonly service: MarketingSegmentsService) {}

  @ApiOperation({ summary: "Create a dynamic marketing segment" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateMarketingSegmentDto })
  @ApiCreatedResponse({ description: "Marketing segment created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Body() data: CreateMarketingSegmentDto,
  ) {
    return this.service.createSegment(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace marketing segments" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace marketing segments" })
  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
  ) {
    return this.service.listSegments(workspaceId);
  }

  @ApiOperation({ summary: "Evaluate a marketing segment" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiOkResponse({ description: "Paginated business partner audience" })
  @ApiNotFoundResponse({ description: "Marketing segment not found" })
  @Get(":code/evaluate")
  evaluate(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("code") code: string,
    @Query() pagination: EvaluateMarketingSegmentDto,
  ) {
    return this.service.evaluateSegment(workspaceId, code, pagination);
  }

  @ApiOperation({ summary: "Get a marketing segment" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiOkResponse({ description: "Marketing segment" })
  @ApiNotFoundResponse({ description: "Marketing segment not found" })
  @Get(":code")
  get(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("code") code: string,
  ) {
    return this.service.getSegment(workspaceId, code);
  }

  @ApiOperation({ summary: "Update a marketing segment" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiBody({ type: UpdateMarketingSegmentDto })
  @ApiOkResponse({ description: "Marketing segment updated" })
  @ApiNotFoundResponse({ description: "Marketing segment not found" })
  @Patch(":code")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("code") code: string,
    @Body() data: UpdateMarketingSegmentDto,
  ) {
    return this.service.updateSegment(workspaceId, code, data);
  }

  @ApiOperation({ summary: "Deactivate a marketing segment" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiNoContentResponse({ description: "Marketing segment deactivated" })
  @ApiNotFoundResponse({ description: "Marketing segment not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":code")
  async deactivate(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" })) workspaceId: string,
    @Param("code") code: string,
  ): Promise<void> {
    await this.service.deactivateSegment(workspaceId, code);
  }
}
