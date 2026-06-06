"use client";

import { useMemo } from "react";
import { Marker, useMap } from "react-map-gl/maplibre";
import Supercluster from "supercluster";
import type { Property } from "@/types";

interface MarkerClusterProps {
  properties: Property[];
  onMarkerClick?: (property: Property) => void;
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

/**
 * MarkerCluster renders clustered pins using Supercluster.
 * Clusters display a count badge; clicking a cluster zooms in to explode it.
 * Individual markers use a green pin style with a hover tooltip.
 */
export default function MarkerCluster({ properties, onMarkerClick }: MarkerClusterProps) {
  const { current: map } = useMap();

  // Build Supercluster index
  const supercluster = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const index = new Supercluster<any, any>({
      radius: 60,
      maxZoom: 16,
    });

    // Build and load points (typed explicitly for our runtime use)
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

  // Get clusters for current viewport
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
          // Render a cluster circle
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
                className="flex items-center justify-center rounded-full bg-emerald-600/90 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 backdrop-blur-sm transition-transform hover:scale-110 hover:bg-emerald-500 cursor-pointer border-2 border-white/30"
                style={{ width: size, height: size }}
              >
                {props.point_count_abbreviated}
              </div>
            </Marker>
          );
        }

        // Render individual property marker
        const property = props.property;
        return (
          <Marker
            key={`marker-${property.id || idx}`}
            longitude={lng}
            latitude={lat}
            onClick={() => onMarkerClick?.(property)}
          >
            <button
              className="group relative flex items-center justify-center"
              title={property.title}
              onClick={(e) => {
                e.stopPropagation();
                onMarkerClick?.(property);
              }}
            >
              {/* Pin shadow */}
              <div className="absolute -bottom-1 left-1/2 h-2 w-4 -translate-x-1/2 rounded-full bg-black/20 blur-sm" />
              {/* Pin body */}
              <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md transition-transform hover:scale-125 hover:bg-emerald-400">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                </svg>
              </div>
              {/* Hover info */}
              <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white shadow-lg group-hover:block">
                ৳{property.rent_amount?.toLocaleString("en-BD")}
              </div>
            </button>
          </Marker>
        );
      })}
    </>
  );
}
