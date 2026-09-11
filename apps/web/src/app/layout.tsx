import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRINETRA | Hyper-Local Severe Weather Nowcasting Console",
  description:
    "AI-powered hyper-local severe convective weather nowcasting platform for thunderstorms, cloudbursts, and flash floods (2–6 hour actionable window).",
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
