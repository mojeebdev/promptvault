import type { Metadata } from "next";
import { Geist, Geist_Mono, Teko, Ubuntu } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

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
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: "/logo.jpg",
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
    >
      <body className="min-h-full flex flex-col bg-[var(--void)] text-[var(--ink-primary)]">
        <Navbar />
        <main className="flex-1 pt-[var(--nav-height)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
