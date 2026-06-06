"use client";

import { useMemo } from "react";
import { Marker, useMap } from "react-map-gl/maplibre";
import Supercluster from "supercluster";
import type { Property } from "@/types";

interface MarkerClusterProps {
  properties: Property[];
  onMarkerClick?: (property: Property) => void;
  markerOpacity?: number;
  filterOpacityMap?: Record<string, number>;
  showPriceLabels?: boolean;
}

interface ClusterPointProperties {
  cluster: true;
  cluster_id: number;
  point_count: number;
  point_count_abbreviated: string | number;
}

interface MarkerPointProperties {
  cluster: false;
  cluster_id: number;
  point_count: number;
  point_count_abbreviated: string | number;
  property: Property;
}

type PointProperties = ClusterPointProperties | MarkerPointProperties;

function formatPrice(amount: number): string {
  if (amount >= 1000) {
    const k = Math.round(amount / 1000);
    return `${k}k`;
  }
  return `${amount}`;
}

export default function MarkerCluster({
  properties,
  onMarkerClick,
  markerOpacity = 1,
  filterOpacityMap = {},
  showPriceLabels = true,
}: MarkerClusterProps) {
  const { current: map } = useMap();

  const supercluster = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const index = new Supercluster<any, any>({
      radius: 60,
      maxZoom: 16,
    });

    const points = properties.map((p) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [p.lng, p.lat],
      },
      properties: {
        cluster: false,
        cluster_id: 0,
        point_count: 0,
        point_count_abbreviated: "",
        property: p,
      },
    }));

    index.load(points);
    return index;
  }, [properties]);

  const clusters = useMemo(() => {
    if (!map) return [];

    const bounds = map.getBounds();
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];
    const zoom = Math.floor(map.getZoom());

    return supercluster.getClusters(bbox, zoom) as Supercluster.PointFeature<PointProperties>[];
  }, [map, supercluster]);

  const handleClusterClick = (clusterId: number, coordinates: [number, number]) => {
    const expansionZoom = supercluster.getClusterExpansionZoom(clusterId);
    map?.flyTo({
      center: coordinates,
      zoom: expansionZoom,
      duration: 500,
    });
  };

  return (
    <>
      {clusters.map((feature, idx) => {
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties;

        if (props.cluster) {
          const count = props.point_count;
          const size = Math.min(20 + Math.log10(count) * 8, 50);
          return (
            <Marker
              key={`cluster-${props.cluster_id}-${idx}`}
              longitude={lng}
              latitude={lat}
              onClick={() => handleClusterClick(props.cluster_id, [lng, lat])}
            >
              <div
                className="flex items-center justify-center rounded-full bg-emerald-600/90 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 backdrop-blur-sm transition-all hover:scale-110 hover:bg-emerald-500 cursor-pointer border-2 border-white/30"
                style={{
                  width: size,
                  height: size,
                  opacity: markerOpacity,
                  transition: "opacity 0.3s ease",
                }}
              >
                {props.point_count_abbreviated}
              </div>
            </Marker>
          );
        }

        const property = props.property;
        const individualOpacity = filterOpacityMap[property.id] ?? markerOpacity;

        return (
          <Marker
            key={`marker-${property.id || idx}`}
            longitude={lng}
            latitude={lat}
            onClick={() => onMarkerClick?.(property)}
          >
            <button
              className="group relative flex flex-col items-center"
              title={property.title}
              onClick={(e) => {
                e.stopPropagation();
                onMarkerClick?.(property);
              }}
              style={{ opacity: individualOpacity, transition: "opacity 0.3s ease" }}
            >
              {/* Price label pin — larger, bolder, more visible */}
              {showPriceLabels ? (
                <div className="flex items-center gap-1 rounded-full bg-emerald-600 px-3.5 py-1.5 text-sm font-extrabold text-white shadow-lg ring-2 ring-white drop-shadow-md transition-all hover:scale-125 hover:bg-emerald-500 hover:shadow-xl">
                  <span className="text-emerald-200 text-xs">৳</span>
                  <span className="tracking-tight">{formatPrice(property.rent_amount || 0)}</span>
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-transform hover:scale-125 hover:bg-emerald-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                  </svg>
                </div>
              )}

              {/* Pointer arrow — thicker */}
              <div className="h-2 w-2 rotate-45 rounded-sm bg-emerald-600 -mt-1 shadow-sm" />
            </button>
          </Marker>
        );
      })}
    </>
  );
}
