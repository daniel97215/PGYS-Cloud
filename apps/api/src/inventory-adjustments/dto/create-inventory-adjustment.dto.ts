import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsNumber,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

const normalizeText = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class CreateInventoryAdjustmentDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  workspaceId!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  inventoryItemId!: string;

  @ApiProperty({ example: 12.5, minimum: 0 })
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 4 })
  @Min(0)
  countedQuantity!: number;

  @ApiProperty({ example: "Physical count correction", maxLength: 500 })
  @Transform(normalizeText)
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  reason!: string;
}
