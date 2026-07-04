import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV !== "production";

// 'unsafe-inline' for scripts/styles is required by Next.js's inline bootstrap
// and styled-jsx without a nonce pipeline; 'unsafe-eval' is dev-only (HMR).
// connect-src allows https: because Firebase Auth talks to several
// *.googleapis.com endpoints; everything else is locked to self.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://apis.google.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https:",
  "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com https://*.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.join(__dirname),
  // Serve the Firebase auth handler from OUR domain so the Google sign-in
  // popup is same-origin — immune to Chrome's third-party-cookie blocking.
  // Requires NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN to be set to the site's own
  // domain (e.g. echoes-of-a-place.vercel.app) in production.
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://echoes-of-a-place.firebaseapp.com/__/auth/:path*",
      },
      {
        source: "/__/firebase/:path*",
        destination: "https://echoes-of-a-place.firebaseapp.com/__/firebase/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
