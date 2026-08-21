import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AuditAction, PlatformOperatorRole } from "@prisma/client";

class PlatformAuditWorkspaceDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty()
  slug!: string;
}

class PlatformAuditActorDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty()
  displayName!: string;

  @ApiProperty({ format: "email" })
  email!: string;
}

export class PlatformAuditResponseDto {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ enum: AuditAction })
  action!: AuditAction;

  @ApiProperty({ type: PlatformAuditWorkspaceDto })
  workspace!: PlatformAuditWorkspaceDto;

  @ApiPropertyOptional({ type: PlatformAuditActorDto, nullable: true })
  actor!: PlatformAuditActorDto | null;

  @ApiProperty()
  targetType!: string;

  @ApiPropertyOptional({ nullable: true })
  targetId!: string | null;

  @ApiProperty()
  metadataAvailable!: boolean;

  @ApiProperty({ format: "date-time" })
  createdAt!: Date;
}

export class PlatformAuditPageResponseDto {
  @ApiProperty({ type: [PlatformAuditResponseDto] })
  items!: PlatformAuditResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty({ enum: PlatformOperatorRole })
  accessRole!: PlatformOperatorRole;
}
