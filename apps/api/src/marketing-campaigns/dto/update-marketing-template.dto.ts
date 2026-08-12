import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

const text = ({ value }: { value: unknown }) => typeof value === "string" ? value.trim() : value;

export class UpdateMarketingTemplateDto {
  @ApiPropertyOptional({ maxLength: 120 }) @Transform(text) @IsOptional() @IsString() @MinLength(1) @MaxLength(120)
  name?: string;
  @ApiPropertyOptional({ maxLength: 200 }) @Transform(text) @IsOptional() @IsString() @MaxLength(200)
  subject?: string;
  @ApiPropertyOptional({ maxLength: 10000 }) @Transform(text) @IsOptional() @IsString() @MinLength(1) @MaxLength(10000)
  content?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  isActive?: boolean;
}
