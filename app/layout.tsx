import type { Metadata } from "next";
import { Bodoni_Moda, Inter, JetBrains_Mono } from "next/font/google";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MotionProvider from "./components/MotionProvider";
import "lenis/dist/lenis.css";
import "./globals.css";

const display = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://maisonmodelx.com"),
  title: {
    default: "Maison Model X — Fashion content, reimagined",
    template: "%s — Maison Model X",
  },
  description:
    "Maison Model X transforms garments, jewellery, sketches and fabric swatches into campaign-ready photography and cinematic film.",
  openGraph: {
    title: "Maison Model X — Where elegance transcends reality",
    description:
      "Fashion and jewellery campaigns produced with AI, from first idea to final film.",
    type: "website",
    images: [{ url: "/images/maison-hero.png", width: 1600, height: 900 }],
  },
  other: { "codex-preview": "development" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Maison Model X",
  url: "https://maisonmodelx.com",
  email: "maisonmodelx@gmail.com",
  description:
    "A fashion-content studio transforming garments, jewellery, sketches and swatches into campaign-ready photography and film.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} ${mono.variable}`}>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <MotionProvider>
          <Header />
          {children}
          <Footer />
        </MotionProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  );
}
