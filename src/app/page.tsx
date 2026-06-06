"use client";

import { useCallback, useRef, useState } from "react";

import MapContainer, {
  type MapContainerHandle,
} from "@/components/map/MapContainer";
import FloatingActionButtons from "@/components/layout/FloatingActionButtons";
import AddRentOverlay from "@/components/layout/AddRentOverlay";
import PropertyDetailPopup from "@/components/layout/PropertyDetailPopup";

import type { GeoLocation, MapMode, Property, PropertyFormData, RealtimeMessage } from "@/types";
import { buildBoundsQuery } from "@/lib/map";
import { useRealtime } from "@/lib/realtime";

type Bounds = {
  ne_lat: number;
  ne_lng: number;
  sw_lat: number;
  sw_lng: number;
};

function boundsEqual(a: Bounds, b: Bounds): boolean {
  return (
    Math.abs(a.ne_lat - b.ne_lat) < 0.01 &&
    Math.abs(a.ne_lng - b.ne_lng) < 0.01 &&
    Math.abs(a.sw_lat - b.sw_lat) < 0.01 &&
    Math.abs(a.sw_lng - b.sw_lng) < 0.01
  );
}

const MIN_FETCH_INTERVAL = 2000;
const DEBOUNCE_DELAY = 600;

export default function Home() {
  const [mode, setMode] = useState<MapMode>("idle");
  const [selectedLocation, setSelectedLocation] = useState<GeoLocation | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);

  const mapRef = useRef<MapContainerHandle>(null);
  const modeRef = useRef(mode);
  const lastFetchedBoundsRef = useRef<Bounds | null>(null);
  const lastFetchTimeRef = useRef(0);
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  modeRef.current = mode;

  // ---------- Fetch properties within bounding box ----------
  const fetchProperties = useCallback(async (bounds: Bounds) => {
    if (modeRef.current !== "find-rent") return;
    lastFetchedBoundsRef.current = bounds;
    lastFetchTimeRef.current = Date.now();
    setLoading(true);
    try {
      const query = buildBoundsQuery({
        north: bounds.ne_lat, south: bounds.sw_lat,
        east: bounds.ne_lng, west: bounds.sw_lng,
      });
      const res = await fetch(`/api/properties?${query}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- Handle bounds change ----------
  const handleBoundsChange = useCallback((bounds: Bounds) => {
    if (modeRef.current !== "find-rent") return;
    if (lastFetchedBoundsRef.current && boundsEqual(lastFetchedBoundsRef.current, bounds)) return;
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    const now = Date.now();
    const elapsed = now - lastFetchTimeRef.current;
    if (elapsed < MIN_FETCH_INTERVAL) {
      fetchTimerRef.current = setTimeout(() => fetchProperties(bounds), MIN_FETCH_INTERVAL - elapsed + 50);
      return;
    }
    fetchTimerRef.current = setTimeout(() => fetchProperties(bounds), DEBOUNCE_DELAY);
  }, [fetchProperties]);

  // ---------- WebSocket realtime ----------
  useRealtime(useCallback((msg: RealtimeMessage) => {
    if (modeRef.current !== "find-rent") return;
    if (msg.type === "property-created" && msg.property?.status === "available") {
      setProperties((prev) => prev.some((p) => p.id === msg.property!.id) ? prev : [msg.property!, ...prev]);
    }
    if (msg.type === "property-updated" && msg.property) {
      setProperties((prev) => prev.map((p) => p.id === msg.property!.id ? msg.property! : p));
    }
    if (msg.type === "property-deleted" && msg.propertyId) {
      setProperties((prev) => prev.filter((p) => p.id !== msg.propertyId!));
    }
  }, []));

  // ---------- Marker click (find mode) ----------
  const handleMarkerClick = useCallback((property: Property) => {
    setDetailProperty(property);
  }, []);

  // ---------- Map click (add-rent mode: drop pin) ----------
  const handleMapClick = useCallback((lngLat: GeoLocation) => {
    if (modeRef.current === "add-rent") {
      setSelectedLocation(lngLat);
    }
  }, []);

  // ---------- Mode selection ----------
  const handleFindRent = useCallback(() => {
    setMode("find-rent");
    setSelectedLocation(null);
    setDetailProperty(null);
    lastFetchedBoundsRef.current = null;
    lastFetchTimeRef.current = 0;
  }, []);

  const handleAddRent = useCallback(() => {
    setMode("add-rent");
    setSelectedLocation(null);
    setDetailProperty(null);
  }, []);

  // ---------- Cancel add rent ----------
  const handleCancelAddRent = useCallback(() => {
    setMode("idle");
    setSelectedLocation(null);
  }, []);

  // ---------- Search location via Nominatim geocoding (returns result, does NOT fly) ----------
  const handleSearchLocation = useCallback(async (query: string): Promise<GeoLocation | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)},Bangladesh&format=json&limit=1`,
        { headers: { "User-Agent": "BasaKoi/1.0" } }
      );
      const data = await res.json();
      if (data?.[0]?.lat && data?.[0]?.lon) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // ---------- Confirm searched location — fly map to it ----------
  const handleConfirmLocation = useCallback((location: GeoLocation) => {
    mapRef.current?.flyTo({ lat: location.lat, lng: location.lng, zoom: 15, duration: 1200 });
  }, []);

  // ---------- Submit new property ----------
  const handleSubmitProperty = useCallback(async (data: PropertyFormData) => {
    if (!selectedLocation) return;
    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, lat: selectedLocation.lat, lng: selectedLocation.lng }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create listing");
    }
    setSelectedLocation(null);
    setMode("find-rent");
    lastFetchedBoundsRef.current = null;
    lastFetchTimeRef.current = 0;
    // Trigger fetch immediately
    const center = mapRef.current?.getCenter();
    if (center && lastFetchedBoundsRef.current === null) {
      const b = {
        ne_lat: center.lat + 0.05,
        ne_lng: center.lng + 0.05,
        sw_lat: center.lat - 0.05,
        sw_lng: center.lng - 0.05,
      };
      fetchProperties(b);
    }
  }, [selectedLocation, fetchProperties]);

  // ---------- Show mode selector if idle ----------
  const showModeSelector = mode === "idle";

  return (
    <div className="h-full w-full overflow-hidden bg-black">
      {/* Full-screen map */}
      <div className="absolute inset-0">
        <MapContainer
          ref={mapRef}
          mode={mode}
          properties={properties}
          selectedLocation={mode === "add-rent" ? selectedLocation : null}
          onBoundsChange={handleBoundsChange}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
        />
      </div>

      {/* Mode selector: floating buttons when idle */}
      {showModeSelector && (
        <FloatingActionButtons
          onFindRent={handleFindRent}
          onAddRent={handleAddRent}
        />
      )}

      {/* Find mode: notification to tap markers */}
      {mode === "find-rent" && !detailProperty && (
        <div className="pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2">
          <div className="pointer-events-auto rounded-full bg-white/90 px-5 py-2.5 text-sm font-medium text-emerald-700 shadow-lg backdrop-blur-sm ring-1 ring-emerald-200/50">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              Tap a pin to see rental details
            </span>
          </div>
        </div>
      )}

      {/* Find mode: back button */}
      {mode === "find-rent" && (
        <button
          onClick={() => setMode("idle")}
          className="absolute left-4 top-6 z-20 rounded-full bg-white/80 p-2.5 text-gray-500 shadow-lg backdrop-blur-sm hover:bg-white hover:text-gray-700 transition-all ring-1 ring-black/5"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
      )}

      {/* Add rent overlay */}
      {mode === "add-rent" && (
        <AddRentOverlay
          selectedLocation={selectedLocation}
          onCancel={handleCancelAddRent}
          onSubmit={handleSubmitProperty}
          onSearchLocation={handleSearchLocation}
          onConfirmLocation={handleConfirmLocation}
        />
      )}

      {/* Property detail popup */}
      {detailProperty && (
        <PropertyDetailPopup
          property={detailProperty}
          onClose={() => setDetailProperty(null)}
        />
      )}
    </div>
  );
}
