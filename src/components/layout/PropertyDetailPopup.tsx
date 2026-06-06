"use client";

import type { Property } from "@/types";

interface PropertyDetailPopupProps {
  property: Property;
  onClose: () => void;
}

const TENANT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  family: { label: "👨‍👩‍👧‍👧 Family", color: "border-blue-200 bg-blue-50 text-blue-800" },
  bachelor_male: { label: "👤 Bachelor Male", color: "border-indigo-200 bg-indigo-50 text-indigo-800" },
  bachelor_female: { label: "👩 Bachelor Female", color: "border-pink-200 bg-pink-50 text-pink-800" },
  any: { label: "🌟 Anyone", color: "border-emerald-200 bg-emerald-50 text-emerald-800" },
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
        className="pointer-events-auto absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="pointer-events-auto relative mx-4 w-full max-w-sm animate-in slide-in-from-bottom-4 fade-in rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-white p-1.5 text-gray-400 shadow-sm ring-1 ring-gray-200 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-5">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug">{property.title}</h3>
            {property.status === "rented_out" && (
              <span className="shrink-0 rounded-full border-2 border-red-200 bg-red-50 px-3 py-0.5 text-[11px] font-bold text-red-700">Rented</span>
            )}
          </div>

          {/* Chips row */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {accommodationLabel && (
              <span className="inline-flex items-center rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-700">
                {accommodationLabel}
              </span>
            )}
            {tenantInfo && (
              <span className={`inline-flex items-center rounded-lg border-2 px-3 py-1 text-xs font-bold ${tenantInfo.color}`}>
                {tenantInfo.label}
              </span>
            )}
          </div>

          {/* Rent */}
          <p className="mb-1 text-4xl font-black tracking-tight text-emerald-700">
            ৳{property.rent_amount?.toLocaleString("en-BD")}
            <span className="text-sm font-semibold text-gray-400 ml-1">/mo</span>
          </p>

          {/* Service charge */}
          {property.service_charge_included ? (
            <p className="mb-3 text-xs font-bold text-emerald-600 flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              All inclusive — service charge included
            </p>
          ) : property.service_charge && property.service_charge > 0 ? (
            <p className="mb-3 text-xs font-medium text-gray-500">+ ৳{property.service_charge.toLocaleString("en-BD")} service charge extra</p>
          ) : null}

          {/* Details grid */}
          <div className="mb-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {property.bedrooms && (
              <div className="flex flex-col items-center rounded-xl border-2 border-gray-100 bg-gray-50 px-2 py-2.5">
                <span className="text-sm">🛏️</span>
                <span className="mt-0.5 text-xs font-bold text-gray-800">{property.bedrooms}</span>
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Bed</span>
              </div>
            )}
            {property.bathroom && (
              <div className="flex flex-col items-center rounded-xl border-2 border-gray-100 bg-gray-50 px-2 py-2.5">
                <span className="text-sm">🚿</span>
                <span className="mt-0.5 text-xs font-bold text-gray-800">{property.bathroom}</span>
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Bath</span>
              </div>
            )}
            {property.gas_type && property.gas_type !== "none" && (
              <div className="flex flex-col items-center rounded-xl border-2 border-gray-100 bg-gray-50 px-2 py-2.5">
                <span className="text-sm">{property.gas_type === "natural" ? "🔥" : "🫧"}</span>
                <span className="mt-0.5 text-xs font-bold text-gray-800">{property.gas_type === "natural" ? "Gas" : "LPG"}</span>
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Line</span>
              </div>
            )}
            {property.lift_available && (
              <div className="flex flex-col items-center rounded-xl border-2 border-gray-100 bg-gray-50 px-2 py-2.5">
                <span className="text-sm">🛗</span>
                <span className="mt-0.5 text-xs font-bold text-gray-800">Yes</span>
                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Lift</span>
              </div>
            )}
          </div>

          {property.available_from && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border-2 border-emerald-100 bg-emerald-50 px-3 py-1.5">
              <span className="text-xs">📅</span>
              <span className="text-xs font-bold text-emerald-800">Available from {property.available_from}</span>
            </div>
          )}

          {/* Description */}
          {property.description && (
            <p className="mb-3 text-sm leading-relaxed text-gray-600 line-clamp-3 font-medium">{property.description}</p>
          )}

          {/* Special instructions */}
          {property.special_instructions && (
            <div className="mb-3 rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-xs font-bold text-amber-800 mb-0.5">📋 Instructions</p>
              <p className="text-xs font-medium text-amber-700 leading-relaxed">{property.special_instructions}</p>
            </div>
          )}

          {/* Contact & location */}
          <div className="flex items-center justify-between border-t-2 border-gray-100 pt-3 text-xs">
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 font-medium text-gray-500">
                <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {property.address || `${property.lat.toFixed(4)}, ${property.lng.toFixed(4)}`}
              </span>
              {property.phone && (
                <span className="flex items-center gap-1.5 font-bold text-gray-700">
                  <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {property.phone}
                </span>
              )}
            </div>
            <span className="font-medium text-gray-400">{new Date(property.created_at).toLocaleDateString("en-BD")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
