import type { Metadata } from "next";
import { Geist, Geist_Mono, Teko, Ubuntu } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Exact fonts from design system
const tekko = Teko({
  variable: "--font-teko",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const siteUrl = 'https://promptvault.mojeeb.xyz';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PromptVault — Decentralized AI Prompt Registry on Sui",
    template: "%s | PromptVault",
  },
  description: "Store, discover, and fork AI prompts as Walrus blobs — immutable, citable, and owned by no one but the chain. Built on Sui with Tatum RPC.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: { url: "/favicon.ico" },
    apple: { url: "/logo.jpg" },
  },
  openGraph: {
    title: "PromptVault — Your Prompts. Stored Forever.",
    description: "The first decentralized AI prompt registry built on Sui. Store, discover, and fork AI prompts as immutable Walrus blobs.",
    url: siteUrl,
    siteName: "PromptVault",
    images: [
      {
        url: "/og-image.jpg",
        width: 1408,
        height: 768,
        alt: "PromptVault — Decentralized AI Prompt Registry on Sui",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptVault — Your Prompts. Stored Forever.",
    description: "Store, discover, and fork AI prompts as Walrus blobs on Sui. Immutable. On-chain.",
    images: ["/og-image.jpg"],
    creator: "@PVonSui",
  },
  authors: [{ name: "Mojeeb Titilayo", url: "https://mojeeb.xyz" }],
  keywords: ["Sui", "Walrus", "AI", "Prompts", "Blockchain", "Decentralized", "Tatum", "Prompt Engineering"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${tekko.variable} ${ubuntu.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col text-[var(--ink-primary)]" style={{ background: 'transparent' }}>
        {/* Fixed full-screen video background (behind everything) */}
        <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden' }}>
          {/* Desktop video ( > 768px ) */}
          <video
            className="hero-video-desktop"
            autoPlay
            muted
            loop
            playsInline
            src="/videos/hero-bg-video-desktop.mp4"
            style={{ width: '100vw', height: '100vh', objectFit: 'cover', opacity: 0.8 }}
          />
          {/* Mobile video ( <= 768px ) */}
          <video
            className="hero-video-mobile"
            autoPlay
            muted
            loop
            playsInline
            src="/videos/hero-bg-video-mobile.mp4"
            style={{ width: '100vw', height: '100vh', objectFit: 'cover', opacity: 0.8 }}
          />
        </div>

        {/* Fixed dark overlay gradient above video */}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: `linear-gradient(
              to bottom,
              rgba(10,10,11,0.3) 0%,
              rgba(10,10,11,0.1) 40%,
              rgba(10,10,11,0.3) 100%
            )`,
          }}
        />

        {/* Content above overlay at z >= 1 */}
        <div style={{ position: 'relative', zIndex: 1, background: 'transparent' }}>
          <Providers>
            <Navbar />
            <main className="flex-1 pt-[var(--nav-height)]" style={{ background: 'transparent' }}>{children}</main>
            <Footer />
          </Providers>
        </div>

        <Analytics />
      </body>
    </html>
  );
}
