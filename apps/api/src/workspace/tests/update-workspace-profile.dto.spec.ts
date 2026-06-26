import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UpdateWorkspaceProfileDto } from "../dto/update-workspace-profile.dto";

describe("UpdateWorkspaceProfileDto", () => {
  it("accepts a valid workspace profile update", async () => {
    const errors = await validateDto({
      displayName: "Garage Martin",
      siren: "123456789",
      siret: "12345678900012",
      website: "https://garage-martin.fr",
      language: "fr",
      timezone: "Europe/Paris",
      currency: "EUR",
    });

    expect(errors).toHaveLength(0);
  });

  it("rejects an invalid SIREN", async () => {
    const errors = await validateDto({ siren: "12345678A" });

    expect(propertiesWithErrors(errors)).toContain("siren");
  });

  it("rejects an invalid SIRET", async () => {
    const errors = await validateDto({ siret: "1234567890001" });

    expect(propertiesWithErrors(errors)).toContain("siret");
  });

  it("rejects an invalid website URL", async () => {
    const errors = await validateDto({ website: "garage-martin.fr" });

    expect(propertiesWithErrors(errors)).toContain("website");
  });
});

function validateDto(payload: object) {
  const dto = plainToInstance(UpdateWorkspaceProfileDto, payload);
  return validate(dto, {
    forbidNonWhitelisted: true,
    whitelist: true,
  });
}

function propertiesWithErrors(errors: Awaited<ReturnType<typeof validateDto>>) {
  return errors.map((error) => error.property);
}
