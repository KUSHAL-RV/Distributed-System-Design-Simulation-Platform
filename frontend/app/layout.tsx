import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LiveSysDesign — Real-Time Distributed System Simulator",
  description:
    "Design, simulate and stress-test distributed systems in real time. Drag-drop architecture builder with live traffic simulation, failure injection, and AI-powered optimization.",
  keywords: [
    "distributed systems",
    "system design",
    "simulation",
    "architecture",
    "load testing",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-950 text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
