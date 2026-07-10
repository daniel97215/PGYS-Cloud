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
    businessPartnerId: string,
    data: CreateBusinessPartnerNoteDto,
  ): Promise<BusinessPartnerNoteRecord> {
    return this.businessPartnerNotesRepository.create({
      ...data,
      workspaceId,
      businessPartnerId,
    });
  }

  listBusinessPartnerNotes(
    workspaceId: string,
    businessPartnerId: string,
  ): Promise<BusinessPartnerNoteRecord[]> {
    return this.businessPartnerNotesRepository.findByBusinessPartner(
      workspaceId,
      businessPartnerId,
    );
  }

  async getNote(
    workspaceId: string,
    businessPartnerId: string,
    noteId: string,
  ): Promise<BusinessPartnerNoteRecord> {
    return this.requireNote(workspaceId, businessPartnerId, noteId);
  }

  async updateNote(
    workspaceId: string,
    businessPartnerId: string,
    noteId: string,
    data: UpdateBusinessPartnerNoteDto,
  ): Promise<BusinessPartnerNoteRecord> {
    await this.requireNote(workspaceId, businessPartnerId, noteId);

    return this.businessPartnerNotesRepository.update(
      workspaceId,
      businessPartnerId,
      noteId,
      data,
    );
  }

  async deleteNote(
    workspaceId: string,
    businessPartnerId: string,
    noteId: string,
  ): Promise<BusinessPartnerNoteRecord> {
    await this.requireNote(workspaceId, businessPartnerId, noteId);

    return this.businessPartnerNotesRepository.delete(
      workspaceId,
      businessPartnerId,
      noteId,
    );
  }

  private async requireNote(
    workspaceId: string,
    businessPartnerId: string,
    noteId: string,
  ): Promise<BusinessPartnerNoteRecord> {
    const note = await this.businessPartnerNotesRepository.findById(
      workspaceId,
      businessPartnerId,
      noteId,
    );

    if (!note) {
      throw new NotFoundException(`Business partner note "${noteId}" not found`);
    }

    return note;
  }
}
