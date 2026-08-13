export const AI_PROVIDER = {
  OPENAI: "OPENAI",
  MISTRAL: "MISTRAL",
} as const;

export type AiProviderId = (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER];

export const AI_MESSAGE_ROLE = {
  SYSTEM: "SYSTEM",
  USER: "USER",
  ASSISTANT: "ASSISTANT",
} as const;

export type AiMessageRole =
  (typeof AI_MESSAGE_ROLE)[keyof typeof AI_MESSAGE_ROLE];

export const AI_FINISH_REASON = {
  STOP: "STOP",
  LENGTH: "LENGTH",
  CONTENT_FILTER: "CONTENT_FILTER",
  UNKNOWN: "UNKNOWN",
} as const;

export type AiFinishReason =
  (typeof AI_FINISH_REASON)[keyof typeof AI_FINISH_REASON];

export const AI_PROVIDER_ADAPTERS = Symbol("AI_PROVIDER_ADAPTERS");
