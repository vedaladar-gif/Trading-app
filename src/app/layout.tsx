import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SnapseWidget from "@/components/SnapseWidget";

export const metadata: Metadata = {
  title: "Vestera - Professional Paper Trading",
  description: "Experience professional-grade paper trading with real market data, advanced charting tools, and AI-powered insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet" />
      </head>
      <body>
  <Navbar />
  {children}
  <SnapseWidget />
</body>
    </html>
  );
}