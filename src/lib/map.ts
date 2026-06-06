import type { BoundingBox, GeoLocation } from "@/types";

/**
 * Create a bounding box from map viewport corners.
 * Used to filter properties visible within the current map view.
 */
export function getBoundingBox(
  neLat: number,
  neLng: number,
  swLat: number,
  swLng: number
): BoundingBox {
  return {
    north: neLat,
    south: swLat,
    east: neLng,
    west: swLng,
  };
}

/**
 * Build query string for the properties API from a bounding box.
 */
export function buildBoundsQuery(
  bounds: BoundingBox,
  extra?: Record<string, string>
): string {
  const params = new URLSearchParams({
    ne_lat: bounds.north.toString(),
    ne_lng: bounds.east.toString(),
    sw_lat: bounds.south.toString(),
    sw_lng: bounds.west.toString(),
    status: "available",
    ...extra,
  });
  return params.toString();
}

/**
 * Debounce a function call.
 * Used to prevent excessive API calls while the user pans/zooms the map.
 * Uses `any[]` for args to maintain compatibility with concrete callback types.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Default center for Bangladesh (Dhaka).
 */
export const BANGLADESH_CENTER: GeoLocation = {
  lat: 23.685,
  lng: 90.3563,
};

/**
 * Default zoom level for Bangladesh overview.
 */
export const DEFAULT_ZOOM = 7;

/**
 * Zoom level for city-level detail.
 */
export const CITY_ZOOM = 14;

/**
 * Free MapLibre style using OpenStreetMap raster tiles.
 * Can be replaced with a MapTiler or custom style URL for better aesthetics.
 */
export const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster" as const,
      source: "osm",
    },
  ],
};

/**
 * MapTiler style (requires NEXT_PUBLIC_MAPTILER_KEY env var).
 * Styled street view — much more polished than OSM raster.
 * Falls back to OSM style if key is not set.
 */
export function getMapStyle(): typeof OSM_STYLE | string {
  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (mapTilerKey) {
    return `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;
  }
  return OSM_STYLE;
}
