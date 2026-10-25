import { describe, expect, it } from "vitest";
import { EnvValidationError, parseEnv } from "./env";

describe("parseEnv", () => {
  it("accepts a valid configuration and normalises the trailing slash", () => {
    expect(parseEnv({ SITE_URL: "https://example.org/" })).toEqual({
      SITE_URL: "https://example.org",
    });
  });

  it("fails with a clear message when a required variable is missing", () => {
    expect(() => parseEnv({})).toThrow(EnvValidationError);
    expect(() => parseEnv({})).toThrow(/SITE_URL is required but not set/);
  });

  it("treats an empty value as missing", () => {
    expect(() => parseEnv({ SITE_URL: "" })).toThrow(/SITE_URL is required but not set/);
  });

  it.each(["javascript:alert(1)", "ftp://example.org", "example.org"])(
    "rejects a non-http(s) or relative URL: %s",
    (value) => {
      expect(() => parseEnv({ SITE_URL: value })).toThrow(/SITE_URL must be an absolute/);
    },
  );

  it("never echoes the offending value in the error message", () => {
    const leakyValue = "not-a-url-SECRET-TOKEN-1234";
    try {
      parseEnv({ SITE_URL: leakyValue });
      expect.unreachable("parseEnv should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      const { message, issues } = error as EnvValidationError;
      expect(message).not.toContain("SECRET-TOKEN-1234");
      expect(issues.join(" ")).not.toContain("SECRET-TOKEN-1234");
    }
  });

  it("ignores unrelated environment variables rather than exposing them", () => {
    const env = parseEnv({ SITE_URL: "http://localhost:3000", UNRELATED_SECRET: "x" });
    expect(Object.keys(env)).toEqual(["SITE_URL"]);
  });
});
