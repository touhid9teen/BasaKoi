import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";

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

const VALID_STATUSES = ["available", "rented_out", "confirmed", "paid"];

/**
 * GET /api/admin/properties
 * Returns all properties (no bounds filtering).
 */
export async function GET() {
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
      ORDER BY created_at DESC
      LIMIT 500
    `) as SqlRow[];

    return NextResponse.json({ properties: rows });
  } catch (error) {
    console.error("Error fetching admin properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/properties
 * Body: { id: string, status: "available" | "rented_out" | "confirmed" | "paid" }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as { id: string; status: string };

    const { id, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const sql = getSql();

    const rows = (await sql`
      UPDATE properties
      SET status = ${status}
      WHERE id = ${id}
      RETURNING
        id, title, accommodation_type, rent_amount, service_charge,
        service_charge_included, available_from, tenant_type,
        lat, lng, address, bachelor_allowed, gas_type,
        lift_available, bedrooms, bathroom, description,
        phone, special_instructions, status, user_id, created_at
    `) as SqlRow[];

    const property = rows[0] as Record<string, unknown> | undefined;

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Broadcast status change to WebSocket clients
    wsBroadcast({ type: "property-updated", property });

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Error updating property status:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/properties
 * Query: ?id=...
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      );
    }

    const sql = getSql();

    const rows = (await sql`
      DELETE FROM properties WHERE id = ${id}
      RETURNING id
    `) as SqlRow[];

    const property = rows[0] as { id: string } | undefined;

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Broadcast deletion to WebSocket clients
    wsBroadcast({ type: "property-deleted", propertyId: id });

    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}
