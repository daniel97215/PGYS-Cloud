import { ApiProperty } from "@nestjs/swagger";
import { Type, Transform } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";
import { AI_MESSAGE_ROLE, AiMessageRole } from "../ai.constants";

const AI_ASSISTANT_INPUT_ROLES = [
  AI_MESSAGE_ROLE.USER,
  AI_MESSAGE_ROLE.ASSISTANT,
] as const;

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class ExecuteAiAssistantMessageDto {
  @ApiProperty({ enum: AI_ASSISTANT_INPUT_ROLES })
  @IsIn(AI_ASSISTANT_INPUT_ROLES)
  role!: AiMessageRole;

  @ApiProperty({ maxLength: 20000 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(20000)
  content!: string;
}

export class ExecuteAiAssistantDto {
  @ApiProperty({ type: [ExecuteAiAssistantMessageDto], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExecuteAiAssistantMessageDto)
  messages!: ExecuteAiAssistantMessageDto[];
}
