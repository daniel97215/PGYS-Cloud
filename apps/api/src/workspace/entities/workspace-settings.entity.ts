import { ApiProperty } from "@nestjs/swagger";

export class WorkspaceGeneralSettingsEntity {
  @ApiProperty({ example: "fr" })
  language!: string;

  @ApiProperty({ example: "Europe/Paris" })
  timezone!: string;

  @ApiProperty({ example: "EUR" })
  currency!: string;
}

export class WorkspaceSecuritySettingsEntity {
  @ApiProperty({ example: false })
  requireMfa!: boolean;

  @ApiProperty({ example: 480 })
  sessionTimeoutMinutes!: number;
}

export class WorkspacePreferencesSettingsEntity {
  @ApiProperty({ example: "dd/MM/yyyy" })
  dateFormat!: string;

  @ApiProperty({ example: "HH:mm" })
  timeFormat!: string;
}

export class WorkspaceSettingsEntity {
  @ApiProperty({ format: "uuid" })
  id!: string;

  @ApiProperty({ format: "uuid" })
  workspaceId!: string;

  @ApiProperty({ type: WorkspaceGeneralSettingsEntity })
  general!: WorkspaceGeneralSettingsEntity;

  @ApiProperty({ type: WorkspaceSecuritySettingsEntity })
  security!: WorkspaceSecuritySettingsEntity;

  @ApiProperty({ type: WorkspacePreferencesSettingsEntity })
  preferences!: WorkspacePreferencesSettingsEntity;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
