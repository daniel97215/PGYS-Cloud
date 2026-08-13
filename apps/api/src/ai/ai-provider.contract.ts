import {
  AiFinishReason,
  AiMessageRole,
  AiProviderId,
} from "./ai.constants";

export interface AiMessage {
  role: AiMessageRole;
  content: string;
}

export interface GenerateAiTextRequest {
  workspaceId: string;
  actorId?: string;
  sourceModule: string;
  useCase: string;
  messages: AiMessage[];
}

export interface GenerateAiTextResponse {
  content: string;
  provider: AiProviderId;
  model: string;
  finishReason: AiFinishReason;
  usage: AiTokenUsage;
}

export interface AiTokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AiProviderTextRequest {
  messages: AiMessage[];
  model: string;
}

export interface AiProviderTextResponse {
  content: string;
  finishReason: AiFinishReason;
  usage: AiTokenUsage;
}

export interface AiProviderAdapter {
  readonly providerId: AiProviderId;

  generateText(request: AiProviderTextRequest): Promise<AiProviderTextResponse>;
}
