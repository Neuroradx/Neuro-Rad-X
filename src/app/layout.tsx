import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "@/providers/providers";
import { LayoutClient } from "@/components/layout/layout-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "NeuroRadX | Master Neuroradiology",
    template: "%s | NeuroRadX",
  },
  description:
    "Expert-validated questions, AI-powered insights, and personalized progress tracking for neuroradiology. Study in English, German, or Spanish.",
  openGraph: {
    title: "NeuroRadX | Master Neuroradiology",
    description:
      "Expert-validated questions, AI-powered insights, and personalized progress tracking for neuroradiology.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <div className="background-container">
          <Providers>
            <LayoutClient>{children}</LayoutClient>
          </Providers>
        </div>
      </body>
    </html>
  );
}
