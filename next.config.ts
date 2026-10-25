import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Baseline Content Security Policy.
 * 'unsafe-inline' for scripts is required by Next.js inline bootstrap scripts
 * unless a nonce-based CSP is adopted (documented as a residual risk and
 * deferred — see docs/security/security-baseline.md). 'unsafe-eval' is
 * added in development only, where React's dev tooling needs it.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // No remote images are used; keep the image optimizer closed to remote hosts
  // and disallow SVG processing.
  images: { remotePatterns: [], dangerouslyAllowSVG: false },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
