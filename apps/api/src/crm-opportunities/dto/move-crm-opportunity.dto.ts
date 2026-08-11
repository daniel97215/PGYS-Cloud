import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class MoveCrmOpportunityDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  stageId!: string;
}
