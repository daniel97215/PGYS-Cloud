import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { BusinessPartnerSearchService } from "./business-partner-search.service";
import { SearchBusinessPartnerDto } from "./dto/search-business-partner.dto";

@ApiTags("Business Partner Search")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/business-partner-search")
export class BusinessPartnerSearchController {
  constructor(
    private readonly businessPartnerSearchService: BusinessPartnerSearchService,
  ) {}

  @ApiOperation({ summary: "Search business partners" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Business partner search results" })
  @Get()
  search(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Query() query: SearchBusinessPartnerDto,
  ) {
    return this.businessPartnerSearchService.searchBusinessPartners(
      workspaceId,
      query,
    );
  }
}
