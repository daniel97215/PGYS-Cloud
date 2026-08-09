import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsPositive, IsUUID } from "class-validator";

export class AddPurchaseReceiptLineDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  purchaseOrderLineId!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  inventoryItemId!: string;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 4 })
  @IsPositive()
  quantity!: number;
}
