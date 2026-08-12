import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { MARKETING_CHANNELS, MarketingChannel } from "../marketing-campaigns.types";

const text = ({ value }: { value: unknown }) => typeof value === "string" ? value.trim() : value;
const code = ({ value }: { value: unknown }) => typeof value === "string" ? value.trim().toUpperCase() : value;

export class CreateMarketingTemplateDto {
  @ApiProperty({ example: "WELCOME-EMAIL", maxLength: 40 })
  @Transform(code) @IsString() @MinLength(1) @MaxLength(40) @Matches(/^[A-Z0-9][A-Z0-9._-]*$/)
  code!: string;

  @ApiProperty({ example: "Welcome email", maxLength: 120 })
  @Transform(text) @IsString() @MinLength(1) @MaxLength(120)
  name!: string;

  @ApiProperty({ enum: MARKETING_CHANNELS }) @IsIn(MARKETING_CHANNELS)
  channel!: MarketingChannel;

  @ApiPropertyOptional({ maxLength: 200 }) @Transform(text) @IsOptional() @IsString() @MaxLength(200)
  subject?: string;

  @ApiProperty({ maxLength: 10000 }) @Transform(text) @IsString() @MinLength(1) @MaxLength(10000)
  content!: string;

  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean()
  isActive?: boolean;
}
