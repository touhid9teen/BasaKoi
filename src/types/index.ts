export type PropertyStatus = "available" | "rented_out";
export type GasType = "natural" | "cylinder" | "none";
export type MapMode = "idle" | "add-rent" | "find-rent";

export interface Property {
  id: string;
  title: string;
  rent_amount: number;
  lat: number;
  lng: number;
  address: string | null;
  bachelor_allowed: boolean | null;
  gas_type: GasType | null;
  bedrooms: number | null;
  description: string | null;
  status: PropertyStatus;
  user_id: string | null;
  created_at: string;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface PropertyFormData {
  title: string;
  rent_amount: number;
  bachelor_allowed: boolean;
  gas_type: GasType;
  bedrooms: number;
  description: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

/** WebSocket realtime message types */
export interface RealtimeMessage {
  type: "property-created" | "property-updated" | "property-deleted" | "connected";
  property?: Property;
  propertyId?: string;
  clientCount?: number;
}
