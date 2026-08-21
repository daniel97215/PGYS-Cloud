import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PlatformOperatorRole, WorkspaceStatus } from "@prisma/client";

export class PlatformWorkspaceResponseDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ enum: WorkspaceStatus })
  status!: WorkspaceStatus;

  @ApiPropertyOptional({ nullable: true })
  billingEmail!: string | null;

  @ApiProperty()
  memberCount!: number;

  @ApiProperty()
  serviceCount!: number;

  @ApiProperty({ format: "date-time" })
  createdAt!: Date;

  @ApiProperty({ format: "date-time" })
  updatedAt!: Date;
}

export class PlatformWorkspacePageResponseDto {
  @ApiProperty({ type: [PlatformWorkspaceResponseDto] })
  items!: PlatformWorkspaceResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty({ enum: PlatformOperatorRole })
  accessRole!: PlatformOperatorRole;
}
