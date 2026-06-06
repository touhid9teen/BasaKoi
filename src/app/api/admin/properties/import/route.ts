import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import * as XLSX from "xlsx";

type SqlRow = Record<string, unknown>;

const WS_BROADCAST_URL = `http://${process.env.WS_HOST || "localhost"}:${process.env.WS_PORT || "3001"}/broadcast`;

async function wsBroadcast(msg: object) {
  try {
    await fetch(WS_BROADCAST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
      signal: AbortSignal.timeout(500),
    });
  } catch {
    // WS server may not be running — silent fail
  }
}

interface ImportRow {
  title: string;
  rent_amount?: number | string;
  lat?: number | string;
  lng?: number | string;
  accommodation_type?: string;
  service_charge?: number | string;
  service_charge_included?: boolean | string;
  available_from?: string;
  tenant_type?: string;
  address?: string;
  bachelor_allowed?: boolean | string;
  gas_type?: string;
  lift_available?: boolean | string;
  bedrooms?: number | string;
  bathroom?: number | string;
  description?: string;
  phone?: string;
  special_instructions?: string;
  status?: string;
  image_urls?: string;  // comma-separated URLs or JSON array
  video_urls?: string;  // comma-separated URLs or JSON array
  [key: string]: unknown;
}

/**
 * Normalize a value from the import — handles Excel serial numbers for dates etc.
 */
function normalizeVal(val: unknown): unknown {
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed === "" || trimmed === "-") return null;
    return trimmed;
  }
  return val;
}

/**
 * Parse Excel date serial number to YYYY-MM-DD string
 */
function excelDateToStr(val: unknown): string | null {
  if (typeof val === "number" && val > 40000 && val < 60000) {
    // Excel serial date number
    const date = XLSX.SSF.parse_date_code(val);
    if (date) {
      return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
    }
  }
  return typeof val === "string" ? val.trim() || null : null;
}

/**
 * POST /api/admin/properties/import
 * Accepts multipart form data with a 'file' field (JSON or XLSX) or JSON body with a 'properties' array.
 */
