import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class ReprovisionWorkspaceDto {
  @ApiProperty({ example: "10000000-0000-4000-8000-000000000001" })
  @IsUUID()
  subscriptionId!: string;
}
