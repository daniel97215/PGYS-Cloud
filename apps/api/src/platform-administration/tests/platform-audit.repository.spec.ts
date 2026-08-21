import { AuditAction, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { PlatformAuditRepository } from "../platform-audit.repository";

describe("PlatformAuditRepository", () => {
  it("searches immutable audit entries with closed filters", async () => {
    const items = [createAuditRecord()];
    const findMany = jest.fn().mockResolvedValue(items);
    const count = jest.fn().mockResolvedValue(1);
    const repository = new PlatformAuditRepository({
      auditLog: { findMany, count },
    } as unknown as PrismaService);
    const from = new Date("2026-08-01T00:00:00.000Z");
    const to = new Date("2026-08-31T23:59:59.000Z");

    const result = await repository.search({
      search: "garage",
      action: AuditAction.UPDATED,
      workspaceId: "10000000-0000-4000-8000-000000000001",
      from,
      to,
      page: 2,
      pageSize: 10,
    });

    expect(result).toEqual({ items, total: 1, page: 2, pageSize: 10 });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          action: AuditAction.UPDATED,
          workspaceId: "10000000-0000-4000-8000-000000000001",
          createdAt: { gte: from, lte: to },
          OR: expect.any(Array),
        }),
        skip: 10,
        take: 10,
      }),
    );
    expect(count).toHaveBeenCalledWith({
      where: expect.objectContaining({ action: AuditAction.UPDATED }),
    });
  });
});

function createAuditRecord() {
  return {
    id: "50000000-0000-4000-8000-000000000001",
    action: AuditAction.UPDATED,
    targetType: "Workspace",
    targetId: "10000000-0000-4000-8000-000000000001",
    metadata: { changed: ["displayName"] } as Prisma.JsonValue,
    createdAt: new Date("2026-08-10T10:00:00.000Z"),
    workspace: {
      id: "10000000-0000-4000-8000-000000000001",
      displayName: "Garage Martin",
      slug: "garage-martin",
    },
    actor: {
      id: "60000000-0000-4000-8000-000000000001",
      firstName: "Alice",
      lastName: "Martin",
      email: "alice@example.test",
    },
  };
}
