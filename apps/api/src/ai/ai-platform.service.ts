import { BadRequestException, Injectable } from "@nestjs/common";
import {
  GenerateAiTextRequest,
  GenerateAiTextResponse,
} from "./ai-provider.contract";
import { AiProviderConfigService } from "./ai-provider-config.service";
import { AiProviderRegistryService } from "./ai-provider-registry.service";

@Injectable()
export class AiPlatformService {
  constructor(
    private readonly providerConfig: AiProviderConfigService,
    private readonly providerRegistry: AiProviderRegistryService,
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

    const messages = request.messages.map((message) => {
      const content = message.content.trim();

      if (!content) {
        throw new BadRequestException("AI message content is required");
      }

      return { role: message.role, content };
    });
    const configuration = this.providerConfig.getConfiguration();
    const adapter = this.providerRegistry.get(configuration.provider);
    const response = await adapter.generateText({
      messages,
      model: configuration.model,
    });

    return {
      ...response,
      provider: adapter.providerId,
      model: configuration.model,
    };
  }
}
