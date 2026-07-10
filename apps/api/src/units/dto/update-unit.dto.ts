import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class UpdateUnitDto {
  @ApiPropertyOptional({ example: "Piece", maxLength: 120 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: "pc", maxLength: 20 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  symbol?: string;

  @ApiPropertyOptional({ example: "Single item unit", maxLength: 500 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
