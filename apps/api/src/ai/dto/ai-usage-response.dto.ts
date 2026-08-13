import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AiUsageStatus } from "@prisma/client";
import { AI_PROVIDER } from "../ai.constants";

export class AiUsageResponseDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ format: "uuid" })
  workspaceId!: string;

  @ApiPropertyOptional({ format: "uuid" })
  actorId!: string | null;

  @ApiProperty()
  sourceModule!: string;

  @ApiProperty()
  useCase!: string;

  @ApiProperty({ enum: AI_PROVIDER })
  provider!: string;

  @ApiProperty()
  model!: string;

  @ApiProperty({ enum: AiUsageStatus })
  status!: AiUsageStatus;

  @ApiProperty()
  durationMs!: number;

  @ApiPropertyOptional()
  inputTokens!: number | null;

  @ApiPropertyOptional()
  outputTokens!: number | null;

  @ApiPropertyOptional()
  totalTokens!: number | null;

  @ApiPropertyOptional()
  errorCode!: string | null;

  @ApiPropertyOptional()
  errorMessage!: string | null;

  @ApiProperty({ format: "date-time" })
  createdAt!: Date;
}

export class AiUsagePageResponseDto {
  @ApiProperty({ type: [AiUsageResponseDto] })
  items!: AiUsageResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;
}
