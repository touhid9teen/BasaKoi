import { MetadataRoute } from "next";
import { getSql } from "@/lib/db";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://basakoi.vercel.app";

type SqlRow = Record<string, unknown>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT id, created_at
      FROM properties
      WHERE status = 'available'
      ORDER BY created_at DESC
      LIMIT 500
    `) as SqlRow[];

    for (const row of rows) {
      const property = row as { id: string; created_at: string };
      entries.push({
        url: `${BASE_URL}/properties/${property.id}`,
        lastModified: new Date(property.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      });
    }
  } catch {
    // DB may not be available at build time; sitemap will just have the homepage
  }

  return entries;
}
