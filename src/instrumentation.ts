import { getEnv } from "@/lib/env";

/**
 * Runs once when the Next.js server starts. Validating here makes a
 * misconfigured deployment fail immediately at startup instead of on the
 * first request.
 */
export function register(): void {
  getEnv();
}
