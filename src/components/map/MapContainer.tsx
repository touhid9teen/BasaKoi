"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Map, {
  MapRef,
  Marker,
  NavigationControl,
  GeolocateControl,
  MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import Crosshair from "./Crosshair";
import MarkerCluster from "./MarkerCluster";
import { getMapStyle, BANGLADESH_CENTER, DEFAULT_ZOOM, CITY_ZOOM } from "@/lib/map";
import type { GeoLocation, MapMode, Property } from "@/types";

export interface MapContainerHandle {
  getCenter: () => GeoLocation | null;
  flyTo: (coords: { lat: number; lng: number } & Partial<{ zoom: number; duration: number }>) => void;
}

interface MapContainerProps {
  mode: MapMode;
  properties: Property[];
  selectedLocation: GeoLocation | null;
  onBoundsChange: (bounds: {
    ne_lat: number;
    ne_lng: number;
    sw_lat: number;
    sw_lng: number;
  }) => void;
  onMapClick: (lngLat: GeoLocation) => void;
  onMarkerClick?: (property: Property) => void;
  markerOpacity?: number;
  filterOpacityMap?: Record<string, number>;
}

const MapContainer = forwardRef<MapContainerHandle, MapContainerProps>(
  (
    {
      mode,
      properties,
      selectedLocation,
      onBoundsChange,
      onMapClick,
      onMarkerClick,
      markerOpacity = 1,
      filterOpacityMap = {},
    },
    ref
  ) => {
    const mapRef = useRef<MapRef>(null);
    const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);

    // Expose imperative methods to parent
    useImperativeHandle(
      ref,
      () => ({
        getCenter: () => {
          const map = mapRef.current?.getMap();
          if (!map) return null;
          const center = map.getCenter();
          return { lat: center.lat, lng: center.lng };
        },
        flyTo: (coords) => {
          mapRef.current?.flyTo({
            center: [coords.lng, coords.lat],
            zoom: coords.zoom ?? CITY_ZOOM,
            duration: coords.duration ?? 1500,
          });
        },
      }),
      []
    );

    // When switching to "add-rent" mode, expand and fly to user location
    useEffect(() => {
      if (mode === "add-rent" && userLocation && mapRef.current) {
        mapRef.current.flyTo({
          center: [userLocation.lng, userLocation.lat],
          zoom: CITY_ZOOM,
          duration: 1500,
        });
      }
    }, [mode, userLocation]);

    // Emit bounds when map stops moving
    const handleMapIdle = useCallback(() => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      const bounds = map.getBounds();
      if (!bounds) return;

      onBoundsChange({
        ne_lat: bounds.getNorth(),
        ne_lng: bounds.getEast(),
        sw_lat: bounds.getSouth(),
        sw_lng: bounds.getWest(),
      });
    }, [onBoundsChange]);

    // Handle map click — only in "add-rent" mode
    const handleMapClick = useCallback(
      (e: MapLayerMouseEvent) => {
        if (mode === "add-rent") {
          onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        }
      },
      [mode, onMapClick]
    );

    // Handle geolocation
    const handleGeolocate = useCallback((pos: GeolocationPosition) => {
      const loc: GeoLocation = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      setUserLocation(loc);
    }, []);

    const mapStyle = getMapStyle();

    return (
      <div className="relative h-full w-full">
        <Map
          ref={mapRef}
          mapStyle={mapStyle}
          mapLib={import("maplibre-gl")}
          initialViewState={{
            longitude: BANGLADESH_CENTER.lng,
            latitude: BANGLADESH_CENTER.lat,
            zoom: DEFAULT_ZOOM,
          }}
          onIdle={handleMapIdle}
          onClick={handleMapClick}
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
          reuseMaps
          cursor={mode === "add-rent" ? "crosshair" : "grab"}
          interactiveLayerIds={
            mode === "find-rent" ? ["clusters", "unclustered-point"] : undefined
          }
        >
          {/* Navigation controls */}
          <NavigationControl position="bottom-right" />

          {/* Geolocation control */}
          <GeolocateControl
            position="bottom-right"
            onGeolocate={handleGeolocate}
            trackUserLocation={true}
          />

          {/* Crosshair overlay in "add-rent" mode */}
          {mode === "add-rent" && <Crosshair />}

          {/* Selected location marker (for map click drops) */}
          {selectedLocation && mode === "add-rent" && (
            <Marker
              longitude={selectedLocation.lng}
              latitude={selectedLocation.lat}
              color="#10b981"
              scale={1.2}
            />
          )}

          {/* Property markers in "find-rent" mode */}
          {(mode === "find-rent" || mode === "add-rent") && properties.length > 0 && (
            <MarkerCluster
              properties={properties}
              onMarkerClick={onMarkerClick}
              markerOpacity={markerOpacity}
              filterOpacityMap={filterOpacityMap}
            />
          )}
        </Map>
      </div>
    );
  }
);

MapContainer.displayName = "MapContainer";
export default MapContainer;
