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
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@ApiTags("Customers")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @ApiOperation({ summary: "Create a customer, prospect, partner or supplier" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateCustomerDto })
  @ApiCreatedResponse({ description: "Customer created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateCustomerDto,
  ) {
    return this.customersService.createCustomer(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace customers" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace customers" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.customersService.listWorkspaceCustomers(workspaceId);
  }

  @ApiOperation({ summary: "Get a customer by code" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiOkResponse({ description: "Customer" })
  @ApiNotFoundResponse({ description: "Customer not found" })
  @Get(":code")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ) {
    return this.customersService.getCustomer(workspaceId, code);
  }

  @ApiOperation({ summary: "Update a customer" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiOkResponse({ description: "Customer updated" })
  @ApiNotFoundResponse({ description: "Customer not found" })
  @Patch(":code")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
    @Body() data: UpdateCustomerDto,
  ) {
    return this.customersService.updateCustomer(workspaceId, code, data);
  }

  @ApiOperation({ summary: "Archive a customer" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "code" })
  @ApiNoContentResponse({ description: "Customer archived" })
  @ApiNotFoundResponse({ description: "Customer not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":code")
  async archive(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("code") code: string,
  ): Promise<void> {
    await this.customersService.archiveCustomer(workspaceId, code);
  }
}
