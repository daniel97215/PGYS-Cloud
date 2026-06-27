import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UpdateWorkspaceSettingsDto } from "../dto/update-workspace-settings.dto";

describe("UpdateWorkspaceSettingsDto", () => {
  it("accepts a valid partial settings update", async () => {
    const dto = plainToInstance(UpdateWorkspaceSettingsDto, {
      general: {
        language: " EN ",
        timezone: "Europe/Paris",
        currency: " eur ",
      },
      security: {
        requireMfa: true,
        sessionTimeoutMinutes: 240,
      },
      preferences: {
        dateFormat: "dd/MM/yyyy",
        timeFormat: "HH:mm",
      },
    });
    const errors = await validateDto(dto);

    expect(errors).toHaveLength(0);
    expect(dto.general?.language).toBe("en");
    expect(dto.general?.currency).toBe("EUR");
  });

  it("rejects an invalid language", async () => {
    const errors = await validateDto(
      plainToInstance(UpdateWorkspaceSettingsDto, {
        general: { language: "fra" },
      }),
    );

    expect(propertiesWithErrors(errors)).toContain("general");
  });

  it("rejects an invalid timezone", async () => {
    const errors = await validateDto(
      plainToInstance(UpdateWorkspaceSettingsDto, {
        general: { timezone: "Paris" },
      }),
    );

    expect(propertiesWithErrors(errors)).toContain("general");
  });

  it("rejects an invalid currency", async () => {
    const errors = await validateDto(
      plainToInstance(UpdateWorkspaceSettingsDto, {
        general: { currency: "EURO" },
      }),
    );

    expect(propertiesWithErrors(errors)).toContain("general");
  });

  it("rejects an invalid session timeout", async () => {
    const errors = await validateDto(
      plainToInstance(UpdateWorkspaceSettingsDto, {
        security: { sessionTimeoutMinutes: 0 },
      }),
    );

    expect(propertiesWithErrors(errors)).toContain("security");
  });

  it("rejects an empty date format", async () => {
    const errors = await validateDto(
      plainToInstance(UpdateWorkspaceSettingsDto, {
        preferences: { dateFormat: " " },
      }),
    );

    expect(propertiesWithErrors(errors)).toContain("preferences");
  });
});

function validateDto(dto: UpdateWorkspaceSettingsDto) {
  return validate(dto, {
    forbidNonWhitelisted: true,
    whitelist: true,
  });
}

function propertiesWithErrors(errors: Awaited<ReturnType<typeof validateDto>>) {
  return errors.map((error) => error.property);
}
