"use client";

import type { Property } from "@/types";

interface PropertyDetailPopupProps {
  property: Property;
  onClose: () => void;
}

const TENANT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  family: { label: "👨‍👩‍👧‍👧 Family", color: "bg-blue-100 text-blue-700" },
  bachelor_male: { label: "👤 Bachelor Male", color: "bg-indigo-100 text-indigo-700" },
  bachelor_female: { label: "👩 Bachelor Female", color: "bg-pink-100 text-pink-700" },
  any: { label: "🌟 Anyone", color: "bg-emerald-100 text-emerald-700" },
};

const ACCOMMODATION_LABELS: Record<string, string> = {
  full_flat: "🏢 Full Flat",
  sublet_room: "🚪 Sublet Room",
};

const GAS_LABELS: Record<string, string> = {
  natural: "🔥 Line Gas",
  cylinder: "🫧 LPG Cylinder",
  none: "🚫 No Gas",
};

export default function PropertyDetailPopup({
  property,
  onClose,
}: PropertyDetailPopupProps) {
  const tenantInfo = property.tenant_type ? TENANT_TYPE_LABELS[property.tenant_type] : null;
  const accommodationLabel = property.accommodation_type ? ACCOMMODATION_LABELS[property.accommodation_type] : null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center pb-6 sm:items-center sm:pb-0">
      {/* Backdrop */}
      <div
        className="pointer-events-auto absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="pointer-events-auto relative mx-4 w-full max-w-sm animate-in slide-in-from-bottom-4 fade-in rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/80 p-1.5 text-gray-400 shadow-sm backdrop-blur-sm hover:bg-white hover:text-gray-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-5">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="text-base font-bold text-gray-800 line-clamp-2">{property.title}</h3>
            {property.status === "rented_out" && (
              <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-semibold text-red-600">Rented</span>
            )}
          </div>

          {/* Accommodation type & tenant type chips */}
          <div className="mb-2 flex flex-wrap gap-1.5">
            {accommodationLabel && (
              <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                {accommodationLabel}
              </span>
            )}
            {tenantInfo && (
              <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold ${tenantInfo.color}`}>
                {tenantInfo.label}
              </span>
            )}
          </div>

          {/* Rent */}
          <p className="mb-1 text-3xl font-bold tracking-tight text-emerald-600">
            ৳{property.rent_amount?.toLocaleString("en-BD")}
            <span className="text-sm font-normal text-gray-400">/mo</span>
          </p>

          {/* Service charge info */}
          {property.service_charge_included ? (
            <p className="mb-3 text-xs text-emerald-500 font-medium">✅ All inclusive (service charge included)</p>
          ) : property.service_charge && property.service_charge > 0 ? (
            <p className="mb-3 text-xs text-gray-400">+ ৳{property.service_charge.toLocaleString("en-BD")} service charge extra</p>
          ) : null}

          {/* Details row */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {property.bedrooms && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                🛏️ {property.bedrooms} Bed
              </span>
            )}
            {property.bathroom && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                🚿 {property.bathroom} Bath
              </span>
            )}
            {property.gas_type && property.gas_type !== "none" && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                {GAS_LABELS[property.gas_type]}
              </span>
            )}
            {property.lift_available && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                🛗 Lift
              </span>
            )}
            {property.available_from && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                📅 {property.available_from}
              </span>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <p className="mb-3 text-sm leading-relaxed text-gray-500 line-clamp-3">{property.description}</p>
          )}

          {/* Special instructions */}
          {property.special_instructions && (
            <div className="mb-3 rounded-xl bg-amber-50 px-3 py-2">
              <p className="text-[11px] font-medium text-amber-700">📋 Instructions</p>
              <p className="mt-0.5 text-xs text-amber-600">{property.special_instructions}</p>
            </div>
          )}

          {/* Contact & location */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-400">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {property.address || `${property.lat.toFixed(4)}, ${property.lng.toFixed(4)}`}
              </span>
              {property.phone && (
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {property.phone}
                </span>
              )}
            </div>
            <span>{new Date(property.created_at).toLocaleDateString("en-BD")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
