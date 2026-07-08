import { PrismaService } from "../../prisma/prisma.service";
import { BusinessPartnerNotesRepository } from "../business-partner-notes.repository";

describe("BusinessPartnerNotesRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const customerId = "20000000-0000-4000-8000-000000000001";
  const noteId = "30000000-0000-4000-8000-000000000001";
  const userId = "40000000-0000-4000-8000-000000000001";
  const note = {
    id: noteId,
    workspaceId,
    customerId,
    title: "Internal context",
    content: "Customer prefers monthly operational reviews.",
    createdBy: userId,
    updatedBy: userId,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };

  it("creates a business partner note through Prisma", async () => {
    const create = jest.fn().mockResolvedValue(note);
    const repository = new BusinessPartnerNotesRepository(
      createPrismaMock({ create }),
    );

    const result = await repository.create({
      workspaceId,
      customerId,
      title: note.title,
      content: note.content,
      createdBy: note.createdBy,
      updatedBy: note.updatedBy,
    });

    expect(result).toEqual(note);
    expect(create).toHaveBeenCalledWith({
      data: {
        workspaceId,
        customerId,
        title: note.title,
        content: note.content,
        createdBy: note.createdBy,
        updatedBy: note.updatedBy,
      },
    });
  });

  it("updates a business partner note through Prisma", async () => {
    const update = jest.fn().mockResolvedValue(note);
    const repository = new BusinessPartnerNotesRepository(
      createPrismaMock({ update }),
    );

    const result = await repository.update(workspaceId, customerId, noteId, {
      content: "Updated internal context.",
      updatedBy: userId,
    });

    expect(result).toEqual(note);
    expect(update).toHaveBeenCalledWith({
      where: {
        id: noteId,
        workspaceId,
        customerId,
      },
      data: {
        content: "Updated internal context.",
        updatedBy: userId,
      },
    });
  });

  it("deletes a business partner note through Prisma", async () => {
    const deleteNote = jest.fn().mockResolvedValue(note);
    const repository = new BusinessPartnerNotesRepository(
      createPrismaMock({ delete: deleteNote }),
    );

    const result = await repository.delete(workspaceId, customerId, noteId);

    expect(result).toEqual(note);
    expect(deleteNote).toHaveBeenCalledWith({
      where: {
        id: noteId,
        workspaceId,
        customerId,
      },
    });
  });

  it("lists business partner notes for a customer through Prisma", async () => {
    const findMany = jest.fn().mockResolvedValue([note]);
    const repository = new BusinessPartnerNotesRepository(
      createPrismaMock({ findMany }),
    );

    const result = await repository.findByCustomer(workspaceId, customerId);

    expect(result).toEqual([note]);
    expect(findMany).toHaveBeenCalledWith({
      where: { workspaceId, customerId },
      orderBy: [{ createdAt: "desc" }],
    });
  });

  it("finds a business partner note by id through Prisma", async () => {
    const findFirst = jest.fn().mockResolvedValue(note);
    const repository = new BusinessPartnerNotesRepository(
      createPrismaMock({ findFirst }),
    );

    const result = await repository.findById(workspaceId, customerId, noteId);

    expect(result).toEqual(note);
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: noteId,
        workspaceId,
        customerId,
      },
    });
  });
});

function createPrismaMock(methods: {
  create?: jest.Mock;
  update?: jest.Mock;
  delete?: jest.Mock;
  findMany?: jest.Mock;
  findFirst?: jest.Mock;
}): PrismaService {
  const prisma = {
    businessPartnerNote: {
      create: methods.create ?? jest.fn(),
      update: methods.update ?? jest.fn(),
      delete: methods.delete ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      findFirst: methods.findFirst ?? jest.fn(),
    },
  };

  return prisma as unknown as PrismaService;
}
