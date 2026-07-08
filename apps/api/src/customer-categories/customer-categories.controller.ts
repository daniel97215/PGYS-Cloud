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
import { CustomerCategoriesService } from "./customer-categories.service";
import { CreateCustomerCategoryDto } from "./dto/create-customer-category.dto";
import { UpdateCustomerCategoryDto } from "./dto/update-customer-category.dto";

@ApiTags("Customer Categories")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/customer-categories")
export class CustomerCategoriesController {
  constructor(
    private readonly customerCategoriesService: CustomerCategoriesService,
  ) {}

  @ApiOperation({ summary: "Create a customer category" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateCustomerCategoryDto })
  @ApiCreatedResponse({ description: "Customer category created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateCustomerCategoryDto,
  ) {
    return this.customerCategoriesService.createCategory(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace customer categories" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace customer categories" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.customerCategoriesService.listWorkspaceCategories(workspaceId);
  }

  @ApiOperation({ summary: "Get a customer category by code" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiOkResponse({ description: "Customer category" })
  @ApiNotFoundResponse({ description: "Customer category not found" })
  @Get(":code")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ) {
    return this.customerCategoriesService.getCategory(workspaceId, code);
  }

  @ApiOperation({ summary: "Update a customer category" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiBody({ type: UpdateCustomerCategoryDto })
  @ApiOkResponse({ description: "Customer category updated" })
  @ApiNotFoundResponse({ description: "Customer category not found" })
  @Patch(":code")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
    @Body() data: UpdateCustomerCategoryDto,
  ) {
    return this.customerCategoriesService.updateCategory(
      workspaceId,
      code,
      data,
    );
  }

  @ApiOperation({ summary: "Disable a customer category" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiNoContentResponse({ description: "Customer category disabled" })
  @ApiNotFoundResponse({ description: "Customer category not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":code")
  async disable(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ): Promise<void> {
    await this.customerCategoriesService.disableCategory(workspaceId, code);
  }
}
