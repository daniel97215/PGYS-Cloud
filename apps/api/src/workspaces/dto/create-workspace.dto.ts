import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateWorkspaceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "slug must contain lowercase letters, numbers and hyphens only",
  })
  slug!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  billingEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}
