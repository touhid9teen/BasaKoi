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
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const neLat = parseFloat(searchParams.get("ne_lat") || "");
    const neLng = parseFloat(searchParams.get("ne_lng") || "");
    const swLat = parseFloat(searchParams.get("sw_lat") || "");
    const swLng = parseFloat(searchParams.get("sw_lng") || "");
    const status = searchParams.get("status") || "available";

    if (!neLat || !neLng || !swLat || !swLng || isNaN(neLat) || isNaN(neLng) || isNaN(swLat) || isNaN(swLng)) {
      return NextResponse.json(
        { error: "Missing or invalid bounding box parameters. Required: ne_lat, ne_lng, sw_lat, sw_lng" },
        { status: 400 }
      );
    }

    const sql = getSql();

    const rows = (await sql`
      SELECT
        id, title, accommodation_type, rent_amount, service_charge,
        service_charge_included, available_from, tenant_type,
        lat, lng, address, bachelor_allowed, gas_type,
        lift_available, bedrooms, bathroom, description,
        phone, special_instructions, status, user_id, created_at
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
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const {
      title,
      accommodation_type,
      rent_amount,
      lat,
      lng,
      service_charge_included,
      available_from,
      tenant_type,
      bachelor_allowed,
      gas_type,
      lift_available,
      bedrooms,
      bathroom,
      description,
      phone,
      special_instructions,
    } = body as {
      title: string;
      accommodation_type?: string;
      rent_amount: number;
      lat: number;
      lng: number;
      service_charge_included?: boolean;
      available_from?: string;
      tenant_type?: string;
      bachelor_allowed?: boolean;
      gas_type?: string;
      lift_available?: boolean;
      bedrooms?: number;
      bathroom?: number;
      description?: string;
      phone?: string;
      special_instructions?: string;
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

    // service_charge_included boolean tracks if rent includes charges
    const serviceCharge = 0;

    const rows = (await sql`
      INSERT INTO properties (
        title, accommodation_type, rent_amount, service_charge, service_charge_included,
        available_from, tenant_type, lat, lng, address, bachelor_allowed, gas_type,
        lift_available, bedrooms, bathroom, description, phone, special_instructions
      ) VALUES (
        ${title}, ${accommodation_type ?? null}, ${rent_amount}, ${serviceCharge},
        ${service_charge_included ?? false}, ${available_from ?? null}, ${tenant_type ?? null},
        ${lat}, ${lng}, ${null}, ${bachelor_allowed ?? false}, ${gas_type ?? "natural"},
        ${lift_available ?? false}, ${bedrooms ?? 1}, ${bathroom ?? 1},
        ${description ?? null}, ${phone ?? null}, ${special_instructions ?? null}
      )
      RETURNING
        id, title, accommodation_type, rent_amount, service_charge,
        service_charge_included, available_from, tenant_type,
        lat, lng, address, bachelor_allowed, gas_type,
        lift_available, bedrooms, bathroom, description,
        phone, special_instructions, status, user_id, created_at
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
