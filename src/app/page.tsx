"use client";

import { useCallback, useRef, useState, useMemo } from "react";

import MapContainer, {
  type MapContainerHandle,
} from "@/components/map/MapContainer";
import FloatingActionButtons from "@/components/layout/FloatingActionButtons";
import AddRentOverlay from "@/components/layout/AddRentOverlay";
import PropertyPreviewCard from "@/components/layout/PropertyPreviewCard";
import FindFilterBar, {
  type FilterKey,
} from "@/components/layout/FindFilterBar";

import type {
  GeoLocation,
  MapMode,
  Property,
  PropertyFormData,
  RealtimeMessage,
} from "@/types";
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
  const [selectedLocation, setSelectedLocation] =
    useState<GeoLocation | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);
  const [markerOpacity, setMarkerOpacity] = useState(1);
  const [filterKey, setFilterKey] = useState<FilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const mapRef = useRef<MapContainerHandle>(null);
  const modeRef = useRef(mode);
  const lastFetchedBoundsRef = useRef<Bounds | null>(null);
  const lastFetchTimeRef = useRef(0);
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  modeRef.current = mode;

  // ---------- Filter opacity map: dim non-matching markers (Step 5) ----------
  const filterOpacityMap = useMemo(() => {
    if (filterKey === "all" || modeRef.current !== "find-rent") return {};
    const map: Record<string, number> = {};
    for (const p of properties) {
      map[p.id] = p.tenant_type === filterKey ? 1 : 0.2;
    }
    return map;
  }, [properties, filterKey]);

  // ---------- Fetch properties ----------
  const fetchProperties = useCallback(async (bounds: Bounds) => {
    if (modeRef.current !== "find-rent") return;
    lastFetchedBoundsRef.current = bounds;
    lastFetchTimeRef.current = Date.now();
    setLoading(true);
    try {
      const query = buildBoundsQuery({
        north: bounds.ne_lat,
        south: bounds.sw_lat,
        east: bounds.ne_lng,
        west: bounds.sw_lng,
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
  const handleBoundsChange = useCallback(
    (bounds: Bounds) => {
      if (modeRef.current !== "find-rent") return;
      if (
        lastFetchedBoundsRef.current &&
        boundsEqual(lastFetchedBoundsRef.current, bounds)
      )
        return;
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
      const now = Date.now();
      const elapsed = now - lastFetchTimeRef.current;
      if (elapsed < MIN_FETCH_INTERVAL) {
        fetchTimerRef.current = setTimeout(
          () => fetchProperties(bounds),
          MIN_FETCH_INTERVAL - elapsed + 50
        );
        return;
      }
      fetchTimerRef.current = setTimeout(
        () => fetchProperties(bounds),
        DEBOUNCE_DELAY
      );
    },
    [fetchProperties]
  );

  // ---------- WebSocket realtime ----------
  useRealtime(
    useCallback((msg: RealtimeMessage) => {
      if (modeRef.current !== "find-rent") return;
      if (msg.type === "property-created" && msg.property?.status === "available") {
        setProperties((prev) =>
          prev.some((p) => p.id === msg.property!.id)
            ? prev
            : [msg.property!, ...prev]
        );
      }
      if (msg.type === "property-updated" && msg.property) {
        setProperties((prev) =>
          prev.map((p) =>
            p.id === msg.property!.id ? msg.property! : p
          )
        );
      }
      if (msg.type === "property-deleted" && msg.propertyId) {
        setProperties((prev) =>
          prev.filter((p) => p.id !== msg.propertyId!)
        );
      }
    }, [])
  );

  // ---------- Marker click → show preview card (Step 3) ----------
  const handleMarkerClick = useCallback((property: Property) => {
    setPreviewProperty(property);
    setDetailProperty(null);
    // Fly map to center on the selected pin
    mapRef.current?.flyTo({
      lat: property.lat,
      lng: property.lng,
      zoom: 16,
      duration: 500,
    });
  }, []);

  // ---------- Map click (add-rent mode) ----------
  const handleMapClick = useCallback((lngLat: GeoLocation) => {
    if (modeRef.current === "add-rent") {
      setSelectedLocation(lngLat);
    }
  }, []);

  // ---------- Marker fade for add-rent ----------
  const handleMarkerFade = useCallback((fade: boolean) => {
    setMarkerOpacity(fade ? 0.5 : 1);
  }, []);

  // ---------- Search area (Step 1) ----------
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery
        )},Bangladesh&format=json&limit=1`,
        { headers: { "User-Agent": "BasaKoi/1.0" } }
      );
      const data = await res.json();
      if (data?.[0]?.lat && data?.[0]?.lon) {
        mapRef.current?.flyTo({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          zoom: 15,
          duration: 1200,
        });
      }
    } catch {
      // silent
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  // ---------- Find Near Me (Step 1) ----------
  const handleFindNearMe = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          mapRef.current?.flyTo({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            zoom: 15,
            duration: 1200,
          });
        },
        () => {
          // Fallback to Dhaka
          mapRef.current?.flyTo({
            lat: 23.8103,
            lng: 90.4125,
            zoom: 14,
            duration: 1200,
          });
        }
      );
    }
  }, []);

  // ---------- Mode selection ----------
  const handleFindRent = useCallback(() => {
    setMode("find-rent");
    setSelectedLocation(null);
    setDetailProperty(null);
    setPreviewProperty(null);
    setFilterKey("all");
    lastFetchedBoundsRef.current = null;
    lastFetchTimeRef.current = 0;
  }, []);

  const handleAddRent = useCallback(() => {
    setMode("add-rent");
    setSelectedLocation(null);
    setDetailProperty(null);
    setPreviewProperty(null);
  }, []);

  const handleCancelAddRent = useCallback(() => {
    setMode("idle");
    setSelectedLocation(null);
    setMarkerOpacity(1);
  }, []);

  // ---------- Search location (for AddRent) ----------
  const handleSearchLocation = useCallback(
    async (query: string): Promise<GeoLocation | null> => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query
          )},Bangladesh&format=json&limit=1`,
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
    },
    []
  );

  const handleFlyToLocation = useCallback((location: GeoLocation) => {
    mapRef.current?.flyTo({
      lat: location.lat,
      lng: location.lng,
      zoom: 15,
      duration: 1200,
    });
  }, []);

  // ---------- Submit new property ----------
  const handleSubmitProperty = useCallback(
    async (data: PropertyFormData) => {
      if (!selectedLocation) return;
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create listing");
      }
      setSelectedLocation(null);
      setMode("find-rent");
      setMarkerOpacity(1);
      lastFetchedBoundsRef.current = null;
      lastFetchTimeRef.current = 0;
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
    },
    [selectedLocation, fetchProperties]
  );

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
          markerOpacity={markerOpacity}
          filterOpacityMap={filterOpacityMap}
        />
      </div>

      {/* ===== IDLE MODE: Floating action buttons ===== */}
      {mode === "idle" && (
        <FloatingActionButtons
          onFindRent={handleFindRent}
          onAddRent={handleAddRent}
        />
      )}

      {/* ===== FIND MODE: 6-Step Flow ===== */}

      {/* Step 1: Floating search bar + Find Near Me */}
      {mode === "find-rent" && (
        <div className="pointer-events-none absolute left-1/2 top-6 z-20 w-full max-w-lg -translate-x-1/2 px-4">
          <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-2.5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
            <svg
              className="h-4 w-4 shrink-0 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search area (Mirpur 10, Dhanmondi...)"
              className="flex-1 border-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            <button
              onClick={handleFindNearMe}
              title="Find Near Me"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-all hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
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
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
                />
              </svg>
            </button>
            <button
              onClick={() => setMode("idle")}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Filter bar */}
      {mode === "find-rent" && (
        <div className="absolute left-0 right-0 top-[5.5rem] z-20">
          <FindFilterBar
            activeFilter={filterKey}
            onFilterChange={setFilterKey}
          />
        </div>
      )}

      {/* Step 3 & 4: Preview card / Deep-dive panel */}
      {mode === "find-rent" && previewProperty && (
        <PropertyPreviewCard
          property={previewProperty}
          onClose={() => setPreviewProperty(null)}
        />
      )}

      {/* ===== ADD RENT OVERLAY ===== */}
      {mode === "add-rent" && (
        <AddRentOverlay
          selectedLocation={selectedLocation}
          onCancel={handleCancelAddRent}
          onSubmit={handleSubmitProperty}
          onSearchLocation={handleSearchLocation}
          onFlyToLocation={handleFlyToLocation}
          onMarkerFade={handleMarkerFade}
        />
      )}
    </div>
  );
}
