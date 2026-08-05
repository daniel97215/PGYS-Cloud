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
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { AddSalesQuoteLineDto } from "./dto/add-sales-quote-line.dto";
import { CreateSalesQuoteDto } from "./dto/create-sales-quote.dto";
import { UpdateSalesQuoteDto } from "./dto/update-sales-quote.dto";
import { SalesQuotesService } from "./sales-quotes.service";

@ApiTags("Sales Quotes")
@Controller("workspaces/:workspaceId/sales-quotes")
export class SalesQuotesController {
  constructor(private readonly salesQuotesService: SalesQuotesService) {}

  @ApiOperation({ summary: "Create a sales quote" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiBody({ type: CreateSalesQuoteDto })
  @ApiCreatedResponse({ description: "Sales quote created" })
  @Post()
  create(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Body() data: CreateSalesQuoteDto,
  ) {
    return this.salesQuotesService.create(workspaceId, data);
  }

  @ApiOperation({ summary: "List workspace sales quotes" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiOkResponse({ description: "Workspace sales quotes" })
  @Get()
  list(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
  ) {
    return this.salesQuotesService.list(workspaceId);
  }

  @ApiOperation({ summary: "Get a sales quote and its lines" })
  @ApiParam({ name: "workspaceId", format: "uuid" })
  @ApiParam({ name: "salesQuoteId", format: "uuid" })
  @ApiOkResponse({ description: "Sales quote" })
  @ApiNotFoundResponse({ description: "Sales quote not found" })
  @Get(":salesQuoteId")
  get(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesQuoteId", new ParseUUIDPipe({ version: "4" }))
    salesQuoteId: string,
  ) {
    return this.salesQuotesService.get(workspaceId, salesQuoteId);
  }

  @ApiOperation({ summary: "Update a draft sales quote" })
  @ApiBody({ type: UpdateSalesQuoteDto })
  @ApiOkResponse({ description: "Sales quote updated" })
  @ApiBadRequestResponse({ description: "Sales quote is not a draft" })
  @Patch(":salesQuoteId")
  update(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesQuoteId", new ParseUUIDPipe({ version: "4" }))
    salesQuoteId: string,
    @Body() data: UpdateSalesQuoteDto,
  ) {
    return this.salesQuotesService.update(workspaceId, salesQuoteId, data);
  }

  @ApiOperation({ summary: "Add a line to a draft sales quote" })
  @ApiBody({ type: AddSalesQuoteLineDto })
  @ApiCreatedResponse({ description: "Sales quote line added" })
  @Post(":salesQuoteId/lines")
  addLine(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesQuoteId", new ParseUUIDPipe({ version: "4" }))
    salesQuoteId: string,
    @Body() data: AddSalesQuoteLineDto,
  ) {
    return this.salesQuotesService.addLine(workspaceId, salesQuoteId, data);
  }

  @ApiOperation({ summary: "Replace a line on a draft sales quote" })
  @ApiBody({ type: AddSalesQuoteLineDto })
  @ApiOkResponse({ description: "Sales quote line updated" })
  @Patch(":salesQuoteId/lines/:lineId")
  updateLine(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesQuoteId", new ParseUUIDPipe({ version: "4" }))
    salesQuoteId: string,
    @Param("lineId", new ParseUUIDPipe({ version: "4" })) lineId: string,
    @Body() data: AddSalesQuoteLineDto,
  ) {
    return this.salesQuotesService.updateLine(
      workspaceId,
      salesQuoteId,
      lineId,
      data,
    );
  }

  @ApiOperation({ summary: "Remove a line from a draft sales quote" })
  @ApiNoContentResponse({ description: "Sales quote line removed" })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":salesQuoteId/lines/:lineId")
  removeLine(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesQuoteId", new ParseUUIDPipe({ version: "4" }))
    salesQuoteId: string,
    @Param("lineId", new ParseUUIDPipe({ version: "4" })) lineId: string,
  ): Promise<void> {
    return this.salesQuotesService.removeLine(
      workspaceId,
      salesQuoteId,
      lineId,
    );
  }

  @Post(":salesQuoteId/send")
  send(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesQuoteId", new ParseUUIDPipe({ version: "4" }))
    salesQuoteId: string,
  ) {
    return this.salesQuotesService.send(workspaceId, salesQuoteId);
  }

  @Post(":salesQuoteId/accept")
  accept(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesQuoteId", new ParseUUIDPipe({ version: "4" }))
    salesQuoteId: string,
  ) {
    return this.salesQuotesService.accept(workspaceId, salesQuoteId);
  }

  @Post(":salesQuoteId/reject")
  reject(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesQuoteId", new ParseUUIDPipe({ version: "4" }))
    salesQuoteId: string,
  ) {
    return this.salesQuotesService.reject(workspaceId, salesQuoteId);
  }

  @Post(":salesQuoteId/cancel")
  cancel(
    @Param("workspaceId", new ParseUUIDPipe({ version: "4" }))
    workspaceId: string,
    @Param("salesQuoteId", new ParseUUIDPipe({ version: "4" }))
    salesQuoteId: string,
  ) {
    return this.salesQuotesService.cancel(workspaceId, salesQuoteId);
  }
}
