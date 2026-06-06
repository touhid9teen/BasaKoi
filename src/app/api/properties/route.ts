import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import type { Property } from "@/types";

type SqlRow = Record<string, unknown>;

const WS_BROADCAST_URL = `http://${process.env.WS_HOST || "localhost"}:${process.env.WS_PORT || "3001"}/broadcast`;

/** Broadcast a message to WebSocket clients (fire-and-forget) */
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

/**
 * GET /api/properties
 * Query params: ne_lat, ne_lng, sw_lat, sw_lng, status (optional)
 *
 * Uses PostGIS ST_Within to efficiently find properties within the
 * map's current bounding box. Returns only available properties
 * unless a different status is specified.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const neLat = parseFloat(searchParams.get("ne_lat") || "");
    const neLng = parseFloat(searchParams.get("ne_lng") || "");
    const swLat = parseFloat(searchParams.get("sw_lat") || "");
    const swLng = parseFloat(searchParams.get("sw_lng") || "");
    const status = searchParams.get("status") || "available";

    // Validate bounding box params
    if (!neLat || !neLng || !swLat || !swLng || isNaN(neLat) || isNaN(neLng) || isNaN(swLat) || isNaN(swLng)) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid bounding box parameters. Required: ne_lat, ne_lng, sw_lat, sw_lng",
        },
        { status: 400 }
      );
    }

    const sql = getSql();

    // Spatial query using PostGIS
    const rows = (await sql`
      SELECT
        id, title, rent_amount, lat, lng,
        address, bachelor_allowed, gas_type,
        bedrooms, description, status, user_id, created_at
      FROM properties
      WHERE
        status = ${status} AND
        ST_Within(
          geom,
          ST_MakeEnvelope(${swLng}, ${swLat}, ${neLng}, ${neLat}, 4326)
        )
      ORDER BY created_at DESC
      LIMIT 200
    `) as SqlRow[];

    return NextResponse.json({ properties: rows as unknown as Property[] });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/properties
 * Body: { title, rent_amount, lat, lng, bachelor_allowed, gas_type, bedrooms, description }
 *
 * Creates a new property listing. The geom field is auto-populated via DB trigger.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const {
      title,
      rent_amount,
      lat,
      lng,
      bachelor_allowed,
      gas_type,
      bedrooms,
      description,
    } = body as {
      title: string;
      rent_amount: number;
      lat: number;
      lng: number;
      bachelor_allowed?: boolean;
      gas_type?: string;
      bedrooms?: number;
      description?: string;
    };

    // Validate required fields
    if (!title || !rent_amount || !lat || !lng) {
      return NextResponse.json(
        { error: "Missing required fields: title, rent_amount, lat, lng" },
        { status: 400 }
      );
    }

    // Validate coordinates (Bangladesh rough bounds)
    if (lat < 20.5 || lat > 26.8 || lng < 88 || lng > 92.7) {
      return NextResponse.json(
        { error: "Coordinates appear to be outside Bangladesh bounds" },
        { status: 400 }
      );
    }

    const sql = getSql();

    // Insert into database (geom is auto-set by trigger)
    const rows = (await sql`
      INSERT INTO properties (
        title, rent_amount, lat, lng, address,
        bachelor_allowed, gas_type, bedrooms, description
      ) VALUES (
        ${title}, ${rent_amount}, ${lat}, ${lng}, ${null},
        ${bachelor_allowed ?? false}, ${gas_type ?? "natural"},
        ${bedrooms ?? 1}, ${description ?? null}
      )
      RETURNING
        id, title, rent_amount, lat, lng, address,
        bachelor_allowed, gas_type, bedrooms, description,
        status, user_id, created_at
    `) as SqlRow[];

    const property = rows[0] as unknown as Property | undefined;

    // Broadcast to WebSocket clients
    wsBroadcast({ type: "property-created", property });

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}
