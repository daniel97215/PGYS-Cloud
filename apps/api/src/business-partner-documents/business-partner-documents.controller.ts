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
import { BusinessPartnerDocumentsService } from "./business-partner-documents.service";
import { CreateBusinessPartnerDocumentDto } from "./dto/create-business-partner-document.dto";
import { UpdateBusinessPartnerDocumentDto } from "./dto/update-business-partner-document.dto";

@ApiTags("Business Partner Documents")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/customers/:customerId/business-partner-documents")
export class BusinessPartnerDocumentsController {
  constructor(
    private readonly businessPartnerDocumentsService: BusinessPartnerDocumentsService,
  ) {}

  @ApiOperation({ summary: "Create a business partner document" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiBody({ type: CreateBusinessPartnerDocumentDto })
  @ApiCreatedResponse({ description: "Business partner document created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
    @Body() data: CreateBusinessPartnerDocumentDto,
  ) {
    return this.businessPartnerDocumentsService.createDocument(
      workspaceId,
      businessPartnerId,
      data,
    );
  }

  @ApiOperation({ summary: "List customer business partner documents" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiOkResponse({ description: "Customer business partner documents" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
  ) {
    return this.businessPartnerDocumentsService.listBusinessPartnerDocuments(
      workspaceId,
      businessPartnerId,
    );
  }

  @ApiOperation({ summary: "Get a business partner document" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "documentId", format: "uuid" })
  @ApiOkResponse({ description: "Business partner document" })
  @ApiNotFoundResponse({ description: "Business partner document not found" })
  @Get(":documentId")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
    @Param("documentId", new ParseUUIDPipe({ version: "4" }))
    documentId: string,
  ) {
    return this.businessPartnerDocumentsService.getDocument(
      workspaceId,
      businessPartnerId,
      documentId,
    );
  }

  @ApiOperation({ summary: "Update a business partner document" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "documentId", format: "uuid" })
  @ApiBody({ type: UpdateBusinessPartnerDocumentDto })
  @ApiOkResponse({ description: "Business partner document updated" })
  @ApiNotFoundResponse({ description: "Business partner document not found" })
  @Patch(":documentId")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
    @Param("documentId", new ParseUUIDPipe({ version: "4" }))
    documentId: string,
    @Body() data: UpdateBusinessPartnerDocumentDto,
  ) {
    return this.businessPartnerDocumentsService.updateDocument(
      workspaceId,
      businessPartnerId,
      documentId,
      data,
    );
  }

  @ApiOperation({ summary: "Delete a business partner document" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "documentId", format: "uuid" })
  @ApiNoContentResponse({ description: "Business partner document deleted" })
  @ApiNotFoundResponse({ description: "Business partner document not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":documentId")
  async remove(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
    @Param("documentId", new ParseUUIDPipe({ version: "4" }))
    documentId: string,
  ): Promise<void> {
    await this.businessPartnerDocumentsService.deleteDocument(
      workspaceId,
      businessPartnerId,
      documentId,
    );
  }
}
