export type AdminPropertyStatus = "available" | "rented_out" | "confirmed" | "paid";

export interface AdminProperty {
  id: string;
  title: string;
  accommodation_type: string | null;
  rent_amount: number;
  service_charge: number | null;
  service_charge_included: boolean | null;
  available_from: string | null;
  tenant_type: string | null;
  lat: number;
  lng: number;
  address: string | null;
  bachelor_allowed: boolean | null;
  gas_type: string | null;
  lift_available: boolean | null;
  bedrooms: number | null;
  bathroom: number | null;
  description: string | null;
  phone: string | null;
  special_instructions: string | null;
  status: AdminPropertyStatus;
  user_id: string | null;
  created_at: string;
}
