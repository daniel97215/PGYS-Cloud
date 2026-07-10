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
import { BusinessPartnerContactsService } from "./business-partner-contacts.service";
import { CreateBusinessPartnerContactDto } from "./dto/create-business-partner-contact.dto";
import { UpdateBusinessPartnerContactDto } from "./dto/update-business-partner-contact.dto";

@ApiTags("Business Partner Contacts")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/customers/:customerId/business-partner-contacts")
export class BusinessPartnerContactsController {
  constructor(
    private readonly businessPartnerContactsService: BusinessPartnerContactsService,
  ) {}

  @ApiOperation({ summary: "Create a business partner contact" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiBody({ type: CreateBusinessPartnerContactDto })
  @ApiCreatedResponse({ description: "Business partner contact created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
    @Body() data: CreateBusinessPartnerContactDto,
  ) {
    return this.businessPartnerContactsService.createContact(
      workspaceId,
      businessPartnerId,
      data,
    );
  }

  @ApiOperation({ summary: "List customer business partner contacts" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiOkResponse({ description: "Customer business partner contacts" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
  ) {
    return this.businessPartnerContactsService.listBusinessPartnerContacts(
      workspaceId,
      businessPartnerId,
    );
  }

  @ApiOperation({ summary: "Get a business partner contact" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "contactId", format: "uuid" })
  @ApiOkResponse({ description: "Business partner contact" })
  @ApiNotFoundResponse({ description: "Business partner contact not found" })
  @Get(":contactId")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
    @Param("contactId", new ParseUUIDPipe({ version: "4" }))
    contactId: string,
  ) {
    return this.businessPartnerContactsService.getContact(
      workspaceId,
      businessPartnerId,
      contactId,
    );
  }

  @ApiOperation({ summary: "Update a business partner contact" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "contactId", format: "uuid" })
  @ApiBody({ type: UpdateBusinessPartnerContactDto })
  @ApiOkResponse({ description: "Business partner contact updated" })
  @ApiNotFoundResponse({ description: "Business partner contact not found" })
  @Patch(":contactId")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
    @Param("contactId", new ParseUUIDPipe({ version: "4" }))
    contactId: string,
    @Body() data: UpdateBusinessPartnerContactDto,
  ) {
    return this.businessPartnerContactsService.updateContact(
      workspaceId,
      businessPartnerId,
      contactId,
      data,
    );
  }

  @ApiOperation({ summary: "Delete a business partner contact" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "contactId", format: "uuid" })
  @ApiNoContentResponse({ description: "Business partner contact deleted" })
  @ApiNotFoundResponse({ description: "Business partner contact not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":contactId")
  async remove(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
    @Param("contactId", new ParseUUIDPipe({ version: "4" }))
    contactId: string,
  ): Promise<void> {
    await this.businessPartnerContactsService.deleteContact(
      workspaceId,
      businessPartnerId,
      contactId,
    );
  }
}
