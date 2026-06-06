import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

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
 * GET /api/properties/:id
 *
 * Return a single property by ID.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
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

    const property = rows[0] as Record<string, unknown> | undefined;

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ property });
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/properties/:id
 * Body: { status: "rented_out" | "available", user_id?: string }
 *
 * Mark a property as rented out or available.
 * Ownership check: user_id is compared against the property's user_id.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, user_id } = body;

    if (!status || !["available", "rented_out"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'available' or 'rented_out'" },
        { status: 400 }
      );
    }

    const sql = getSql();

    // If user_id provided, verify ownership
    if (user_id) {
      const existingRows = (await sql`
        SELECT user_id FROM properties WHERE id = ${id}
      `) as SqlRow[];

      const existing = existingRows[0] as { user_id: string | null } | undefined;

      if (!existing) {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 }
        );
      }

      if (existing.user_id && existing.user_id !== user_id) {
        return NextResponse.json(
          { error: "You don't have permission to update this property" },
          { status: 403 }
        );
      }
    }

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
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/properties/:id
 * Body: { user_id: string } (for ownership verification)
 *
 * Delete a property. Requires user_id to verify ownership.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { user_id } = body;

    const sql = getSql();

    // Verify ownership
    if (user_id) {
      const existingRows = (await sql`
        SELECT user_id FROM properties WHERE id = ${id}
      `) as SqlRow[];

      const existing = existingRows[0] as { user_id: string | null } | undefined;

      if (!existing) {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 }
        );
      }

      if (existing.user_id && existing.user_id !== user_id) {
        return NextResponse.json(
          { error: "You don't have permission to delete this property" },
          { status: 403 }
        );
      }
    }

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
