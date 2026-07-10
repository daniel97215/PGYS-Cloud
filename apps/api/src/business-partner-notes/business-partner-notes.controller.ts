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
import { BusinessPartnerNotesService } from "./business-partner-notes.service";
import { CreateBusinessPartnerNoteDto } from "./dto/create-business-partner-note.dto";
import { UpdateBusinessPartnerNoteDto } from "./dto/update-business-partner-note.dto";

@ApiTags("Business Partner Notes")
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: "Access token missing or invalid" })
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/customers/:customerId/business-partner-notes")
export class BusinessPartnerNotesController {
  constructor(
    private readonly businessPartnerNotesService: BusinessPartnerNotesService,
  ) {}

  @ApiOperation({ summary: "Create a business partner note" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiBody({ type: CreateBusinessPartnerNoteDto })
  @ApiCreatedResponse({ description: "Business partner note created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
    @Body() data: CreateBusinessPartnerNoteDto,
  ) {
    return this.businessPartnerNotesService.createNote(
      workspaceId,
      businessPartnerId,
      data,
    );
  }

  @ApiOperation({ summary: "List customer business partner notes" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiOkResponse({ description: "Customer business partner notes" })
  @Get()
  findAll(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
  ) {
    return this.businessPartnerNotesService.listBusinessPartnerNotes(
      workspaceId,
      businessPartnerId,
    );
  }

  @ApiOperation({ summary: "Get a business partner note" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "noteId", format: "uuid" })
  @ApiOkResponse({ description: "Business partner note" })
  @ApiNotFoundResponse({ description: "Business partner note not found" })
  @Get(":noteId")
  findOne(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
    @Param("noteId", new ParseUUIDPipe({ version: "4" }))
    noteId: string,
  ) {
    return this.businessPartnerNotesService.getNote(
      workspaceId,
      businessPartnerId,
      noteId,
    );
  }

  @ApiOperation({ summary: "Update a business partner note" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "noteId", format: "uuid" })
  @ApiBody({ type: UpdateBusinessPartnerNoteDto })
  @ApiOkResponse({ description: "Business partner note updated" })
  @ApiNotFoundResponse({ description: "Business partner note not found" })
  @Patch(":noteId")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
    @Param("noteId", new ParseUUIDPipe({ version: "4" }))
    noteId: string,
    @Body() data: UpdateBusinessPartnerNoteDto,
  ) {
    return this.businessPartnerNotesService.updateNote(
      workspaceId,
      businessPartnerId,
      noteId,
      data,
    );
  }

  @ApiOperation({ summary: "Delete a business partner note" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "noteId", format: "uuid" })
  @ApiNoContentResponse({ description: "Business partner note deleted" })
  @ApiNotFoundResponse({ description: "Business partner note not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":noteId")
  async remove(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    businessPartnerId: string,
    @Param("noteId", new ParseUUIDPipe({ version: "4" }))
    noteId: string,
  ): Promise<void> {
    await this.businessPartnerNotesService.deleteNote(
      workspaceId,
      businessPartnerId,
      noteId,
    );
  }
}
