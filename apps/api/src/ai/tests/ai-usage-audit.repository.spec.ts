import { AiUsageStatus, MemberStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { AI_PROVIDER } from "../ai.constants";
import { AiUsageAuditRepository } from "../ai-usage-audit.repository";

describe("AiUsageAuditRepository", () => {
  const workspaceId = "10000000-0000-4000-8000-000000000001";
  const actorId = "20000000-0000-4000-8000-000000000001";
  const record = {
    id: "30000000-0000-4000-8000-000000000001",
    workspaceId,
    actorId,
    sourceModule: "CRM",
    useCase: "OPPORTUNITY_SUMMARY",
    provider: AI_PROVIDER.OPENAI,
    model: "model-a",
    status: AiUsageStatus.SUCCESS,
    durationMs: 25,
    inputTokens: 4,
    outputTokens: 2,
    totalTokens: 6,
    errorCode: null,
    errorMessage: null,
    createdAt: new Date("2026-08-13T10:00:00.000Z"),
  };

  it("creates an immutable usage entry", async () => {
    const create = jest.fn().mockResolvedValue(record);
    const repository = new AiUsageAuditRepository(createPrismaMock({ create }));
    const data = {
      workspaceId,
      actorId,
      sourceModule: record.sourceModule,
      useCase: record.useCase,
      provider: AI_PROVIDER.OPENAI,
      model: record.model,
      status: AiUsageStatus.SUCCESS,
      durationMs: record.durationMs,
      inputTokens: 4,
      outputTokens: 2,
      totalTokens: 6,
    };

    await expect(repository.create(data)).resolves.toEqual(record);
    expect(create).toHaveBeenCalledWith({ data });
  });

  it("checks active membership within the Workspace", async () => {
    const memberFindFirst = jest.fn().mockResolvedValue({ id: "member-a" });
    const repository = new AiUsageAuditRepository(
      createPrismaMock({ memberFindFirst }),
    );

    await expect(
      repository.isActiveWorkspaceMember(workspaceId, actorId),
    ).resolves.toBe(true);
    expect(memberFindFirst).toHaveBeenCalledWith({
      where: { workspaceId, userId: actorId, status: MemberStatus.ACTIVE },
      select: { id: true },
    });
  });

  it("lists only filtered entries from the Workspace", async () => {
    const findMany = jest.fn().mockResolvedValue([record]);
    const count = jest.fn().mockResolvedValue(1);
    const repository = new AiUsageAuditRepository(
      createPrismaMock({ findMany, count }),
    );
    const from = new Date("2026-08-01T00:00:00.000Z");
    const to = new Date("2026-08-31T23:59:59.000Z");

    await expect(
      repository.search(workspaceId, {
        status: AiUsageStatus.SUCCESS,
        provider: AI_PROVIDER.OPENAI,
        useCase: record.useCase,
        from,
        to,
        page: 2,
        pageSize: 10,
      }),
    ).resolves.toEqual({ items: [record], total: 1, page: 2, pageSize: 10 });
    const where = {
      workspaceId,
      status: AiUsageStatus.SUCCESS,
      provider: AI_PROVIDER.OPENAI,
      useCase: record.useCase,
      createdAt: { gte: from, lte: to },
    };
    expect(findMany).toHaveBeenCalledWith({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: 10,
      take: 10,
    });
    expect(count).toHaveBeenCalledWith({ where });
  });
});

function createPrismaMock(methods: {
  create?: jest.Mock;
  findMany?: jest.Mock;
  count?: jest.Mock;
  memberFindFirst?: jest.Mock;
  workspaceFindUnique?: jest.Mock;
}): PrismaService {
  return {
    aiUsageAudit: {
      create: methods.create ?? jest.fn(),
      findMany: methods.findMany ?? jest.fn(),
      count: methods.count ?? jest.fn(),
    },
    member: { findFirst: methods.memberFindFirst ?? jest.fn() },
    workspace: { findUnique: methods.workspaceFindUnique ?? jest.fn() },
  } as unknown as PrismaService;
}
