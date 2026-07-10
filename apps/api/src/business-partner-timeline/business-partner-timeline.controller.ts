import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { BusinessPartnerTimelineService } from "./business-partner-timeline.service";
import { CreateBusinessPartnerTimelineEntryDto } from "./dto/create-business-partner-timeline-entry.dto";

@ApiTags("Business Partner Timeline")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/customers/:customerId/business-partner-timeline")
export class BusinessPartnerTimelineController {
  constructor(
    private readonly businessPartnerTimelineService: BusinessPartnerTimelineService,
  ) {}

  @ApiOperation({ summary: "Create a business partner timeline entry" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiBody({ type: CreateBusinessPartnerTimelineEntryDto })
  @ApiCreatedResponse({ description: "Business partner timeline entry created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    customerId: string,
    @Body() data: CreateBusinessPartnerTimelineEntryDto,
  ) {
    return this.businessPartnerTimelineService.createEntry(
      workspaceId,
      customerId,
      data,
    );
  }

  @ApiOperation({ summary: "List customer business partner timeline entries" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiOkResponse({ description: "Customer business partner timeline entries" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    customerId: string,
  ) {
    return this.businessPartnerTimelineService.listCustomerEntries(
      workspaceId,
      customerId,
    );
  }

  @ApiOperation({ summary: "Get a business partner timeline entry" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "entryId", format: "uuid" })
  @ApiOkResponse({ description: "Business partner timeline entry" })
  @ApiNotFoundResponse({
    description: "Business partner timeline entry not found",
  })
  @Get(":entryId")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    customerId: string,
    @Param("entryId", new ParseUUIDPipe({ version: "4" }))
    entryId: string,
  ) {
    return this.businessPartnerTimelineService.getEntry(
      workspaceId,
      customerId,
      entryId,
    );
  }
}
