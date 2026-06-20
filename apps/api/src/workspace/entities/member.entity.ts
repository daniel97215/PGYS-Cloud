import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MemberRole, MemberStatus, UserStatus } from "@prisma/client";

class MemberUserEntity {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;
}

export class MemberEntity {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ enum: MemberRole })
  role!: MemberRole;

  @ApiProperty({ enum: MemberStatus })
  status!: MemberStatus;

  @ApiProperty({ type: MemberUserEntity })
  user!: MemberUserEntity;

  @ApiProperty()
  invitedAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  joinedAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  revokedAt!: Date | null;
}
