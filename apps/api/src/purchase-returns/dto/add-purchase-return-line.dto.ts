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

export class AddPurchaseReturnLineDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  purchaseReceiptLineId!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  inventoryItemId!: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 4 })
  @IsPositive()
  quantity!: number;

  @ApiPropertyOptional({ maxLength: 500 })
  @Transform(normalizeText)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
