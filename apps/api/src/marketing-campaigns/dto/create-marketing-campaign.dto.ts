import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from "class-validator";
import { MARKETING_CHANNELS, MarketingChannel } from "../marketing-campaigns.types";

const text = ({ value }: { value: unknown }) => typeof value === "string" ? value.trim() : value;
const code = ({ value }: { value: unknown }) => typeof value === "string" ? value.trim().toUpperCase() : value;

export class CreateMarketingCampaignDto {
  @ApiProperty({ example: "WELCOME-2026", maxLength: 40 })
  @Transform(code) @IsString() @MinLength(1) @MaxLength(40) @Matches(/^[A-Z0-9][A-Z0-9._-]*$/)
  code!: string;
  @ApiProperty({ maxLength: 120 }) @Transform(text) @IsString() @MinLength(1) @MaxLength(120)
  name!: string;
  @ApiPropertyOptional({ maxLength: 500 }) @Transform(text) @IsOptional() @IsString() @MaxLength(500)
  description?: string;
  @ApiProperty({ enum: MARKETING_CHANNELS }) @IsIn(MARKETING_CHANNELS)
  channel!: MarketingChannel;
  @ApiProperty({ format: "uuid" }) @IsUUID("4")
  segmentId!: string;
  @ApiPropertyOptional({ format: "uuid" }) @IsOptional() @IsUUID("4")
  templateId?: string;
}