export async function POST(request: NextRequest) {
  try {
    let rows: ImportRow[] = [];
    let importSource = "";

    // Detect content type
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // File upload
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided. Upload a .json or .xlsx file." },
          { status: 400 }
        );
      }

      const fileName = file.name.toLowerCase();
      const buffer = Buffer.from(await file.arrayBuffer());

      if (fileName.endsWith(".json")) {
        const text = buffer.toString("utf-8");
        const parsed = JSON.parse(text);
        rows = Array.isArray(parsed) ? parsed : parsed.properties || parsed.data || [];
        importSource = `JSON file (${rows.length} entries)`;
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          return NextResponse.json(
            { error: "Excel file has no sheets" },
            { status: 400 }
          );
        }
        const sheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json<ImportRow>(sheet);
        importSource = `Excel file "${fileName}" (${rows.length} rows from sheet "${sheetName}")`;
      } else {
        return NextResponse.json(
          { error: "Unsupported file format. Upload .json or .xlsx files only." },
          { status: 400 }
        );
      }
    } else {
      // JSON body with properties array
      const body = await request.json();
      rows = Array.isArray(body) ? body : body.properties || [];
      importSource = `JSON payload (${rows.length} entries)`;
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No valid property entries found in the import data." },
        { status: 400 }
      );
    }

    if (rows.length > 200) {
      return NextResponse.json(
        { error: `Too many entries (${rows.length}). Maximum is 200 per import.` },
        { status: 400 }
      );
    }

    const sql = getSql();
    const results: { index: number; title: string; success: boolean; error?: string }[] = [];
    let insertedCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      const result: { index: number; title: string; success: boolean; error?: string } = {
        index: i + 1,
        title: String(normalizeVal(raw.title) || `Import #${i + 1}`),
        success: false,
      };

      try {
        // Required fields
        const title = String(normalizeVal(raw.title) || `Property ${i + 1}`).trim();
        const rentAmount = Number(normalizeVal(raw.rent_amount) ?? 0);
        const lat = Number(normalizeVal(raw.lat) ?? 0);
        const lng = Number(normalizeVal(raw.lng) ?? 0);

        if (!title || !rentAmount || !lat || !lng) {
          throw new Error(
            `Missing required fields: title="${title}", rent_amount=${rentAmount}, lat=${lat}, lng=${lng}`
          );
        }

        if (lat < 20.5 || lat > 26.8 || lng < 88 || lng > 92.7) {
          throw new Error(
            `Coordinates (${lat}, ${lng}) outside Bangladesh bounds`
          );
        }

        const status = String(normalizeVal(raw.status) || "available");
        const validStatuses = ["available", "rented_out", "confirmed", "paid"];
        const finalStatus = validStatuses.includes(status) ? status : "available";

        const normalized = {
          title,
          rent_amount: rentAmount,
          lat,
          lng,
          accommodation_type: String(normalizeVal(raw.accommodation_type) || "full_flat"),
          service_charge: Number(normalizeVal(raw.service_charge) ?? 0),
          service_charge_included: normalizeVal(raw.service_charge_included) === true || normalizeVal(raw.service_charge_included) === "true" || normalizeVal(raw.service_charge_included) === "yes",
          available_from: excelDateToStr(normalizeVal(raw.available_from)),
          tenant_type: String(normalizeVal(raw.tenant_type) || "any"),
          address: String(normalizeVal(raw.address) || ""),
          bachelor_allowed: normalizeVal(raw.bachelor_allowed) === true || normalizeVal(raw.bachelor_allowed) === "true" || normalizeVal(raw.bachelor_allowed) === "yes",
          gas_type: String(normalizeVal(raw.gas_type) || "natural"),
          lift_available: normalizeVal(raw.lift_available) === true || normalizeVal(raw.lift_available) === "true" || normalizeVal(raw.lift_available) === "yes",
          bedrooms: Math.max(0, Math.floor(Number(normalizeVal(raw.bedrooms) ?? 1))),
          bathroom: Math.max(0, Math.floor(Number(normalizeVal(raw.bathroom) ?? 1))),
          description: String(normalizeVal(raw.description) || ""),
          phone: String(normalizeVal(raw.phone) || ""),
          special_instructions: String(normalizeVal(raw.special_instructions) || ""),
        };

        const inserted = (await sql`
          INSERT INTO properties (
            title, accommodation_type, rent_amount, service_charge, service_charge_included,
            available_from, tenant_type, lat, lng, address, bachelor_allowed, gas_type,
            lift_available, bedrooms, bathroom, description, phone, special_instructions, status
          ) VALUES (
            ${normalized.title}, ${normalized.accommodation_type}, ${normalized.rent_amount},
            ${normalized.service_charge}, ${normalized.service_charge_included},
            ${normalized.available_from}, ${normalized.tenant_type},
            ${normalized.lat}, ${normalized.lng}, ${normalized.address},
            ${normalized.bachelor_allowed}, ${normalized.gas_type},
            ${normalized.lift_available}, ${normalized.bedrooms}, ${normalized.bathroom},
            ${normalized.description}, ${normalized.phone}, ${normalized.special_instructions},
            ${finalStatus}
          )
          RETURNING id, title
        `) as SqlRow[];

        const insertedProperty = inserted[0] as { id: string; title: string } | undefined;
        if (insertedProperty) {
          result.success = true;
          insertedCount++;
          result.title = insertedProperty.title;

          // Broadcast each new property (fire-and-forget)
          const broadcastProperty = (await sql`
            SELECT
              id, title, accommodation_type, rent_amount, service_charge,
              service_charge_included, available_from, tenant_type,
              lat, lng, address, bachelor_allowed, gas_type,
              lift_available, bedrooms, bathroom, description,
              phone, special_instructions, status, user_id, created_at
            FROM properties WHERE id = ${insertedProperty.id}
          `) as SqlRow[];
          if (broadcastProperty[0]) {
            wsBroadcast({ type: "property-created", property: broadcastProperty[0] });
          }

          // Import media URLs if provided
          const importMediaUrls = (urlsStr: string | undefined, mediaType: "image" | "video") => {
            if (!urlsStr) return;
            try {
              // Try parsing as JSON array first, then fall back to comma-separated
              let urls: string[];
              const trimmed = urlsStr.trim();
              if (trimmed.startsWith("[")) {
                urls = JSON.parse(trimmed);
              } else {
                urls = trimmed.split(",").map((u) => u.trim()).filter(Boolean);
              }
              for (let i = 0; i < Math.min(urls.length, 10); i++) {
                const url = urls[i];
                if (url && (url.startsWith("http") || url.startsWith("data:"))) {
                  sql`
                    INSERT INTO property_media (property_id, media_type, media_url, sort_order)
                    VALUES (${insertedProperty!.id}, ${mediaType}, ${url}, ${i})
                  `.catch(() => {}); // fire-and-forget per media item
                }
              }
            } catch {}
          };

          importMediaUrls(String(normalizeVal(raw.image_urls) || ""), "image");
          importMediaUrls(String(normalizeVal(raw.video_urls) || ""), "video");
        }
      } catch (err) {
        result.error = err instanceof Error ? err.message : "Unknown error";
      }

      results.push(result);
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `Imported ${importSource}. ${successCount} succeeded, ${failCount} failed.`,
      successCount,
      failCount,
      total: rows.length,
      results,
    });
  } catch (error) {
    console.error("Error importing properties:", error);
    return NextResponse.json(
      { error: "Failed to import properties. Check file format and try again." },
      { status: 500 }
    );
  }
}
