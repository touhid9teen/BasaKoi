import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Basa Koi — Find & List Rentals in Bangladesh",
  description:
    "Map-based rental and sublet finder for Bangladesh. Find apartments, sublets, and rental properties near you.",
  keywords: [
    "Bangladesh rental",
    "Dhaka apartment",
    "sublet Bangladesh",
    "basa koi",
    "rent finder",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full min-h-full bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
