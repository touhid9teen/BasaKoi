import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getSql } from "@/lib/db";

type SqlRow = Record<string, unknown>;

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://basakoi.vercel.app";

interface Props {
  params: Promise<{ id: string }>;
}

function formatRent(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`;
}

function tenantTypeLabel(type: string | null): string {
  switch (type) {
    case "family":
      return "Family";
    case "bachelor_male":
      return "Bachelor Male";
    case "bachelor_female":
      return "Bachelor Female";
    case "any":
      return "Anyone";
    default:
      return "N/A";
  }
}

function gasTypeLabel(type: string | null): string {
  switch (type) {
    case "natural":
      return "Natural Gas";
    case "cylinder":
      return "LPG Cylinder";
    case "none":
      return "No Gas";
    default:
      return "N/A";
  }
}

async function getProperty(id: string) {
  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT
        id, title, accommodation_type, rent_amount, service_charge,
        service_charge_included, available_from, tenant_type,
        lat, lng, address, bachelor_allowed, gas_type,
        lift_available, bedrooms, bathroom, description,
        phone, special_instructions, status, user_id, created_at
      FROM properties
      WHERE id = ${id}
    `) as SqlRow[];

    const row = rows[0];
    if (!row) return null;

    const property = row as {
      id: string;
      title: string;
      accommodation_type: string | null;
      rent_amount: number;
      service_charge: number | null;
      service_charge_included: boolean | null;
      available_from: string | null;
      tenant_type: string | null;
      lat: number;
      lng: number;
      address: string | null;
      bachelor_allowed: boolean | null;
      gas_type: string | null;
      lift_available: boolean | null;
      bedrooms: number | null;
      bathroom: number | null;
      description: string | null;
      phone: string | null;
      special_instructions: string | null;
      status: string;
      user_id: string | null;
      created_at: string;
    };

    return property;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    return {
      title: "Property Not Found — BasaKoi",
    };
  }

  const title = `${property.title} — ৳${property.rent_amount.toLocaleString("en-BD")}/mo`;
  const description =
    property.description?.slice(0, 160) ||
    `${property.bedrooms ? property.bedrooms + " Bed" : ""} ${property.bathroom ? property.bathroom + " Bath" : ""} rental in ${property.address || "Bangladesh"}. ${tenantTypeLabel(property.tenant_type)}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "bn_BD",
      siteName: "BasaKoi",
      url: `${BASE_URL}/properties/${property.id}`,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: property.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `${BASE_URL}/properties/${property.id}`,
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: property.title,
    description:
      property.description ||
      `Rental property in ${property.address || "Bangladesh"}`,
    url: `${BASE_URL}/properties/${property.id}`,
    image: "https://basakoi.vercel.app/og-image.png",
    offers: {
      "@type": "Offer",
      price: property.rent_amount,
      priceCurrency: "BDT",
      availability:
        property.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
      areaServed: {
        "@type": "City",
        name: property.address?.split(",").slice(-2, -1)[0]?.trim() || "Dhaka",
        address: {
          "@type": "PostalAddress",
          addressLocality: property.address?.split(",").slice(-2, -1)[0]?.trim() || "Dhaka",
          addressCountry: "Bangladesh",
        },
      },
    },
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Map
          </Link>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm font-medium text-gray-900">BasaKoi</span>
        </div>
      </nav>

      {/* Property Detail */}
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-8 sm:px-10 sm:py-12">
            <div className="mb-2 flex items-center gap-2">
              {property.status === "rented_out" && (
                <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-100 ring-1 ring-red-400/30">
                  Rented
                </span>
              )}
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-50">
                {tenantTypeLabel(property.tenant_type)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {property.title}
            </h1>
            <p className="mt-1 text-emerald-100/80 text-sm">
              {property.address || `${property.lat.toFixed(4)}, ${property.lng.toFixed(4)}`}
            </p>
            <p className="mt-4 text-4xl font-black text-white sm:text-5xl">
              {formatRent(property.rent_amount)}
              <span className="text-lg font-normal text-emerald-100/70">/mo</span>
            </p>
            {property.service_charge != null && property.service_charge > 0 && (
              <p className="mt-1 text-sm text-emerald-100/60">
                + ৳{property.service_charge.toLocaleString("en-BD")} service charge extra
              </p>
            )}
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-4">
            {property.bedrooms != null && (
              <div className="bg-white px-4 py-4 text-center sm:px-6 sm:py-5">
                <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
                <p className="text-xs font-medium text-gray-500">Bedrooms</p>
              </div>
            )}
            {property.bathroom != null && (
              <div className="bg-white px-4 py-4 text-center sm:px-6 sm:py-5">
                <p className="text-2xl font-bold text-gray-900">{property.bathroom}</p>
                <p className="text-xs font-medium text-gray-500">Bathrooms</p>
              </div>
            )}
            {property.gas_type && property.gas_type !== "none" && (
              <div className="bg-white px-4 py-4 text-center sm:px-6 sm:py-5">
                <p className="text-sm font-bold text-gray-900">
                  {gasTypeLabel(property.gas_type)}
                </p>
                <p className="text-xs font-medium text-gray-500">Gas System</p>
              </div>
            )}
            {property.lift_available != null && (
              <div className="bg-white px-4 py-4 text-center sm:px-6 sm:py-5">
                <p className="text-sm font-bold text-gray-900">
                  {property.lift_available ? "✓ Yes" : "✗ No"}
                </p>
                <p className="text-xs font-medium text-gray-500">Lift</p>
              </div>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <div className="border-t border-gray-100 px-6 py-5 sm:px-10">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
                Description
              </h2>
              <p className="text-base leading-relaxed text-gray-700 whitespace-pre-line">
                {property.description}
              </p>
            </div>
          )}

          {/* Special Instructions */}
          {property.special_instructions && (
            <div className="border-t border-gray-100 px-6 py-5 sm:px-10">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
                Rules & Instructions
              </h2>
              <p className="text-base leading-relaxed text-gray-700 whitespace-pre-line">
                {property.special_instructions}
              </p>
            </div>
          )}

          {/* Contact & Meta */}
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 sm:px-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {property.phone && (
                <div>
                  <p className="text-xs font-medium text-gray-500">Contact</p>
                  <a
                    href={`tel:${property.phone}`}
                    className="text-lg font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    {property.phone}
                  </a>
                </div>
              )}
              <div className="flex gap-3">
                {property.phone && (
                  <a
                    href={`tel:${property.phone}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-500 active:scale-[0.97]"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                      />
                    </svg>
                    Call Owner
                  </a>
                )}
                <a
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-200 px-5 py-3 text-sm font-bold text-emerald-700 transition-all hover:bg-emerald-50 active:scale-[0.97]"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                    />
                  </svg>
                  View on Map
                </a>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Listed {new Date(property.created_at).toLocaleDateString("en-BD", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
