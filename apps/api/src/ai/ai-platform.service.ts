import { BadRequestException, Injectable } from "@nestjs/common";
import {
  AiProviderTextResponse,
  GenerateAiTextRequest,
  GenerateAiTextResponse,
} from "./ai-provider.contract";
import { AiProviderConfigService } from "./ai-provider-config.service";
import { AiProviderRegistryService } from "./ai-provider-registry.service";
import { AiUsageAuditService } from "./ai-usage-audit.service";

@Injectable()
export class AiPlatformService {
  constructor(
    private readonly providerConfig: AiProviderConfigService,
    private readonly providerRegistry: AiProviderRegistryService,
    private readonly usageAudit: AiUsageAuditService,
  ) {}

  async generateText(
    request: GenerateAiTextRequest,
  ): Promise<GenerateAiTextResponse> {
    const workspaceId = request.workspaceId.trim();

    if (!workspaceId) {
      throw new BadRequestException("Workspace id is required");
    }

    if (request.messages.length === 0) {
      throw new BadRequestException("At least one AI message is required");
    }

    const sourceModule = this.normalizeLabel(
      request.sourceModule,
      "AI source module",
      80,
    );
    const useCase = this.normalizeLabel(request.useCase, "AI use case", 120);

    const messages = request.messages.map((message) => {
      const content = message.content.trim();

      if (!content) {
        throw new BadRequestException("AI message content is required");
      }

      return { role: message.role, content };
    });
    await this.usageAudit.assertContext(workspaceId, request.actorId);
    const configuration = this.providerConfig.getConfiguration();
    const adapter = this.providerRegistry.get(configuration.provider);
    const startedAt = Date.now();

    let response: AiProviderTextResponse;

    try {
      response = await adapter.generateText({
        messages,
        model: configuration.model,
      });
    } catch (error: unknown) {
      await this.usageAudit.recordFailure({
        workspaceId,
        actorId: request.actorId,
        sourceModule,
        useCase,
        provider: adapter.providerId,
        model: configuration.model,
        durationMs: Date.now() - startedAt,
        errorCode: "AI_PROVIDER_ERROR",
        errorMessage: "AI provider request failed",
      });
      throw error;
    }

    await this.usageAudit.recordSuccess({
      workspaceId,
      actorId: request.actorId,
      sourceModule,
      useCase,
      provider: adapter.providerId,
      model: configuration.model,
      durationMs: Date.now() - startedAt,
      ...response.usage,
    });

    return {
      ...response,
      provider: adapter.providerId,
      model: configuration.model,
    };
  }

  private normalizeLabel(value: string, label: string, maxLength: number): string {
    const normalized = value.trim();

    if (!normalized || normalized.length > maxLength) {
      throw new BadRequestException(`${label} is invalid`);
    }

    return normalized;
  }
}
