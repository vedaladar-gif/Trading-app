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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        <div className="container">
          {children}
        </div>
        <SnapseWidget />
      </body>
    </html>
  );
}