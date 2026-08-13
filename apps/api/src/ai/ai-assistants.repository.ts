import { Injectable } from "@nestjs/common";
import {
  AiAssistantStatus as PrismaAiAssistantStatus,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AiAssistantStatus } from "./ai.constants";

export type AiAssistantRecord = Prisma.AiAssistantGetPayload<object>;

export interface CreateAiAssistantData {
  workspaceId: string;
  code: string;
  name: string;
  description?: string;
  instructions: string;
}

export type UpdateAiAssistantData = Partial<
  Pick<CreateAiAssistantData, "name" | "description" | "instructions">
>;

@Injectable()
export class AiAssistantsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateAiAssistantData): Promise<AiAssistantRecord> {
    return this.prisma.aiAssistant.create({ data });
  }

  findByWorkspace(workspaceId: string): Promise<AiAssistantRecord[]> {
    return this.prisma.aiAssistant.findMany({
      where: { workspaceId },
      orderBy: [{ name: "asc" }, { code: "asc" }],
    });
  }

  findByCode(
    workspaceId: string,
    code: string,
  ): Promise<AiAssistantRecord | null> {
    return this.prisma.aiAssistant.findUnique({
      where: { workspaceId_code: { workspaceId, code } },
    });
  }

  async updateConfigurable(
    workspaceId: string,
    id: string,
    data: UpdateAiAssistantData,
  ): Promise<AiAssistantRecord | null> {
    const rows = await this.prisma.aiAssistant.updateManyAndReturn({
      where: {
        id,
        workspaceId,
        status: {
          in: [
            PrismaAiAssistantStatus.DRAFT,
            PrismaAiAssistantStatus.INACTIVE,
          ],
        },
      },
      data,
    });
    return rows[0] ?? null;
  }

  async transition(
    workspaceId: string,
    id: string,
    from: AiAssistantStatus[],
    to: AiAssistantStatus,
  ): Promise<AiAssistantRecord | null> {
    const rows = await this.prisma.aiAssistant.updateManyAndReturn({
      where: {
        id,
        workspaceId,
        status: { in: from as PrismaAiAssistantStatus[] },
      },
      data: { status: to as PrismaAiAssistantStatus },
    });
    return rows[0] ?? null;
  }

  async deleteDraft(workspaceId: string, id: string): Promise<boolean> {
    const result = await this.prisma.aiAssistant.deleteMany({
      where: {
        id,
        workspaceId,
        status: PrismaAiAssistantStatus.DRAFT,
      },
    });
    return result.count === 1;
  }
}
