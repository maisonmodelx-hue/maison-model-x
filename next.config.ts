import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Pages are prerendered, so there is no per-request nonce and Next's inline
// bootstrap scripts need 'unsafe-inline'. Nonces would make every page dynamic.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:", // blob: previews a visitor's own uploads in the project form
  "font-src 'self'",
  "media-src 'self'",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "frame-src blob:", // PDF preview in the project form
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Photos are pre-optimized by `npm run images`, so the runtime optimizer isn't needed.
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
