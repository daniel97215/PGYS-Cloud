import { Injectable, NotFoundException } from "@nestjs/common";
import {
  BusinessPartnerNoteRecord,
  BusinessPartnerNotesRepository,
} from "./business-partner-notes.repository";
import { CreateBusinessPartnerNoteDto } from "./dto/create-business-partner-note.dto";
import { UpdateBusinessPartnerNoteDto } from "./dto/update-business-partner-note.dto";

@Injectable()
export class BusinessPartnerNotesService {
  constructor(
    private readonly businessPartnerNotesRepository: BusinessPartnerNotesRepository,
  ) {}

  createNote(
    workspaceId: string,
    customerId: string,
    data: CreateBusinessPartnerNoteDto,
  ): Promise<BusinessPartnerNoteRecord> {
    return this.businessPartnerNotesRepository.create({
      ...data,
      workspaceId,
      customerId,
    });
  }

  listCustomerNotes(
    workspaceId: string,
    customerId: string,
  ): Promise<BusinessPartnerNoteRecord[]> {
    return this.businessPartnerNotesRepository.findByCustomer(
      workspaceId,
      customerId,
    );
  }

  async getNote(
    workspaceId: string,
    customerId: string,
    noteId: string,
  ): Promise<BusinessPartnerNoteRecord> {
    return this.requireNote(workspaceId, customerId, noteId);
  }

  async updateNote(
    workspaceId: string,
    customerId: string,
    noteId: string,
    data: UpdateBusinessPartnerNoteDto,
  ): Promise<BusinessPartnerNoteRecord> {
    await this.requireNote(workspaceId, customerId, noteId);

    return this.businessPartnerNotesRepository.update(
      workspaceId,
      customerId,
      noteId,
      data,
    );
  }

  async deleteNote(
    workspaceId: string,
    customerId: string,
    noteId: string,
  ): Promise<BusinessPartnerNoteRecord> {
    await this.requireNote(workspaceId, customerId, noteId);

    return this.businessPartnerNotesRepository.delete(
      workspaceId,
      customerId,
      noteId,
    );
  }

  private async requireNote(
    workspaceId: string,
    customerId: string,
    noteId: string,
  ): Promise<BusinessPartnerNoteRecord> {
    const note = await this.businessPartnerNotesRepository.findById(
      workspaceId,
      customerId,
      noteId,
    );

    if (!note) {
      throw new NotFoundException(`Business partner note "${noteId}" not found`);
    }

    return note;
  }
}
