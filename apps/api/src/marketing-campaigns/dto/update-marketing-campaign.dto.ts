import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

const text = ({ value }: { value: unknown }) => typeof value === "string" ? value.trim() : value;

export class UpdateMarketingCampaignDto {
  @ApiPropertyOptional({ maxLength: 120 }) @Transform(text) @IsOptional() @IsString() @MinLength(1) @MaxLength(120)
  name?: string;
  @ApiPropertyOptional({ maxLength: 500 }) @Transform(text) @IsOptional() @IsString() @MaxLength(500)
  description?: string;
  @ApiPropertyOptional({ format: "uuid" }) @IsOptional() @IsUUID("4")
  segmentId?: string;
  @ApiPropertyOptional({ format: "uuid" }) @IsOptional() @IsUUID("4")
  templateId?: string;
}
