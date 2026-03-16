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
      <body>
        <Navbar />
        <div className="container">
          {children}
        </div>
        <footer className="footer">Vestera © 2026 | Professional Paper Trading Platform</footer>
        <SnapseWidget />
      </body>
    </html>
  );
}
