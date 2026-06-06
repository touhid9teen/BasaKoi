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

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://basakoi.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "BasaKoi — Find & List Rentals in Bangladesh",
    template: "%s | BasaKoi",
  },
  description:
    "Map-based rental and sublet finder for Bangladesh. Find apartments, sublets, and rental properties in Dhaka, Chattogram, Sylhet and across Bangladesh. Browse by area, budget, and tenant type.",
  keywords: [
    "Bangladesh rental",
    "Dhaka apartment rent",
    "sublet Bangladesh",
    "basa koi",
    "bachelor rental Dhaka",
    "family apartment Dhaka",
    "flat rent Bangladesh",
    "Gulshan apartment",
    "Banana rental",
    "Mirpur flat",
    "Dhanmondi rent",
    "Uttara apartment",
    "property listing Bangladesh",
    "rental finder",
  ],
  authors: [{ name: "BasaKoi" }],
  creator: "BasaKoi",
  publisher: "BasaKoi",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    siteName: "BasaKoi",
    title: "BasaKoi — Find & List Rentals in Bangladesh",
    description:
      "Map-based rental and sublet finder for Bangladesh. Find apartments, sublets, and rental properties near you.",
    url: BASE_URL,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BasaKoi — Bangladesh Property Rentals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BasaKoi — Find & List Rentals in Bangladesh",
    description:
      "Map-based rental and sublet finder for Bangladesh. Find apartments and rental properties near you.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: "real estate",
  classification: "Real Estate Rental Platform",
  verification: {
    // Add Google Search Console verification code here when available
    // google: "YOUR_VERIFICATION_CODE",
  },
  icons: {
    icon: { url: "/icon.svg", type: "image/svg+xml" },
    apple: { url: "/icon.svg" },
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "BasaKoi",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "BasaKoi",
  url: BASE_URL,
  description:
    "Map-based rental and sublet finder for Bangladesh. Find apartments, sublets, and rental properties.",
  applicationCategory: "RealEstate",
  operatingSystem: "All",
  browserRequirements: "Requires JavaScript",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "BDT",
  },
  author: {
    "@type": "Organization",
    name: "BasaKoi",
    url: BASE_URL,
  },
  areaServed: {
    "@type": "Country",
    name: "Bangladesh",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="h-full min-h-full bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
