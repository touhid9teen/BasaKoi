export type PropertyStatus = "available" | "rented_out";
export type GasType = "natural" | "cylinder" | "none";
export type AccommodationType = "full_flat" | "sublet_room";
export type TenantType = "family" | "bachelor_male" | "bachelor_female" | "any";
export type MapMode = "idle" | "add-rent" | "find-rent";

export interface Property {
  id: string;
  title: string;
  accommodation_type: AccommodationType | null;
  rent_amount: number;
  service_charge: number | null;
  service_charge_included: boolean | null;
  available_from: string | null;
  tenant_type: TenantType | null;
  lat: number;
  lng: number;
  address: string | null;
  bachelor_allowed: boolean | null;
  gas_type: GasType | null;
  lift_available: boolean | null;
  bedrooms: number | null;
  bathroom: number | null;
  description: string | null;
  phone: string | null;
  special_instructions: string | null;
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
  accommodation_type: AccommodationType;
  rent_amount: number;
  service_charge_included: boolean;
  tenant_type: TenantType;
  gas_type: GasType;
  lift_available: boolean;
  bedrooms: number;
  bathroom: number;
  description: string;
  phone: string;
  special_instructions: string;
  available_from?: string;
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
