import type { NextConfig } from "next";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const CSP = [
  "default-src 'self'",
  // Next.js needs inline scripts; Supabase auth UI is purely first-party.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // Tailwind injects inline styles via the runtime; Google Fonts CSS.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob:",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Where the app talks: own origin, Supabase REST/auth/realtime, backend API, IP geolocation.
  `connect-src 'self' ${SUPABASE_URL} wss://${SUPABASE_URL.replace(/^https?:\/\//, "")} ${API_URL} https://ipapi.co https://*.ingest.sentry.io https://*.ingest.us.sentry.io`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].filter(Boolean).join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
