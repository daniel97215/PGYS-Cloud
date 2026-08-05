import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class CreateStockTransferDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  workspaceId!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  sourceInventoryItemId!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  destinationInventoryItemId!: string;

  @ApiProperty({ example: 5.5 })
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 4 })
  @IsPositive()
  quantity!: number;

  @ApiPropertyOptional({ example: "Replenish picking location", maxLength: 500 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
