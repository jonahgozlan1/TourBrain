import type { Metadata } from "next";
import { Inter_Tight, Source_Sans_3 } from "next/font/google";
import { themeBootScript } from "@/lib/theme-boot";
import "./globals.css";

const display = Inter_Tight({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Tourbase",
  description:
    "Messy tour docs become a clean show list. For artists and tour managers.",
  openGraph: {
    title: "Tourbase",
    description: "Messy tour docs become a clean show list.",
    type: "website",
    siteName: "Tourbase",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tourbase",
    description: "Messy tour docs become a clean show list.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-body)]">
        {children}
      </body>
    </html>
  );
}
