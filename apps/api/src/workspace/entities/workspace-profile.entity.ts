import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class WorkspaceProfileEntity {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ example: "Garage Martin" })
  displayName!: string;

  @ApiPropertyOptional({ nullable: true })
  legalName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  siren!: string | null;

  @ApiPropertyOptional({ nullable: true })
  siret!: string | null;

  @ApiPropertyOptional({ nullable: true })
  vatNumber!: string | null;

  @ApiPropertyOptional({ nullable: true })
  addressLine1!: string | null;

  @ApiPropertyOptional({ nullable: true })
  addressLine2!: string | null;

  @ApiPropertyOptional({ nullable: true })
  postalCode!: string | null;

  @ApiPropertyOptional({ nullable: true })
  city!: string | null;

  @ApiPropertyOptional({ nullable: true })
  country!: string | null;

  @ApiPropertyOptional({ nullable: true })
  phone!: string | null;

  @ApiPropertyOptional({ nullable: true })
  website!: string | null;

  @ApiPropertyOptional({ nullable: true })
  logoUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  language!: string | null;

  @ApiProperty()
  timezone!: string;

  @ApiPropertyOptional({ nullable: true })
  currency!: string | null;

  @ApiPropertyOptional({ nullable: true })
  activity!: string | null;

  @ApiPropertyOptional({ nullable: true })
  companySize!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
