import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
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
import { BusinessPartnerCategoriesService } from "./business-partner-categories.service";
import { AssignBusinessPartnerCategoryDto } from "./dto/assign-business-partner-category.dto";

@ApiTags("Business Partner Category Assignments")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/business-partners/:businessPartnerCode/categories")
export class BusinessPartnerCategoryAssignmentsController {
  constructor(
    private readonly businessPartnerCategoriesService: BusinessPartnerCategoriesService,
  ) {}

  @ApiOperation({ summary: "Assign a category to a business partner" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "businessPartnerCode" })
  @ApiBody({ type: AssignBusinessPartnerCategoryDto })
  @ApiCreatedResponse({ description: "Business partner category assigned" })
  @ApiNotFoundResponse({ description: "Business partner or category not found" })
  @Post()
  assign(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("businessPartnerCode") businessPartnerCode: string,
    @Body() data: AssignBusinessPartnerCategoryDto,
  ) {
    return this.businessPartnerCategoriesService.assignCategory(
      workspaceId,
      businessPartnerCode,
      data,
    );
  }

  @ApiOperation({ summary: "List categories assigned to a business partner" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "businessPartnerCode" })
  @ApiOkResponse({ description: "Business partner categories" })
  @ApiNotFoundResponse({ description: "Business partner not found" })
  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("businessPartnerCode") businessPartnerCode: string,
  ) {
    return this.businessPartnerCategoriesService.listBusinessPartnerCategories(
      workspaceId,
      businessPartnerCode,
    );
  }

  @ApiOperation({ summary: "Remove a category from a business partner" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "businessPartnerCode" })
  @ApiParam({ name: "categoryCode" })
  @ApiNoContentResponse({ description: "Business partner category removed" })
  @ApiNotFoundResponse({
    description: "Business partner, category or assignment not found",
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":categoryCode")
  async remove(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("businessPartnerCode") businessPartnerCode: string,
    @Param("categoryCode") categoryCode: string,
  ): Promise<void> {
    await this.businessPartnerCategoriesService.removeCategory(
      workspaceId,
      businessPartnerCode,
      categoryCode,
    );
  }
}
