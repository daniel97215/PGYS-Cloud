const DURATION_PATTERN = /^(\d+)(s|m|h|d)$/;

export function durationToSeconds(value: string): number {
  const match = DURATION_PATTERN.exec(value);

  if (!match) {
    throw new Error(`Invalid duration: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };

  return amount * multipliers[unit];
}

export function validateEnvironment(
  environment: Record<string, unknown>,
): Record<string, unknown> {
  const accessSecret = requireSecret(environment, "JWT_ACCESS_SECRET");
  const refreshSecret = requireSecret(environment, "JWT_REFRESH_SECRET");

  if (accessSecret === refreshSecret) {
    throw new Error("JWT access and refresh secrets must be different");
  }

  durationToSeconds(readString(environment, "JWT_ACCESS_EXPIRES_IN", "15m"));
  durationToSeconds(readString(environment, "JWT_REFRESH_EXPIRES_IN", "30d"));

  return environment;
}

function requireSecret(
  environment: Record<string, unknown>,
  name: string,
): string {
  const value = readString(environment, name);

  if (value.length < 32) {
    throw new Error(`${name} must contain at least 32 characters`);
  }

  return value;
}

function readString(
  environment: Record<string, unknown>,
  name: string,
  fallback?: string,
): string {
  const value = environment[name] ?? fallback;

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${name} is required`);
  }

  return value;
}
