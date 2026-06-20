import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { WorkspaceStatus } from "@prisma/client";

export class WorkspaceEntity {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ example: "garage-martin" })
  slug!: string;

  @ApiProperty({ enum: WorkspaceStatus })
  status!: WorkspaceStatus;

  @ApiPropertyOptional({ nullable: true })
  billingEmail!: string | null;

  @ApiPropertyOptional({ nullable: true })
  phone!: string | null;

  @ApiProperty()
  locale!: string;

  @ApiProperty()
  timezone!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  closedAt!: Date | null;
}
