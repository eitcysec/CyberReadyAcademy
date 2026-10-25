import { z } from "zod";

/**
 * Server-side environment schema.
 *
 * Only variables the application actually reads belong here. Values are
 * validated at startup (see src/instrumentation.ts) and again on first use.
 * Error messages name the variable and the problem but NEVER echo values,
 * so a misconfigured secret cannot leak into logs.
 */
const envSchema = z.object({
  SITE_URL: z
    .url({ protocol: /^https?$/, message: "must be an absolute http(s) URL" })
    .transform((value) => value.replace(/\/+$/, "")),
});

export type Env = z.infer<typeof envSchema>;

export class EnvValidationError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(
      `Invalid or missing environment configuration:\n${issues
        .map((issue) => `  - ${issue}`)
        .join("\n")}\nSee .env.example and docs/development-setup.md.`,
    );
    this.name = "EnvValidationError";
    this.issues = issues;
  }
}

/** Parse an environment-like object. Pure: safe to unit test. */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (result.success) return result.data;

  const issues = result.error.issues.map((issue) => {
    const key = issue.path.join(".") || "(root)";
    const value = source[key];
    const problem = value === undefined || value === "" ? "is required but not set" : issue.message;
    return `${key} ${problem}`;
  });
  throw new EnvValidationError(issues);
}

let cached: Env | undefined;

/** Validated environment for server code. Throws EnvValidationError if invalid. */
export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
