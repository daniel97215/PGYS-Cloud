import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AI_ASSISTANT_STATUS, AI_MESSAGE_ROLE } from "./ai.constants";
import {
  AiAssistantRecord,
  AiAssistantsRepository,
  UpdateAiAssistantData,
} from "./ai-assistants.repository";
import { AiPlatformService } from "./ai-platform.service";
import { GenerateAiTextResponse } from "./ai-provider.contract";
import { AiUsageAuditService } from "./ai-usage-audit.service";
import { CreateAiAssistantDto } from "./dto/create-ai-assistant.dto";
import { ExecuteAiAssistantDto } from "./dto/execute-ai-assistant.dto";
import { UpdateAiAssistantDto } from "./dto/update-ai-assistant.dto";

@Injectable()
export class AiAssistantsService {
  constructor(
    private readonly repository: AiAssistantsRepository,
    private readonly aiPlatform: AiPlatformService,
    private readonly usageAudit: AiUsageAuditService,
  ) {}

  async create(
    workspaceId: string,
    userId: string,
    data: CreateAiAssistantDto,
  ): Promise<AiAssistantRecord> {
    await this.usageAudit.assertContext(workspaceId, userId);
    const code = this.normalizeCode(data.code);

    if (await this.repository.findByCode(workspaceId, code)) {
      throw new ConflictException(`AI assistant "${code}" already exists`);
    }

    return this.repository.create({ ...data, workspaceId, code });
  }

  async list(
    workspaceId: string,
    userId: string,
  ): Promise<AiAssistantRecord[]> {
    await this.usageAudit.assertContext(workspaceId, userId);
    return this.repository.findByWorkspace(workspaceId);
  }

  async get(
    workspaceId: string,
    userId: string,
    code: string,
  ): Promise<AiAssistantRecord> {
    await this.usageAudit.assertContext(workspaceId, userId);
    return this.requireAssistant(workspaceId, code);
  }

  async update(
    workspaceId: string,
    userId: string,
    code: string,
    data: UpdateAiAssistantDto,
  ): Promise<AiAssistantRecord> {
    await this.usageAudit.assertContext(workspaceId, userId);
    const assistant = await this.requireAssistant(workspaceId, code);

    if (assistant.status === AI_ASSISTANT_STATUS.ACTIVE) {
      throw new BadRequestException("Active AI assistants are immutable");
    }

    const update: UpdateAiAssistantData = {
      ...(data.name === undefined ? {} : { name: data.name }),
      ...(data.description === undefined
        ? {}
        : { description: data.description }),
      ...(data.instructions === undefined
        ? {}
        : { instructions: data.instructions }),
    };
    const result = await this.repository.updateConfigurable(
      workspaceId,
      assistant.id,
      update,
    );

    if (!result) {
      throw new BadRequestException("AI assistant can no longer be modified");
    }
    return result;
  }

  async activate(
    workspaceId: string,
    userId: string,
    code: string,
  ): Promise<AiAssistantRecord> {
    await this.usageAudit.assertContext(workspaceId, userId);
    const assistant = await this.requireAssistant(workspaceId, code);

    if (assistant.status === AI_ASSISTANT_STATUS.ACTIVE) {
      throw new BadRequestException("AI assistant is already active");
    }

    const result = await this.repository.transition(
      workspaceId,
      assistant.id,
      [AI_ASSISTANT_STATUS.DRAFT, AI_ASSISTANT_STATUS.INACTIVE],
      AI_ASSISTANT_STATUS.ACTIVE,
    );

    if (!result) {
      throw new BadRequestException("AI assistant cannot be activated");
    }
    return result;
  }

  async deactivate(
    workspaceId: string,
    userId: string,
    code: string,
  ): Promise<AiAssistantRecord> {
    await this.usageAudit.assertContext(workspaceId, userId);
    const assistant = await this.requireAssistant(workspaceId, code);

    if (assistant.status !== AI_ASSISTANT_STATUS.ACTIVE) {
      throw new BadRequestException("Only active AI assistants can be deactivated");
    }

    const result = await this.repository.transition(
      workspaceId,
      assistant.id,
      [AI_ASSISTANT_STATUS.ACTIVE],
      AI_ASSISTANT_STATUS.INACTIVE,
    );

    if (!result) {
      throw new BadRequestException("AI assistant cannot be deactivated");
    }
    return result;
  }

  async remove(
    workspaceId: string,
    userId: string,
    code: string,
  ): Promise<void> {
    await this.usageAudit.assertContext(workspaceId, userId);
    const assistant = await this.requireAssistant(workspaceId, code);

    if (!(await this.repository.deleteDraft(workspaceId, assistant.id))) {
      throw new BadRequestException("Only draft AI assistants can be deleted");
    }
  }

  async execute(
    workspaceId: string,
    userId: string,
    code: string,
    data: ExecuteAiAssistantDto,
  ): Promise<GenerateAiTextResponse> {
    await this.usageAudit.assertContext(workspaceId, userId);
    const assistant = await this.requireAssistant(workspaceId, code);

    if (assistant.status !== AI_ASSISTANT_STATUS.ACTIVE) {
      throw new BadRequestException("Only active AI assistants can be executed");
    }

    if (
      data.messages.some(
        (message) =>
          message.role !== AI_MESSAGE_ROLE.USER &&
          message.role !== AI_MESSAGE_ROLE.ASSISTANT,
      )
    ) {
      throw new BadRequestException(
        "AI assistant messages cannot override system instructions",
      );
    }

    return this.aiPlatform.generateText({
      workspaceId,
      actorId: userId,
      sourceModule: "AI_ASSISTANTS",
      useCase: `ASSISTANT:${assistant.code}`,
      messages: [
        { role: AI_MESSAGE_ROLE.SYSTEM, content: assistant.instructions },
        ...data.messages,
      ],
    });
  }

  private async requireAssistant(
    workspaceId: string,
    code: string,
  ): Promise<AiAssistantRecord> {
    const normalizedCode = this.normalizeCode(code);
    const assistant = await this.repository.findByCode(
      workspaceId,
      normalizedCode,
    );

    if (!assistant) {
      throw new NotFoundException(`AI assistant "${code}" not found`);
    }
    return assistant;
  }

  private normalizeCode(value: string): string {
    const code = value.trim().toUpperCase();

    if (!code) {
      throw new BadRequestException("AI assistant code is required");
    }
    return code;
  }
}
