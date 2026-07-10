import { NotFoundException } from "@nestjs/common";
import { BusinessPartnerNotesRepository } from "../business-partner-notes.repository";
import { BusinessPartnerNotesService } from "../business-partner-notes.service";

describe("BusinessPartnerNotesService", () => {
  let repository: jest.Mocked<BusinessPartnerNotesRepository>;
  let service: BusinessPartnerNotesService;

  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const businessPartnerId = "20000000-0000-4000-8000-000000000001";
  const noteId = "30000000-0000-4000-8000-000000000001";
  const userId = "40000000-0000-4000-8000-000000000001";
  const note = {
    id: noteId,
    workspaceId,
    businessPartnerId,
    title: "Internal context",
    content: "Customer prefers monthly operational reviews.",
    createdBy: userId,
    updatedBy: userId,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    repository = {
      create: jest.fn().mockResolvedValue(note),
      update: jest.fn().mockResolvedValue(note),
      delete: jest.fn().mockResolvedValue(note),
      findByBusinessPartner: jest.fn().mockResolvedValue([note]),
      findById: jest.fn().mockResolvedValue(note),
    } as unknown as jest.Mocked<BusinessPartnerNotesRepository>;

    service = new BusinessPartnerNotesService(repository);
  });

  it("creates a business partner note", async () => {
    const result = await service.createNote(workspaceId, businessPartnerId, {
      title: note.title,
      content: note.content,
      createdBy: note.createdBy,
      updatedBy: note.updatedBy,
    });

    expect(result).toEqual(note);
    expect(repository.create).toHaveBeenCalledWith({
      workspaceId,
      businessPartnerId,
      title: note.title,
      content: note.content,
      createdBy: note.createdBy,
      updatedBy: note.updatedBy,
    });
  });

  it("lists customer business partner notes", async () => {
    const result = await service.listBusinessPartnerNotes(workspaceId, businessPartnerId);

    expect(result).toEqual([note]);
    expect(repository.findByBusinessPartner).toHaveBeenCalledWith(
      workspaceId,
      businessPartnerId,
    );
  });

  it("gets a business partner note", async () => {
    const result = await service.getNote(workspaceId, businessPartnerId, noteId);

    expect(result).toEqual(note);
    expect(repository.findById).toHaveBeenCalledWith(
      workspaceId,
      businessPartnerId,
      noteId,
    );
  });

  it("updates a business partner note", async () => {
    const result = await service.updateNote(workspaceId, businessPartnerId, noteId, {
      content: "Updated internal context.",
      updatedBy: userId,
    });

    expect(result).toEqual(note);
    expect(repository.update).toHaveBeenCalledWith(
      workspaceId,
      businessPartnerId,
      noteId,
      {
        content: "Updated internal context.",
        updatedBy: userId,
      },
    );
  });

  it("deletes a business partner note", async () => {
    const result = await service.deleteNote(workspaceId, businessPartnerId, noteId);

    expect(result).toEqual(note);
    expect(repository.delete).toHaveBeenCalledWith(
      workspaceId,
      businessPartnerId,
      noteId,
    );
  });

  it("throws NotFoundException when note is unknown", async () => {
    repository.findById.mockResolvedValueOnce(null);

    await expect(
      service.getNote(workspaceId, businessPartnerId, noteId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
