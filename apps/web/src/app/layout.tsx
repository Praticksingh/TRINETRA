import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "TRINETRA | Hyper-Local Severe Weather Nowcasting Console",
  description:
    "AI-powered hyper-local severe convective weather nowcasting platform for thunderstorms, cloudbursts, and flash floods (2–6 hour actionable window).",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-cyan-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
