import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";

type SqlRow = Record<string, unknown>;

/**
 * POST /api/admin/properties/media
 * Body (JSON): { property_id: string, media_type: "image"|"video", data: "base64string...", filename?: string, caption?: string }
 * Or multipart/form-data: property_id, media_type, caption, file (image/video)
 *
 * Stores media and returns the stored URL.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let property_id: string;
    let media_type: string;
    let media_url: string;
    let caption: string | null = null;
    let thumbnail_url: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      // File upload via multipart
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      property_id = formData.get("property_id") as string;
      media_type = formData.get("media_type") as string;
      caption = (formData.get("caption") as string) || null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      if (!property_id || !media_type) {
        return NextResponse.json({ error: "property_id and media_type are required" }, { status: 400 });
      }
      if (!["image", "video"].includes(media_type)) {
        return NextResponse.json({ error: "media_type must be 'image' or 'video'" }, { status: 400 });
      }

      // Validate file size (max 10MB for images, 50MB for videos)
      const maxSize = media_type === "image" ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File too large. Max ${media_type === "image" ? "10MB" : "50MB"}.` },
          { status: 400 }
        );
      }

      // Validate image mime types
      const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
      const allowed = media_type === "image" ? allowedImageTypes : allowedVideoTypes;
      if (!allowed.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type. Allowed: ${allowed.join(", ")}` },
          { status: 400 }
        );
      }

      // Convert file to base64 data URL
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      media_url = `data:${file.type};base64,${base64}`;

      // For images, use the same as thumbnail
      if (media_type === "image") {
        thumbnail_url = media_url;
      }
    } else {
      // JSON body with base64 data
      const body = await request.json() as {
        property_id: string;
        media_type: "image" | "video";
        data: string;
        filename?: string;
        caption?: string;
      };

      property_id = body.property_id;
      media_type = body.media_type;
      caption = body.caption || null;

      if (!property_id || !media_type || !body.data) {
        return NextResponse.json(
          { error: "property_id, media_type, and data are required" },
          { status: 400 }
        );
      }
      if (!["image", "video"].includes(media_type)) {
        return NextResponse.json({ error: "media_type must be 'image' or 'video'" }, { status: 400 });
      }

      // Validate that data looks like base64 or data URL
      if (body.data.startsWith("data:")) {
        media_url = body.data;
      } else if (body.data.startsWith("http")) {
        media_url = body.data;
      } else {
        // Assume raw base64 — store as data URL based on type
        const mime = media_type === "image" ? "image/png" : "video/mp4";
        media_url = `data:${mime};base64,${body.data}`;
      }

      if (media_type === "image") {
        thumbnail_url = media_url;
      }
    }

    const sql = getSql();

    // Verify property exists
    const propertyExists = (await sql`
      SELECT id FROM properties WHERE id = ${property_id}
    `) as SqlRow[];

    if (!propertyExists[0]) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Get current max sort_order for this property
    const maxOrder = (await sql`
      SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order
      FROM property_media WHERE property_id = ${property_id}
    `) as SqlRow[];
    const sortOrder = (maxOrder[0] as { next_order: number }).next_order;

    // Insert media record
    const inserted = (await sql`
      INSERT INTO property_media (property_id, media_type, media_url, thumbnail_url, caption, sort_order)
      VALUES (${property_id}, ${media_type}, ${media_url}, ${thumbnail_url}, ${caption}, ${sortOrder})
      RETURNING id, media_type, media_url, thumbnail_url, caption, sort_order, created_at
    `) as SqlRow[];

    const media = inserted[0];

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json(
      { error: "Failed to upload media. File may be too large or format unsupported." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/properties/media?property_id=xxx
 * Returns all media for a property.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("property_id");

    if (!propertyId) {
      return NextResponse.json({ error: "property_id is required" }, { status: 400 });
    }

    const sql = getSql();

    const rows = (await sql`
      SELECT id, property_id, media_type, media_url, thumbnail_url, caption, sort_order, created_at
      FROM property_media
      WHERE property_id = ${propertyId}
      ORDER BY sort_order ASC, created_at ASC
    `) as SqlRow[];

    return NextResponse.json({ media: rows });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/properties/media?id=xxx
 * Deletes a media record.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
    }

    const sql = getSql();

    const deleted = (await sql`
      DELETE FROM property_media WHERE id = ${id}
      RETURNING id
    `) as SqlRow[];

    if (!deleted[0]) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
