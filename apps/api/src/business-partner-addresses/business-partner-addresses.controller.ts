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
import { BusinessPartnerAddressesService } from "./business-partner-addresses.service";
import { CreateBusinessPartnerAddressDto } from "./dto/create-business-partner-address.dto";
import { UpdateBusinessPartnerAddressDto } from "./dto/update-business-partner-address.dto";

@ApiTags("Business Partner Addresses")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/customers/:customerId/business-partner-addresses")
export class BusinessPartnerAddressesController {
  constructor(
    private readonly businessPartnerAddressesService: BusinessPartnerAddressesService,
  ) {}

  @ApiOperation({ summary: "Create a business partner address" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiBody({ type: CreateBusinessPartnerAddressDto })
  @ApiCreatedResponse({ description: "Business partner address created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
    @Body() data: CreateBusinessPartnerAddressDto,
  ) {
    return this.businessPartnerAddressesService.createAddress(
      workspaceId,
      businessPartnerId,
      data,
    );
  }

  @ApiOperation({ summary: "List customer business partner addresses" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiOkResponse({ description: "Customer business partner addresses" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
  ) {
    return this.businessPartnerAddressesService.listBusinessPartnerAddresses(
      workspaceId,
      businessPartnerId,
    );
  }

  @ApiOperation({ summary: "Get a business partner address" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "addressId", format: "uuid" })
  @ApiOkResponse({ description: "Business partner address" })
  @ApiNotFoundResponse({ description: "Business partner address not found" })
  @Get(":addressId")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
    @Param("addressId", new ParseUUIDPipe({ version: "4" }))
    addressId: string,
  ) {
    return this.businessPartnerAddressesService.getAddress(
      workspaceId,
      businessPartnerId,
      addressId,
    );
  }

  @ApiOperation({ summary: "Update a business partner address" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "addressId", format: "uuid" })
  @ApiBody({ type: UpdateBusinessPartnerAddressDto })
  @ApiOkResponse({ description: "Business partner address updated" })
  @ApiNotFoundResponse({ description: "Business partner address not found" })
  @Patch(":addressId")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
    @Param("addressId", new ParseUUIDPipe({ version: "4" }))
    addressId: string,
    @Body() data: UpdateBusinessPartnerAddressDto,
  ) {
    return this.businessPartnerAddressesService.updateAddress(
      workspaceId,
      businessPartnerId,
      addressId,
      data,
    );
  }

  @ApiOperation({ summary: "Delete a business partner address" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "addressId", format: "uuid" })
  @ApiNoContentResponse({ description: "Business partner address deleted" })
  @ApiNotFoundResponse({ description: "Business partner address not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":addressId")
  async remove(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
    @Param("addressId", new ParseUUIDPipe({ version: "4" }))
    addressId: string,
  ): Promise<void> {
    await this.businessPartnerAddressesService.deleteAddress(
      workspaceId,
      businessPartnerId,
      addressId,
    );
  }
}
